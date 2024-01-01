const path = require("path")

const { deployContract, contractAt, sendTxn, processBatch, getFrameSigner } = require("../shared/helpers")
const { expandDecimals, bigNumberify } = require("../../test/shared/utilities")

// const ethPrice = "1211"
// const avaxPrice = "12"
const gmxPrice = 2 // multiplied by 100 to avoid decimals, this is MPX

const shouldSendTxn = true

let fantomFile
if (process.env.FANTOM_FILE) {
  fantomFile = path.join(process.env.PWD, process.env.FANTOM_FILE)
} else {
  fantomFile = path.join(__dirname, "../../distribution-data-fantom.json")
}
console.log("Fantom file: %s", fantomFile)
const fantomData = require(fantomFile)

let baseFile
if (process.env.BASE_FILE) {
  baseFile = path.join(process.env.PWD, process.env.BASE_FILE)
} else {
  baseFile = path.join(__dirname, "../../distribution-data-base.json")
}
console.log("Base file: %s", baseFile)
const baseData = require(baseFile)

const network = 'base';
const tokens = require('../core/tokens')[network];

const { AddressZero } = ethers.constants

async function getFantomValues() {
  const batchSender = await contractAt("BatchSender", "0x90eaa0DB25C569993c80dC5681E6C2981f5C86D9")
  const esGmx = await contractAt("Token", "0xe0f606e6730bE531EeAf42348dE43C2feeD43505")
  const nativeTokenPrice = 18 // FTM price, multiplied by 100 to avoid decimals
  const data = fantomData

  return { batchSender, esGmx, nativeTokenPrice, data }
}

async function getBaseValues() {
  const batchSender = await contractAt("BatchSender", "0xF9a352b7C7B62a852e5C8A64A455246Dd9596461")
  const esGmx = await contractAt("Token", "0x3Ff7AB26F2dfD482C40bDaDfC0e88D01BFf79713") // oBMX placeholder
  const nativeTokenPrice = 230809 // ETH price, multiplied by 100 to avoid decimals
  const data = baseData

  return { batchSender, esGmx, nativeTokenPrice, data }
}

async function getValues() {
  if (network === "fantom") {
    return getFantomValues()
  }

  if (network === "base") {
    return getBaseValues()
  }
}

