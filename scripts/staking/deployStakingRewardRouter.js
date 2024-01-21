const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

const nativeTokenAddress = "0x4200000000000000000000000000000000000006"

async function main() {
  const gmx = await contractAt("BMX", "0x548f93779fBC992010C07467cBaf329DD5F059B7");
  const esGmx = await contractAt("Token", "0x3Ff7AB26F2dfD482C40bDaDfC0e88D01BFf79713"); // oBMX
  const bnGmx = await deployContract("MintableBaseToken", ["Bonus BMX", "bnBMX", 0]);
  //   const bnGmx = await contractAt("MintableBaseToken", "0xEf187825c6CdA0570B717a8E6fDa734812EC0b09");

  const stakedGmxTracker = await deployContract("RewardTracker", ["Staked BMX", "sBMX"])
  //   const stakedGmxTracker = await contractAt("RewardTracker", "0xa4157E273D88ff16B3d8Df68894e1fd809DbC007");
  const stakedGmxDistributor = await deployContract("RewardDistributorV2", [esGmx.address, stakedGmxTracker.address])
  //   const stakedGmxDistributor = await contractAt("RewardDistributorV2", "0x05D97A8a5eF11010a6A5f89B3D4628ce43092614");
  await sendTxn(stakedGmxTracker.initialize([gmx.address], stakedGmxDistributor.address), "stakedGmxTracker.initialize")
  await sendTxn(stakedGmxDistributor.updateLastDistributionTime(), "stakedGmxDistributor.updateLastDistributionTime")

  const bonusGmxTracker = await deployContract("RewardTracker", ["Staked + Bonus BMX", "sbBMX"])
  // const bonusGmxTracker = await contractAt("RewardTracker", "0xa2242d0A8b0b5c1A487AbFC03Cd9FEf6262BAdCA");
  const bonusGmxDistributor = await deployContract("BonusDistributor", [bnGmx.address, bonusGmxTracker.address])
  // const bonusGmxDistributor = await contractAt("BonusDistributor", "0x06c35893Ba9bc454e12c36F4117BC99f75e34346");
  await sendTxn(bonusGmxTracker.initialize([stakedGmxTracker.address], bonusGmxDistributor.address), "bonusGmxTracker.initialize")
  await sendTxn(bonusGmxDistributor.updateLastDistributionTime(), "bonusGmxDistributor.updateLastDistributionTime")

  const feeGmxTracker = await deployContract("RewardTracker", ["Staked + Bonus + Fee BMX", "sbfBMX"])
  // const feeGmxTracker = await contractAt("RewardTracker", "0x2D5875ab0eFB999c1f49C798acb9eFbd1cfBF63c");
  const feeGmxDistributor = await deployContract("RewardDistributorV2", [nativeTokenAddress, feeGmxTracker.address])
  // const feeGmxDistributor = await contractAt("RewardDistributorV2", "0x1d556F411370E5F1850A51EB66960798e6F5eDeC");
  await sendTxn(feeGmxTracker.initialize([bonusGmxTracker.address, bnGmx.address], feeGmxDistributor.address), "feeGmxTracker.initialize")
  await sendTxn(feeGmxDistributor.updateLastDistributionTime(), "feeGmxDistributor.updateLastDistributionTime")


  await sendTxn(stakedGmxTracker.setInPrivateTransferMode(true), "stakedGmxTracker.setInPrivateTransferMode")
  await sendTxn(stakedGmxTracker.setInPrivateStakingMode(true), "stakedGmxTracker.setInPrivateStakingMode")
  await sendTxn(bonusGmxTracker.setInPrivateTransferMode(true), "bonusGmxTracker.setInPrivateTransferMode")
  await sendTxn(bonusGmxTracker.setInPrivateStakingMode(true), "bonusGmxTracker.setInPrivateStakingMode")
  await sendTxn(bonusGmxTracker.setInPrivateClaimingMode(true), "bonusGmxTracker.setInPrivateClaimingMode")
  await sendTxn(feeGmxTracker.setInPrivateTransferMode(true), "feeGmxTracker.setInPrivateTransferMode")
  await sendTxn(feeGmxTracker.setInPrivateStakingMode(true), "feeGmxTracker.setInPrivateStakingMode")

  const rewardRouter = await deployContract("StakingRewardRouter", [])
  // const rewardRouter = await contractAt("StakingRewardRouter", "0x9Ac78C583bD14370248Fb65C151D33CF21c1f4E4")

  await sendTxn(rewardRouter.initialize(
    nativeTokenAddress,
    gmx.address,
    esGmx.address,
    bnGmx.address,
    stakedGmxTracker.address,
    bonusGmxTracker.address,
    feeGmxTracker.address 
  ), "rewardRouter.initialize")

  // allow rewardRouter to stake in stakedGmxTracker
  await sendTxn(stakedGmxTracker.setHandler(rewardRouter.address, true), "stakedGmxTracker.setHandler(rewardRouter)")

  // allow bonusGmxTracker to stake stakedGmxTracker            
  await sendTxn(stakedGmxTracker.setHandler(bonusGmxTracker.address, true), "stakedGmxTracker.setHandler(bonusGmxTracker)")

  // allow rewardRouter to stake in bonusGmxTracker       
  await sendTxn(bonusGmxTracker.setHandler(rewardRouter.address, true), "bonusGmxTracker.setHandler(rewardRouter)")

  // allow bonusGmxTracker to stake feeGmxTracker          
  await sendTxn(bonusGmxTracker.setHandler(feeGmxTracker.address, true), "bonusGmxTracker.setHandler(feeGmxTracker)")
  await sendTxn(bonusGmxDistributor.setBonusMultiplier(10000), "bonusGmxDistributor.setBonusMultiplier")
  
  // allow rewardRouter to stake in feeGmxTracker           
  await sendTxn(feeGmxTracker.setHandler(rewardRouter.address, true), "feeGmxTracker.setHandler(rewardRouter)")

  // allow feeGmxTracker to stake bnGmx
  await sendTxn(bnGmx.setHandler(feeGmxTracker.address, true), "bnGmx.setHandler(feeGmxTracker")

  // allow rewardRouter to burn bnGmx
  await sendTxn(bnGmx.setMinter(rewardRouter.address, true), "bnGmx.setMinter(rewardRouter")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
