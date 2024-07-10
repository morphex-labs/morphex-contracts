const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, callWithRetries } = require("../shared/helpers")
const { bigNumberify, expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const network = 'mode' // set network here
const tokens = require('./tokens')[network];

async function getFantomValues() {
  const positionContracts = [
    "0x5D90059b8116906bF8c1c7B7E3920A4b6e9DF4dB", // PositionRouter
    "0x2F66E711294328587e16E8912ae08bAD979feaAb" // PositionManager
  ]

  const { ftm, axleth, lzeth, axlbtc, lzbtc } = tokens
  const tokenArr = [ftm, axleth, lzeth, axlbtc, lzbtc]

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

async function getBaseValues() {
  const positionContracts = [
    "0x927F9c03d1Ac6e2630d31E614F226b5Ed028d443", // PositionRouter
    "0x2ace8F6Cc1ce4813Bd2D3AcE550ac95810855C40" // PositionManager
  ]

  const { eth, btc, aero, yfi } = tokens
  const tokenArr = [eth, btc, aero, yfi]

  return { positionContracts, tokenArr }
}

async function getModeValues() {
  const positionContracts = [
    "0x6D6ec3bd7c94ab35e7a0a6FdA864EE35eB9fAE04", // PositionRouter
    "0x3CB54f0eB62C371065D739A34a775CC16f46563e" // PositionManager
  ]

  const { eth, weeth, wbtc, mode } = tokens
  const tokenArr = [eth, weeth, wbtc, mode]

  return { positionContracts, tokenArr }
}

async function getValues() {
  if (network === "fantom") {
    return getFantomValues()
  }

  if (network === "bsc") {
    return getBscValues()
  }

  if (network === "base") {
    return getBaseValues()
  }

  if (network === "mode") {
    return getModeValues()
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
