const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, callWithRetries } = require("../shared/helpers")
const { bigNumberify, expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const network = 'bsc' // set network here
const tokens = require('./tokens')[network];

async function getFantomValues() {
  const positionContracts = [
    "0x26e6C47682FfC1824d7aC5512752FC671dA5e607", // PositionRouter
    "0x366152Fc0FC4680e0A05ce9739a4210228C72BA3" // PositionManager
  ]

  const { ftm, eth, btc } = tokens
  const tokenArr = [ftm, eth, btc]

  return { positionContracts, tokenArr }
}

async function getBscValues() {
  const positionContracts = [
    "0x05D97A8a5eF11010a6A5f89B3D4628ce43092614", // PositionRouter
    "0x06c35893Ba9bc454e12c36F4117BC99f75e34346" // PositionManager
  ]

  const { bnb, eth, btc, xrp, ada } = tokens
  const tokenArr = [bnb, eth, btc, xrp, ada]

  return { positionContracts, tokenArr }
}

async function getValues() {
  if (network === "fantom") {
    return getFantomValues()
  }

  if (network === "bsc") {
    return getBscValues()
  }
}

async function main() {
  const { positionContracts, tokenArr } = await getValues()

  const tokenAddresses = tokenArr.map(t => t.address)
  const longSizes = tokenArr.map((token) => {
    if (!token.maxGlobalLongSize) {
      return bigNumberify(0)
    }

    return expandDecimals(token.maxGlobalLongSize, 30)
  })

  const shortSizes = tokenArr.map((token) => {
    if (!token.maxGlobalShortSize) {
      return bigNumberify(0)
    }

    return expandDecimals(token.maxGlobalShortSize, 30)
  })

  for (let i = 0; i < positionContracts.length; i++) {
    const positionContract = await contractAt("PositionManager", positionContracts[i])
    await sendTxn(positionContract.setMaxGlobalSizes(tokenAddresses, longSizes, shortSizes), "positionContract.setMaxGlobalSizes")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
