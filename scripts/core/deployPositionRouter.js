const { signers, deployContract, contractAt , sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];
const nativeTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

async function getArbValues(signer) {
  const vault = await contractAt("Vault", "0x489ee077994B6658eAfA855C308275EAd8097C4A")
  const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router(), signer)
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const referralStorage = await contractAt("ReferralStorage", "0xe6fab3F0c7199b0d34d7FbE83394fc0e0D06e99d")
  const shortsTracker = await contractAt("ShortsTracker", "0xf58eEc83Ba28ddd79390B9e90C4d3EbfF1d434da", signer)
  const depositFee = "30" // 0.3%
  const minExecutionFee = "100000000000000" // 0.0001 ETH

  return {
    vault,
    timelock,
    router,
    weth,
    referralStorage,
    shortsTracker,
    depositFee,
    minExecutionFee,
    positionKeepers
  }
}

async function getAvaxValues(signer) {
  const vault = await contractAt("Vault", "0x9ab2De34A33fB459b538c43f251eB825645e8595")
  const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router(), signer)
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const referralStorage = await contractAt("ReferralStorage", "0x827ED045002eCdAbEb6e2b0d1604cf5fC3d322F8")
  const shortsTracker = await contractAt("ShortsTracker", "0x9234252975484D75Fd05f3e4f7BdbEc61956D73a", signer)
  const depositFee = "30" // 0.3%
  const minExecutionFee = "20000000000000000" // 0.02 AVAX

  return {
    vault,
    timelock,
    router,
    weth,
    referralStorage,
    shortsTracker,
    depositFee,
    minExecutionFee
  }
}

async function getFantomTestnetValues(signer) {
  const vault = await contractAt("Vault", "0xF0637348DBA68d12845F55c3c319FAea4b39D411")
  const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router(), signer)
  const weth = await contractAt("WETH", nativeTokenAddress)
  const referralStorage = await contractAt("ReferralStorage", "0x32034bF6693Cf8c4F970962740609BF7A43ff350")
  const shortsTracker = await contractAt("ShortsTracker", "0xFbfcf0Dd410f84cFC4beBa2D916B8A110a984eD6", signer)
  const depositFee = "30" // 0.3%
  const minExecutionFee = "250000000000000000" // 0.25 FTM

  return {
    vault,
    timelock,
    router,
    weth,
    referralStorage,
    shortsTracker,
    depositFee,
    minExecutionFee
  }
}

async function getValues(signer) {
  if (network === "arbitrum") {
    return getArbValues(signer)
  }

  if (network === "avax") {
    return getAvaxValues(signer)
  }

  if (network === "fantomTestnet") {
    return getFantomTestnetValues(signer)
  }
}

async function main() {
  const signer = signers.bsc;

  // const {
  //   vault,
  //   timelock,
  //   router,
  //   weth,
  //   referralStorage,
  //   shortsTracker,
  //   depositFee,
  //   minExecutionFee,
  // } = await getValues(signer)

  const vault = await contractAt("Vault", "0x46940Dc651bFe3F2CC3E04cf9dC5579B50Cf0765")
  // const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router(), signer)
  const weth = await contractAt("WETH", nativeTokenAddress)
  // const referralStorage = await contractAt("ReferralStorage", "0x32034bF6693Cf8c4F970962740609BF7A43ff350")
  const shortsTracker = await contractAt("ShortsTracker", "0x6c72ADbDc1029ee901dC97C5604487285D972A4f", signer)
  const depositFee = "30" // 0.3%
  const minExecutionFee = "3500000000000000" // 0.0035 BNB

  // const referralStorageGov = await contractAt("Timelock", await referralStorage.gov(), signer)

  const positionRouterArgs = [vault.address, router.address, weth.address, shortsTracker.address, depositFee, minExecutionFee]
  const positionRouter = await deployContract("PositionRouter", positionRouterArgs)
  // const positionRouter = await contractAt("PositionRouter", "0x26e6C47682FfC1824d7aC5512752FC671dA5e607", signer)

  // await sendTxn(positionRouter.setReferralStorage(referralStorage.address), "positionRouter.setReferralStorage")
  // await sendTxn(referralStorageGov.signalSetHandler(referralStorage.address, positionRouter.address, true), "referralStorage.signalSetHandler(positionRouter)")

  await sendTxn(shortsTracker.setHandler(positionRouter.address, true), "shortsTracker.setHandler(positionRouter)")

  await sendTxn(router.addPlugin(positionRouter.address), "router.addPlugin")

  await sendTxn(positionRouter.setDelayValues(0, 180, 30 * 60), "positionRouter.setDelayValues")
  // await sendTxn(timelock.setContractHandler(positionRouter.address, true), "timelock.setContractHandler(positionRouter)")

  // await sendTxn(positionRouter.setGov(await vault.gov()), "positionRouter.setGov")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