async function main() {
  const wallet = { address: "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce" }
  const { batchSender, esGmx, nativeTokenPrice, data } = await getValues()
  const { nativeToken } = tokens
  const nativeTokenContract = await contractAt("Token", nativeToken.address)

  const affiliatesData = data.referrers
  const discountsData = data.referrals

  console.log("affiliates", affiliatesData.length)
  console.log("trader discounts", discountsData.length)

  const affiliateRewardsTypeId = 1
  const traderDiscountsTypeId = 2

  let totalAffiliateAmount = bigNumberify(0)
  let totalAffiliateUsd = bigNumberify(0)
  let allAffiliateUsd = bigNumberify(0)
  let totalDiscountAmount = bigNumberify(0)
  let totalDiscountUsd = bigNumberify(0)
  let allDiscountUsd = bigNumberify(0)
  let totalEsGmxAmount = bigNumberify(0)
  const affiliateAccounts = []
  const affiliateAmounts = []
  const discountAccounts = []
  const discountAmounts = []
  const esGmxAccounts = []
  const esGmxAmounts = []

  for (let i = 0; i < affiliatesData.length; i++) {
    const { account, rebateUsd, esgmxRewardsUsd } = affiliatesData[i]
    allAffiliateUsd = allAffiliateUsd.add(rebateUsd)

    if (account === AddressZero) { continue }

    // expanding nativeTokenPrice decimals to 28 instead of 30 since nativeTokenPrice is already multiplied by 100
    const amount = bigNumberify(rebateUsd).mul(expandDecimals(1, 18)).div(expandDecimals(nativeTokenPrice, 28))
    affiliateAccounts.push(account)
    affiliateAmounts.push(amount)
    totalAffiliateAmount = totalAffiliateAmount.add(amount)
    totalAffiliateUsd = totalAffiliateUsd.add(rebateUsd)

    if (esgmxRewardsUsd) {
      // expanding gmxPrice decimals to 28 instead of 30 since gmxPrice is already multiplied by 100
      const esGmxAmount = bigNumberify(esgmxRewardsUsd).mul(expandDecimals(1, 18)).div(expandDecimals(gmxPrice, 28))
      esGmxAccounts.push(account)
      esGmxAmounts.push(esGmxAmount)
      totalEsGmxAmount = totalEsGmxAmount.add(esGmxAmount)
    }
  }

  for (let i = 0; i < discountsData.length; i++) {
    const { account, discountUsd } = discountsData[i]
    allDiscountUsd = allDiscountUsd.add(discountUsd)
    if (account === AddressZero) { continue }

    // expanding nativeTokenPrice decimals to 28 instead of 30 since nativeTokenPrice is already multiplied by 100
    const amount = bigNumberify(discountUsd).mul(expandDecimals(1, 18)).div(expandDecimals(nativeTokenPrice, 28))
    discountAccounts.push(account)
    discountAmounts.push(amount)
    totalDiscountAmount = totalDiscountAmount.add(amount)
    totalDiscountUsd = totalDiscountUsd.add(discountUsd)
  }

  affiliatesData.sort((a, b) => {
    if (bigNumberify(a.rebateUsd).gt(b.rebateUsd)) {
      return -1;
    }
    if (bigNumberify(a.rebateUsd).lt(b.rebateUsd)) {
      return 1;
    }

    return 0;
  })

  console.log("top affiliate", affiliatesData[0].account, affiliatesData[0].rebateUsd)

  const totalNativeAmount = totalAffiliateAmount.add(totalDiscountAmount)
  console.log(`total affiliate rewards (${nativeToken.name})`, ethers.utils.formatUnits(totalAffiliateAmount, 18))
  console.log("total affiliate rewards (USD)", ethers.utils.formatUnits(totalAffiliateUsd, 30))
  console.log("all affiliate rewards (USD)", ethers.utils.formatUnits(allAffiliateUsd, 30))
  console.log(`total trader rebates (${nativeToken.name})`, ethers.utils.formatUnits(totalDiscountAmount, 18))
  console.log("total trader rebates (USD)", ethers.utils.formatUnits(totalDiscountUsd, 30))
  console.log("all trader rebates (USD)", ethers.utils.formatUnits(allDiscountUsd, 30))
  console.log(`total ${nativeToken.name}`, ethers.utils.formatUnits(totalNativeAmount, 18))
  console.log(`total USD`, ethers.utils.formatUnits(totalAffiliateUsd.add(totalDiscountUsd), 30))
  console.log(`total esGmx`, ethers.utils.formatUnits(totalEsGmxAmount, 18))

  const batchSize = 150

  if (shouldSendTxn) {
    // const signer = await getFrameSigner()
    // const nativeTokenForSigner = await contractAt("Token", nativeToken.address, signer)
    // await sendTxn(nativeTokenForSigner.transfer(wallet.address, totalNativeAmount), "nativeTokenForSigner.transfer")

    const printBatch = (currentBatch) => {
      for (let i = 0; i < currentBatch.length; i++) {
        const item = currentBatch[i]
        const account = item[0]
        const amount = item[1]
        console.log(account, ethers.utils.formatUnits(amount, 18))
      }
    }

    await sendTxn(nativeTokenContract.approve(batchSender.address, totalNativeAmount), "nativeToken.approve")

    await processBatch([affiliateAccounts, affiliateAmounts], batchSize, async (currentBatch) => {
      printBatch(currentBatch)

      const accounts = currentBatch.map((item) => item[0])
      const amounts = currentBatch.map((item) => item[1])

      await sendTxn(batchSender.sendAndEmit(nativeToken.address, accounts, amounts, affiliateRewardsTypeId), "batchSender.sendAndEmit(nativeToken, affiliate rewards)")
    })

    await processBatch([discountAccounts, discountAmounts], batchSize, async (currentBatch) => {
      printBatch(currentBatch)

      const accounts = currentBatch.map((item) => item[0])
      const amounts = currentBatch.map((item) => item[1])

      await sendTxn(batchSender.sendAndEmit(nativeToken.address, accounts, amounts, traderDiscountsTypeId), "batchSender.sendAndEmit(nativeToken, trader rebates)")
    })

    // await sendTxn(esGmx.approve(batchSender.address, totalEsGmxAmount), "esGmx.approve")

    // await processBatch([esGmxAccounts, esGmxAmounts], batchSize, async (currentBatch) => {
    //   printBatch(currentBatch)

    //   const accounts = currentBatch.map((item) => item[0])
    //   const amounts = currentBatch.map((item) => item[1])

    //   await sendTxn(batchSender.sendAndEmit(esGmx.address, accounts, amounts, affiliateRewardsTypeId), "batchSender.sendAndEmit(nativeToken, esGmx affiliate rewards)")
    // })
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
