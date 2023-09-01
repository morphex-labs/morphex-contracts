const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const network = 'base';
const tokens = require('./tokens')[network];

async function main() {
  const vault = await contractAt("Vault", "0xec8d8D4b215727f3476FF0ab41c406FA99b4272C")

  const priceFeed = await contractAt("VaultPriceFeed", await vault.priceFeed())
  // const priceFeedGov = await priceFeed.gov()
  // const priceFeedTimelock = await contractAt("Timelock", priceFeedGov, signer)

  const priceFeedMethod = "setTokenConfig"
  // const priceFeedMethod = "signalPriceFeedSetTokenConfig"
  // const priceFeedMethod = "priceFeedSetTokenConfig"

  console.log("vault", vault.address)
  console.log("priceFeed", priceFeed.address)
  // console.log("priceFeedTimelock", priceFeedTimelock.address)
  console.log("priceFeedMethod", priceFeedMethod)

  const { eth, btc, usdc, dai } = tokens
  const tokenArr = [ eth, btc, usdc, dai ]

  for (const token of tokenArr) {
    await sendTxn(priceFeed[priceFeedMethod](
      token.address, // _token
      token.priceFeed, // _priceFeed
      token.priceDecimals, // _priceDecimals
      token.isStrictStable // _isStrictStable
    ), `priceFeed.${priceFeedMethod}(${token.name}) ${token.address}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
