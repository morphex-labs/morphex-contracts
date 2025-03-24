const { deployContract, contractAt , sendTxn } = require("../shared/helpers")

const nativeTokenAddress = "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38"; // wS

async function main() {
  const vault = await contractAt("Vault", "0x9cC4E8e60a2c9a67Ac7D20f54607f98EfBA38AcF")
  // const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router())
  const weth = await contractAt("WETH", nativeTokenAddress)
  // const referralStorage = await contractAt("ReferralStorage", "0x32034bF6693Cf8c4F970962740609BF7A43ff350")
  const shortsTracker = await contractAt("ShortsTracker", "0xE974A88385935CB8846482F3Ab01b6c0f70fa5f3")
  const depositFee = "30" // 0.3%
  const minExecutionFee = "100000000000000000" // 0.1 S

  // const referralStorageGov = await contractAt("Timelock", await referralStorage.gov(), signer)

  const positionRouterArgs = [vault.address, router.address, weth.address, shortsTracker.address, depositFee, minExecutionFee]
  const positionRouter = await deployContract("PositionRouter", positionRouterArgs)
  // const positionRouter = await contractAt("PositionRouter", "0x927F9c03d1Ac6e2630d31E614F226b5Ed028d443")

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
