const { deployContract, contractAt , sendTxn } = require("../shared/helpers")

async function main() {
  const positionRouter = await contractAt("PositionRouter", "0x77F480fdB7100d096c2de1876C1f4960Fa488246")
  const positionManager = await contractAt("PositionManager", "0x620253Be916A915fEE00Fab30840A04A2389C886")
  const referralStorage = await deployContract("ReferralStorage", [])
  // const referralStorage = await contractAt("ReferralStorage", "0xb795e91DAefD6A7edEAc3060513D93cE7617370A")

  await sendTxn(positionRouter.setReferralStorage(referralStorage.address), "positionRouter.setReferralStorage")
  await sendTxn(positionManager.setReferralStorage(referralStorage.address), "positionManager.setReferralStorage")

  await sendTxn(referralStorage.setHandler(positionRouter.address, true), "referralStorage.setHandler(positionRouter)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
