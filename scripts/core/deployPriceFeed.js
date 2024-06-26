const { getFrameSigner, deployContract, contractAt , sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')['mode'];

async function getArbValues(signer) {
  const { btc, eth, usdc, link, uni, usdt, mim, frax, dai } = tokens
  const tokenArr = [btc, eth, usdc, link, uni, usdt, mim, frax, dai]
  const fastPriceTokens = [btc, eth, link, uni]

  const priceFeedTimelock = { address: "0x7b1FFdDEEc3C4797079C7ed91057e399e9D43a8B" }

  const updater1 = { address: "0x18eAc44875EC92Ed80EeFAa7fa7Ac957b312D366" }
  const updater2 = { address: "0x2eD9829CFF68c7Bb40812f70c4Fc06A4938845de" }
  const keeper1 = { address: "0xbEe27BD52dB995D3c74Dc11FF32D93a1Aad747f7" }
  const keeper2 = { address: "0x94577665926885f47ddC1Feb322bc51470daA8E8" }
  const updaters = [updater1.address, updater2.address, keeper1.address, keeper2.address]

  const tokenManager = { address: "0x2c247a44928d66041D9F7B11A69d7a84d25207ba" }

  const positionRouter = await contractAt("PositionRouter", "0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868")

  const fastPriceEvents = await contractAt("FastPriceEvents", "0x4530b7DE1958270A2376be192a24175D795e1b07", signer)
  // const fastPriceEvents = await deployContract("FastPriceEvents", [])

  const chainlinkFlags = { address: "0x3C14e07Edd0dC67442FA96f1Ec6999c57E810a83" }

  return {
    fastPriceTokens,
    fastPriceEvents,
    tokenManager,
    positionRouter,
    chainlinkFlags,
    tokenArr,
    updaters,
    priceFeedTimelock
  }
}

async function getAvaxValues(signer) {
  const { avax, btc, btcb, eth, mim, usdce, usdc } = tokens
  const tokenArr = [avax, btc, btcb, eth, mim, usdce, usdc]
  const fastPriceTokens = [avax, btc, btcb, eth]

  const priceFeedTimelock = { address: "0xCa8b5F2fF7B8d452bE8972B44Dc026Be96b97228" }

  const updater1 = { address: "0x2b249Bec7c3A142431b67e63A1dF86F974FAF3aa" }
  const updater2 = { address: "0x63ff41E44d68216e716d236E2ECdd5272611D835" }
  const keeper1 = { address: "0x5e0338CE6597FCB9404d69F4286194A60aD442b7" }
  const keeper2 = { address: "0x8CD98FF48831aa8864314ae8f41337FaE9941C8D" }
  const updaters = [updater1.address, updater2.address, keeper1.address, keeper2.address]

  const tokenManager = { address: "0x9bf98C09590CeE2Ec5F6256449754f1ba77d5aE5" }

  const positionRouter = await contractAt("PositionRouter", "0xffF6D276Bc37c61A23f06410Dce4A400f66420f8")

  // const fastPriceEvents = await deployContract("FastPriceEvents", [])
  const fastPriceEvents = await contractAt("FastPriceEvents", "0x02b7023D43bc52bFf8a0C54A9F2ecec053523Bf6", signer)

  return {
    fastPriceTokens,
    fastPriceEvents,
    tokenManager,
    positionRouter,
    tokenArr,
    updaters,
    priceFeedTimelock
  }
}

async function getValues(signer) {
  if (network === "arbitrum") {
    return getArbValues(signer)
  }

  if (network === "avax") {
    return getAvaxValues(signer)
  }
}

async function main() {
  // const signer = await getFrameSigner()
  const deployer = { address: "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce" }

  const { weeth, wbtc, mode, usdc } = tokens
  const tokenArr = [weeth, wbtc, mode, usdc]
  const fastPriceTokens = [weeth, wbtc, mode]

  // const priceFeedTimelock = { address: "0xCa8b5F2fF7B8d452bE8972B44Dc026Be96b97228" }

  const updater1 = { address: "0xA058b1A0bA31590d1E14A1F157f4ff7D41c78077" }
  const keeper1 = { address: "0x2cd775ac25a8DBD11C4Db46901C776936699f2EE" }
  const updaters = [updater1.address, keeper1.address]

  // const tokenManager = { address: "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce" }

  const positionRouter = await contractAt("PositionRouter", "0x6D6ec3bd7c94ab35e7a0a6FdA864EE35eB9fAE04")

  const fastPriceEvents = await deployContract("FastPriceEvents", [])
  // const fastPriceEvents = await contractAt("FastPriceEvents", "0xD09eF52d1BB74D67B0c508b932E90f8a6B7F1884")

  // const {
  //   fastPriceTokens,
  //   fastPriceEvents,
  //   tokenManager,
  //   positionRouter,
  //   chainlinkFlags,
  //   tokenArr,
  //   updaters,
  //   priceFeedTimelock
  // } = await getValues(signer)

  // const signers = [
  //   "0x82429089e7c86B7047b793A9E7E7311C93d2b7a6", // coinflipcanada
  //   "0x1D6d107F5960A66f293Ac07EDd08c1ffE79B548a", // G Account 1
  //   "0xD7941C4Ca57a511F21853Bbc7FBF8149d5eCb398", // G Account 2
  //   "0xfb481D70f8d987c1AE3ADc90B7046e39eb6Ad64B", // kr
  //   "0x99Aa3D1b3259039E8cB4f0B33d0Cfd736e1Bf49E", // quat
  //   "0x6091646D0354b03DD1e9697D33A7341d8C93a6F5", // xhiroz
  //   "0x45e48668F090a3eD1C7961421c60Df4E66f693BD", // Dovey
  //   "0x881690382102106b00a99E3dB86056D0fC71eee6", // Han Wen
  //   "0x2e5d207a4c0f7e7c52f6622dcc6eb44bc0fe1a13" // Krunal Amin
  // ]

  const signers = [
    "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce", // morphex deployer
  ]

  if (fastPriceTokens.find(t => !t.fastPricePrecision)) {
    throw new Error("Invalid price precision")
  }

  if (fastPriceTokens.find(t => !t.maxCumulativeDeltaDiff)) {
    throw new Error("Invalid price maxCumulativeDeltaDiff")
  }

  const secondaryPriceFeed = await deployContract("FastPriceFeed", [
    5 * 60, // _priceDuration
    60 * 60, // _maxPriceUpdateDelay
    1, // _minBlockInterval
    250, // _maxDeviationBasisPoints
    fastPriceEvents.address, // _fastPriceEvents
    deployer.address, // _tokenManager
    positionRouter.address
  ])

  // const secondaryPriceFeed = await contractAt("FastPriceFeed", "0x89BE4cF89c425F74b2d0691A268A9a421e9dce7b")

  // const vaultPriceFeed = await deployContract("VaultPriceFeed", [])
  const vaultPriceFeed = await contractAt("VaultPriceFeed", "0x8453491DBf88f102a54c6809bAe6C16c87a1EDca")

  await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation") // 0.01 USD
  await sendTxn(vaultPriceFeed.setPriceSampleSpace(1), "vaultPriceFeed.setPriceSampleSpace")
  await sendTxn(vaultPriceFeed.setSecondaryPriceFeed(secondaryPriceFeed.address), "vaultPriceFeed.setSecondaryPriceFeed")
  await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), "vaultPriceFeed.setIsAmmEnabled")

  // if (chainlinkFlags) {
  //   await sendTxn(vaultPriceFeed.setChainlinkFlags(chainlinkFlags.address), "vaultPriceFeed.setChainlinkFlags")
  // }

  for (const [i, tokenItem] of tokenArr.entries()) {
    if (tokenItem.spreadBasisPoints === undefined) { continue }
    await sendTxn(vaultPriceFeed.setSpreadBasisPoints(
      tokenItem.address, // _token
      tokenItem.spreadBasisPoints // _spreadBasisPoints
    ), `vaultPriceFeed.setSpreadBasisPoints(${tokenItem.name}) ${tokenItem.spreadBasisPoints}`)
  }

  for (const token of tokenArr) {
    await sendTxn(vaultPriceFeed.setTokenConfig(
      token.address, // _token
      token.priceFeed, // _priceFeed
      token.priceDecimals, // _priceDecimals
      token.isStrictStable // _isStrictStable
    ), `vaultPriceFeed.setTokenConfig(${token.name}) ${token.address} ${token.priceFeed}`)
  }

  await sendTxn(secondaryPriceFeed.initialize(1, signers, updaters), "secondaryPriceFeed.initialize")
  await sendTxn(secondaryPriceFeed.setTokens(fastPriceTokens.map(t => t.address), fastPriceTokens.map(t => t.fastPricePrecision)), "secondaryPriceFeed.setTokens")
  await sendTxn(secondaryPriceFeed.setVaultPriceFeed(vaultPriceFeed.address), "secondaryPriceFeed.setVaultPriceFeed")
  await sendTxn(secondaryPriceFeed.setMaxTimeDeviation(60 * 60), "secondaryPriceFeed.setMaxTimeDeviation")
  await sendTxn(secondaryPriceFeed.setSpreadBasisPointsIfInactive(50), "secondaryPriceFeed.setSpreadBasisPointsIfInactive")
  await sendTxn(secondaryPriceFeed.setSpreadBasisPointsIfChainError(500), "secondaryPriceFeed.setSpreadBasisPointsIfChainError")
  await sendTxn(secondaryPriceFeed.setMaxCumulativeDeltaDiffs(fastPriceTokens.map(t => t.address), fastPriceTokens.map(t => t.maxCumulativeDeltaDiff)), "secondaryPriceFeed.setMaxCumulativeDeltaDiffs")
  await sendTxn(secondaryPriceFeed.setPriceDataInterval(1 * 60), "secondaryPriceFeed.setPriceDataInterval")

  await sendTxn(positionRouter.setPositionKeeper(secondaryPriceFeed.address, true), "positionRouter.setPositionKeeper(secondaryPriceFeed)")
  await sendTxn(fastPriceEvents.setIsPriceFeed(secondaryPriceFeed.address, true), "fastPriceEvents.setIsPriceFeed")

  // await sendTxn(vaultPriceFeed.setGov(priceFeedTimelock.address), "vaultPriceFeed.setGov")
  // await sendTxn(secondaryPriceFeed.setGov(priceFeedTimelock.address), "secondaryPriceFeed.setGov")
  // await sendTxn(secondaryPriceFeed.setTokenManager(tokenManager.address), "secondaryPriceFeed.setTokenManager")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
