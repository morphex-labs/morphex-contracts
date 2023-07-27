const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

// const network = (process.env.HARDHAT_NETWORK || 'mainnet');
// const tokens = require('../core/tokens')[network];
const nativeTokenAddress = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"

async function main() {
  // const { nativeToken } = tokens

  const vestingDuration = 365 * 24 * 60 * 60

  const glpManager = await contractAt("GlpManager", "0x3A15Bac2D87C89F08147353fc9aE27080631b73d")
  const glp = await contractAt("GLP", "0xF476F7F88E70470c976d9DF7c5C003dB1E1980Cb")

  const gmx = await contractAt("MPX", "0x66eEd5FF1701E6ed8470DC391F05e27B1d0657eb");
  const esGmx = await contractAt("EsGMX", "0xe0f606e6730bE531EeAf42348dE43C2feeD43505");
  // const bnGmx = await deployContract("MintableBaseToken", ["Bonus MPX", "bnMPX", 0]);
  const bnGmx = await contractAt("MintableBaseToken", "0xEf187825c6CdA0570B717a8E6fDa734812EC0b09");
  // await sendTxn(esGmx.setInPrivateTransferMode(true), "esGmx.setInPrivateTransferMode")
  await sendTxn(glp.setInPrivateTransferMode(true), "glp.setInPrivateTransferMode")

  // const stakedGmxTracker = await deployContract("RewardTracker", ["Staked MPX", "sMPX"])
  const stakedGmxTracker = await contractAt("RewardTracker", "0xa4157E273D88ff16B3d8Df68894e1fd809DbC007");
  // const stakedGmxDistributor = await deployContract("RewardDistributor", [esGmx.address, stakedGmxTracker.address])
  const stakedGmxDistributor = await contractAt("RewardDistributor", "0x05D97A8a5eF11010a6A5f89B3D4628ce43092614");
  // await sendTxn(stakedGmxTracker.initialize([gmx.address, esGmx.address], stakedGmxDistributor.address), "stakedGmxTracker.initialize")
  // await sendTxn(stakedGmxDistributor.updateLastDistributionTime(), "stakedGmxDistributor.updateLastDistributionTime")

  // const bonusGmxTracker = await deployContract("RewardTracker", ["Staked + Bonus MPX", "sbMPX"])
  const bonusGmxTracker = await contractAt("RewardTracker", "0xa2242d0A8b0b5c1A487AbFC03Cd9FEf6262BAdCA");
  // const bonusGmxDistributor = await deployContract("BonusDistributor", [bnGmx.address, bonusGmxTracker.address])
  const bonusGmxDistributor = await contractAt("BonusDistributor", "0x06c35893Ba9bc454e12c36F4117BC99f75e34346");
  // await sendTxn(bonusGmxTracker.initialize([stakedGmxTracker.address], bonusGmxDistributor.address), "bonusGmxTracker.initialize")
  // await sendTxn(bonusGmxDistributor.updateLastDistributionTime(), "bonusGmxDistributor.updateLastDistributionTime")

  // const feeGmxTracker = await deployContract("RewardTracker", ["Staked + Bonus + Fee MPX", "sbfMPX"])
  const feeGmxTracker = await contractAt("RewardTracker", "0x2D5875ab0eFB999c1f49C798acb9eFbd1cfBF63c");
  // const feeGmxDistributor = await deployContract("RewardDistributor", [nativeTokenAddress, feeGmxTracker.address])
  const feeGmxDistributor = await contractAt("RewardDistributor", "0x1d556F411370E5F1850A51EB66960798e6F5eDeC");
  // await sendTxn(feeGmxTracker.initialize([bonusGmxTracker.address, bnGmx.address], feeGmxDistributor.address), "feeGmxTracker.initialize")
  // await sendTxn(feeGmxDistributor.updateLastDistributionTime(), "feeGmxDistributor.updateLastDistributionTime")

  const feeGlpTracker = await deployContract("RewardTracker", ["Fee MLP", "fMLP"])
  // const feeGlpTracker = await contractAt("RewardTracker", "0x1Fc9aB3b7bEE66fC29167AB205777537898ff235");
  const feeGlpDistributor = await deployContract("RewardDistributor", [nativeTokenAddress, feeGlpTracker.address])
  // const feeGlpDistributor = await contractAt("RewardDistributor", "0x19D9fF60c3f4D064df7f625E669f7626365820F6");
  await sendTxn(feeGlpTracker.initialize([glp.address], feeGlpDistributor.address), "feeGlpTracker.initialize")
  await sendTxn(feeGlpDistributor.updateLastDistributionTime(), "feeGlpDistributor.updateLastDistributionTime")

  const stakedGlpTracker = await deployContract("RewardTracker", ["Fee + Staked MLP", "fsMLP"])
  // const stakedGlpTracker = await contractAt("RewardTracker", "0x4e0e48b787E308049d0CA6bfAA84D5c61c5a4A1e");
  const stakedGlpDistributor = await deployContract("RewardDistributor", [esGmx.address, stakedGlpTracker.address])
  // const stakedGlpDistributor = await contractAt("RewardDistributor", "0x99f8f0628003a52843c2C3b33A0e49E85d9a89e5");
  await sendTxn(stakedGlpTracker.initialize([feeGlpTracker.address], stakedGlpDistributor.address), "stakedGlpTracker.initialize")
  await sendTxn(stakedGlpDistributor.updateLastDistributionTime(), "stakedGlpDistributor.updateLastDistributionTime")

  // await sendTxn(stakedGmxTracker.setInPrivateTransferMode(true), "stakedGmxTracker.setInPrivateTransferMode")
  // await sendTxn(stakedGmxTracker.setInPrivateStakingMode(true), "stakedGmxTracker.setInPrivateStakingMode")
  // await sendTxn(bonusGmxTracker.setInPrivateTransferMode(true), "bonusGmxTracker.setInPrivateTransferMode")
  // await sendTxn(bonusGmxTracker.setInPrivateStakingMode(true), "bonusGmxTracker.setInPrivateStakingMode")
  // await sendTxn(bonusGmxTracker.setInPrivateClaimingMode(true), "bonusGmxTracker.setInPrivateClaimingMode")
  // await sendTxn(feeGmxTracker.setInPrivateTransferMode(true), "feeGmxTracker.setInPrivateTransferMode")
  // await sendTxn(feeGmxTracker.setInPrivateStakingMode(true), "feeGmxTracker.setInPrivateStakingMode")

  await sendTxn(feeGlpTracker.setInPrivateTransferMode(true), "feeGlpTracker.setInPrivateTransferMode")
  await sendTxn(feeGlpTracker.setInPrivateStakingMode(true), "feeGlpTracker.setInPrivateStakingMode")
  await sendTxn(stakedGlpTracker.setInPrivateTransferMode(true), "stakedGlpTracker.setInPrivateTransferMode")
  await sendTxn(stakedGlpTracker.setInPrivateStakingMode(true), "stakedGlpTracker.setInPrivateStakingMode")

  // const gmxVester = await deployContract("Vester", [
  //   "Vested MPX", // _name
  //   "vMPX", // _symbol
  //   vestingDuration, // _vestingDuration
  //   esGmx.address, // _esToken
  //   feeGmxTracker.address, // _pairToken
  //   gmx.address, // _claimableToken
  //   stakedGmxTracker.address, // _rewardTracker
  // ])
  const gmxVester = await contractAt("Vester", "0x8753a83c928939F86341251d7DFAd8cf5471410c")

  const glpVester = await deployContract("Vester", [
    "Vested MLP", // _name
    "vMLP", // _symbol
    vestingDuration, // _vestingDuration
    esGmx.address, // _esToken
    stakedGlpTracker.address, // _pairToken
    gmx.address, // _claimableToken
    stakedGlpTracker.address, // _rewardTracker
  ])
  // const glpVester = await contractAt("Vester", "0x46f60E61bF91A0c750B4b6d66481b484EdaCAc4C")

  const rewardRouter = await deployContract("RewardRouterV2", [])
  // const rewardRouter = await contractAt("RewardRouterV2", "0x9Ac78C583bD14370248Fb65C151D33CF21c1f4E4")

  await sendTxn(rewardRouter.initialize(
    nativeTokenAddress,
    gmx.address,
    esGmx.address,
    bnGmx.address,
    glp.address,
    stakedGmxTracker.address,
    bonusGmxTracker.address,
    feeGmxTracker.address,
    feeGlpTracker.address,
    stakedGlpTracker.address,
    glpManager.address,
    gmxVester.address,
    glpVester.address
  ), "rewardRouter.initialize")

  await sendTxn(glpManager.setHandler(rewardRouter.address, true), "glpManager.setHandler(rewardRouter)")

  // // allow rewardRouter to stake in stakedGmxTracker         QUEUE /
  // await sendTxn(stakedGmxTracker.setHandler(rewardRouter.address, true), "stakedGmxTracker.setHandler(rewardRouter)")

  // // allow bonusGmxTracker to stake stakedGmxTracker            
  // await sendTxn(stakedGmxTracker.setHandler(bonusGmxTracker.address, true), "stakedGmxTracker.setHandler(bonusGmxTracker)")

  // // allow rewardRouter to stake in bonusGmxTracker       QUEUE /
  // await sendTxn(bonusGmxTracker.setHandler(rewardRouter.address, true), "bonusGmxTracker.setHandler(rewardRouter)")

  // // allow bonusGmxTracker to stake feeGmxTracker          
  // await sendTxn(bonusGmxTracker.setHandler(feeGmxTracker.address, true), "bonusGmxTracker.setHandler(feeGmxTracker)")
  // await sendTxn(bonusGmxDistributor.setBonusMultiplier(10000), "bonusGmxDistributor.setBonusMultiplier")
  
  // // allow rewardRouter to stake in feeGmxTracker           QUEUE /
  // await sendTxn(feeGmxTracker.setHandler(rewardRouter.address, true), "feeGmxTracker.setHandler(rewardRouter)")

  // // allow stakedGmxTracker to stake esGmx
  // await sendTxn(esGmx.setHandler(stakedGmxTracker.address, true), "esGmx.setHandler(stakedGmxTracker)")
  // // allow feeGmxTracker to stake bnGmx
  // await sendTxn(bnGmx.setHandler(feeGmxTracker.address, true), "bnGmx.setHandler(feeGmxTracker")

  // // allow rewardRouter to burn bnGmx          QUEUED TO TRANSFER GOV IN ORDER TO SET AS MINTER ROLE /
  // await sendTxn(bnGmx.setMinter(rewardRouter.address, true), "bnGmx.setMinter(rewardRouter")

  // allow stakedGlpTracker to stake feeGlpTracker
  await sendTxn(feeGlpTracker.setHandler(stakedGlpTracker.address, true), "feeGlpTracker.setHandler(stakedGlpTracker)")
  // allow feeGlpTracker to stake glp
  await sendTxn(glp.setHandler(feeGlpTracker.address, true), "glp.setHandler(feeGlpTracker)")

  // allow rewardRouter to stake in feeGlpTracker
  await sendTxn(feeGlpTracker.setHandler(rewardRouter.address, true), "feeGlpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in stakedGlpTracker
  await sendTxn(stakedGlpTracker.setHandler(rewardRouter.address, true), "stakedGlpTracker.setHandler(rewardRouter)")

  // await sendTxn(esGmx.setHandler(rewardRouter.address, true), "esGmx.setHandler(rewardRouter)")    QUEUE /
  // await sendTxn(esGmx.setHandler(stakedGmxDistributor.address, true), "esGmx.setHandler(stakedGmxDistributor)")
  // await sendTxn(esGmx.setHandler(stakedGlpDistributor.address, true), "esGmx.setHandler(stakedGlpDistributor)")   QUEUE /
  // await sendTxn(esGmx.setHandler(stakedGlpTracker.address, true), "esGmx.setHandler(stakedGlpTracker)")     QUEUE /
  // await sendTxn(esGmx.setHandler(gmxVester.address, true), "esGmx.setHandler(gmxVester)")
  // await sendTxn(esGmx.setHandler(glpVester.address, true), "esGmx.setHandler(glpVester)")      QUEUE /

  // await sendTxn(esGmx.setMinter(gmxVester.address, true), "esGmx.setMinter(gmxVester)")
  // await sendTxn(esGmx.setMinter(glpVester.address, true), "esGmx.setMinter(glpVester)")  QUEUED TO TRANSFER GOV IN ORDER TO SET AS MINTER ROLE /

  // await sendTxn(gmxVester.setHandler(rewardRouter.address, true), "gmxVester.setHandler(rewardRouter)")      QUEUE /
  await sendTxn(glpVester.setHandler(rewardRouter.address, true), "glpVester.setHandler(rewardRouter)")

  // await sendTxn(feeGmxTracker.setHandler(gmxVester.address, true), "feeGmxTracker.setHandler(gmxVester)")
  await sendTxn(stakedGlpTracker.setHandler(glpVester.address, true), "stakedGlpTracker.setHandler(glpVester)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
