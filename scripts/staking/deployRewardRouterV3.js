const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

const nativeTokenAddress = "0x4200000000000000000000000000000000000006"

async function main() {
  const glpManager = await contractAt("GlpManager", "0x9fAc7b75f367d5B35a6D6D0a09572eFcC3D406C5")
  const glp = await contractAt("GLP", "0xe771b4E273dF31B85D7A7aE0Efd22fb44BdD0633")

  const gmx = await contractAt("BMX", "0x548f93779fBC992010C07467cBaf329DD5F059B7");

  await sendTxn(glp.setInPrivateTransferMode(true), "glp.setInPrivateTransferMode")

  const feeGlpTracker = await deployContract("RewardTracker", ["Fee BLP", "fBLP"])
  // const feeGlpTracker = await contractAt("RewardTracker", "0x1Fc9aB3b7bEE66fC29167AB205777537898ff235");
  const feeGlpDistributor = await deployContract("RewardDistributor", [nativeTokenAddress, feeGlpTracker.address])
  // const feeGlpDistributor = await contractAt("RewardDistributor", "0x19D9fF60c3f4D064df7f625E669f7626365820F6");
  await sendTxn(feeGlpTracker.initialize([glp.address], feeGlpDistributor.address), "feeGlpTracker.initialize")
  await sendTxn(feeGlpDistributor.updateLastDistributionTime(), "feeGlpDistributor.updateLastDistributionTime")

  const stakedGlpTracker = await deployContract("RewardTracker", ["Fee + Staked BLP", "fsBLP"])
  // const stakedGlpTracker = await contractAt("RewardTracker", "0x4e0e48b787E308049d0CA6bfAA84D5c61c5a4A1e");
  const stakedGlpDistributor = await deployContract("RewardDistributor", [gmx.address, stakedGlpTracker.address])
  // const stakedGlpDistributor = await contractAt("RewardDistributor", "0x99f8f0628003a52843c2C3b33A0e49E85d9a89e5");
  await sendTxn(stakedGlpTracker.initialize([feeGlpTracker.address], stakedGlpDistributor.address), "stakedGlpTracker.initialize")
  await sendTxn(stakedGlpDistributor.updateLastDistributionTime(), "stakedGlpDistributor.updateLastDistributionTime")

  await sendTxn(feeGlpTracker.setInPrivateTransferMode(true), "feeGlpTracker.setInPrivateTransferMode")
  await sendTxn(feeGlpTracker.setInPrivateStakingMode(true), "feeGlpTracker.setInPrivateStakingMode")
  await sendTxn(stakedGlpTracker.setInPrivateTransferMode(true), "stakedGlpTracker.setInPrivateTransferMode")
  await sendTxn(stakedGlpTracker.setInPrivateStakingMode(true), "stakedGlpTracker.setInPrivateStakingMode")

  const rewardRouter = await deployContract("RewardRouterV3", [])
  // const rewardRouter = await contractAt("RewardRouterV3", "0x9Ac78C583bD14370248Fb65C151D33CF21c1f4E4")

  await sendTxn(rewardRouter.initialize(
    nativeTokenAddress,
    glp.address,
    feeGlpTracker.address,
    stakedGlpTracker.address,
    glpManager.address,
  ), "rewardRouter.initialize")

  await sendTxn(glpManager.setHandler(rewardRouter.address, true), "glpManager.setHandler(rewardRouter)")

  // allow stakedGlpTracker to stake feeGlpTracker
  await sendTxn(feeGlpTracker.setHandler(stakedGlpTracker.address, true), "feeGlpTracker.setHandler(stakedGlpTracker)")
  // allow feeGlpTracker to stake glp
  await sendTxn(glp.setHandler(feeGlpTracker.address, true), "glp.setHandler(feeGlpTracker)")

  // allow rewardRouter to stake in feeGlpTracker
  await sendTxn(feeGlpTracker.setHandler(rewardRouter.address, true), "feeGlpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in stakedGlpTracker
  await sendTxn(stakedGlpTracker.setHandler(rewardRouter.address, true), "stakedGlpTracker.setHandler(rewardRouter)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
