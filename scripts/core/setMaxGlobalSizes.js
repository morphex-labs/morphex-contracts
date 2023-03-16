const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, callWithRetries } = require("../shared/helpers")
const { bigNumberify, expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')['fantom'];

async function getArbValues() {
  const positionContracts = [
    "0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868", // PositionRouter
    "0x75E42e6f01baf1D6022bEa862A28774a9f8a4A0C" // PositionManager
  ]

  const { btc, eth, link, uni } = tokens
  const tokenArr = [btc, eth, link, uni]

  return { positionContracts, tokenArr }
}

async function getAvaxValues() {
  const positionContracts = [
    "0xffF6D276Bc37c61A23f06410Dce4A400f66420f8", // PositionRouter
    "0xA21B83E579f4315951bA658654c371520BDcB866" // PositionManager
  ]

  const { avax, eth, btc, btcb } = tokens
  const tokenArr = [avax, eth, btc, btcb]

  return { positionContracts, tokenArr }
}

async function getValues() {
  if (network === "arbitrum") {
    return getArbValues()
  }

  if (network === "avax") {
    return getAvaxValues()
  }
}

async function main() {
  // const { positionContracts, tokenArr } = await getValues()

  const positionContracts = [
    "0x26e6C47682FfC1824d7aC5512752FC671dA5e607", // PositionRouter
    "0x366152Fc0FC4680e0A05ce9739a4210228C72BA3" // PositionManager
  ]

  const { ftm, eth, btc } = tokens
  const tokenArr = [ftm, eth, btc]

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
