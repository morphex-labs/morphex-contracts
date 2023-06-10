const { deployContract, contractAt, sendTxn, readTmpAddresses, callWithRetries } = require("../shared/helpers")
const { bigNumberify, expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const chain = 'fantom' // set to chain you want to work with

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[chain];

async function getFtmValues() {
  const vault = await contractAt("Vault", "0x3CB54f0eB62C371065D739A34a775CC16f46563e")
  const timelock = await contractAt("Timelock", await vault.gov())
  const reader = await contractAt("Reader", "0x8BC6D6d2cdD68E51a8046F2C570824027842eD8D")

  const { ftm, btc, eth, usdc, usdt, dai } = tokens
  const tokenArr = [ ftm, btc, eth, usdc, usdt, dai ]

  const vaultTokenInfo = await reader.getVaultTokenInfoV2(vault.address, ftm.address, 1, tokenArr.map(t => t.address))

  return { vault, timelock, reader, tokenArr, vaultTokenInfo }
}

async function getBscValues() {
  const vault = await contractAt("Vault", "0x46940Dc651bFe3F2CC3E04cf9dC5579B50Cf0765")
  const timelock = await contractAt("Timelock", await vault.gov())
  const reader = await contractAt("Reader", "0x49A97680938B4F1f73816d1B70C3Ab801FAd124B")

  const { bnb, eth, btc, xrp, ada, cake, usdt, usdc } = tokens
  const tokenArr = [ bnb, eth, btc, xrp, ada, cake, usdt, usdc ]

  const vaultTokenInfo = await reader.getVaultTokenInfoV2(vault.address, bnb.address, 1, tokenArr.map(t => t.address))

  return { vault, timelock, reader, tokenArr, vaultTokenInfo }
}

async function getValues() {
  if (chain === "fantom") {
    return getFtmValues()
  }

  if (chain === "bsc") {
    return getBscValues()
  }
}

async function main() {
  const { vault, timelock, tokenArr, vaultTokenInfo } = await getValues()

  console.log("vault", vault.address)
  console.log("timelock", timelock.address)

  const vaultPropsLength = 14;

  const shouldSendTxn = true

  let totalUsdgAmount = bigNumberify(0)

  for (const [i, tokenItem] of tokenArr.entries()) {
    // console.log('token', tokenItem)
    const token = {}
    token.poolAmount = vaultTokenInfo[i * vaultPropsLength]
    token.reservedAmount = vaultTokenInfo[i * vaultPropsLength + 1]
    token.availableAmount = token.poolAmount.sub(token.reservedAmount)
    token.usdgAmount = vaultTokenInfo[i * vaultPropsLength + 2]
    token.redemptionAmount = vaultTokenInfo[i * vaultPropsLength + 3]
    token.weight = vaultTokenInfo[i * vaultPropsLength + 4]
    token.bufferAmount = vaultTokenInfo[i * vaultPropsLength + 5]
    token.maxUsdgAmount = vaultTokenInfo[i * vaultPropsLength + 6]
    token.globalShortSize = vaultTokenInfo[i * vaultPropsLength + 7]
    token.maxGlobalShortSize = vaultTokenInfo[i * vaultPropsLength + 8]
    token.minPrice = vaultTokenInfo[i * vaultPropsLength + 9]
    token.maxPrice = vaultTokenInfo[i * vaultPropsLength + 10]
    token.guaranteedUsd = vaultTokenInfo[i * vaultPropsLength + 11]

    token.availableUsd = tokenItem.isStable
      ? token.poolAmount
          .mul(token.minPrice)
          .div(expandDecimals(1, tokenItem.decimals))
      : token.availableAmount
          .mul(token.minPrice)
          .div(expandDecimals(1, tokenItem.decimals));

    token.managedUsd = token.availableUsd.add(token.guaranteedUsd);
    token.managedAmount = token.managedUsd
      .mul(expandDecimals(1, tokenItem.decimals))
      .div(token.minPrice);

    let usdgAmount = token.managedUsd.div(expandDecimals(1, 30 - 18))
    totalUsdgAmount = totalUsdgAmount.add(usdgAmount)

    const adjustedMaxUsdgAmount = expandDecimals(tokenItem.maxUsdgAmount, 18)
    if (usdgAmount.gt(adjustedMaxUsdgAmount)) {
      console.warn(`usdgAmount for ${tokenItem.name} was adjusted from ${usdgAmount.toString()} to ${adjustedMaxUsdgAmount.toString()}`)
      usdgAmount = adjustedMaxUsdgAmount
    }

    if (shouldSendTxn) {
      await sendTxn(timelock.setTokenConfig(
        vault.address,
        tokenItem.address, // _token
        tokenItem.tokenWeight, // _tokenWeight
        tokenItem.minProfitBps, // _minProfitBps
        expandDecimals(tokenItem.maxUsdgAmount, 18), // _maxUsdgAmount
        expandDecimals(tokenItem.bufferAmount, tokenItem.decimals), // _bufferAmount
        usdgAmount
      ), `vault.setTokenConfig(${tokenItem.name}) ${tokenItem.address}`)
    }
  }

  console.log("totalUsdgAmount", totalUsdgAmount.toString())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
