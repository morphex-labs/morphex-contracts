const { deployContract, contractAt, sendTxn } = require("../shared/helpers")

const nativeTokenAddress = "0x4200000000000000000000000000000000000006"

async function main() {
  const glpManager = await contractAt("GlpManager", "0x9fAc7b75f367d5B35a6D6D0a09572eFcC3D406C5")
  const glp = await contractAt("GLP", "0xe771b4E273dF31B85D7A7aE0Efd22fb44BdD0633")

  const gmx = await contractAt("BMX", "0x548f93779fBC992010C07467cBaf329DD5F059B7");
  const esGmx = await contractAt("Token", "0x3Ff7AB26F2dfD482C40bDaDfC0e88D01BFf79713");
  const bnGmx = await contractAt("MintableBaseToken", "0x10AB197551BAB91f8B218dC9730AE0e43d893Db2");

  const stakedGmxTracker = await contractAt("RewardTracker", "0x3085F25Cbb5F34531229077BAAC20B9ef2AE85CB");
  const bonusGmxTracker = await contractAt("RewardTracker", "0x9A8f034Df900E58C55764fAAC867c5BA11A8F70f");
  const feeGmxTracker = await contractAt("RewardTracker", "0x38E5be3501687500E6338217276069d16178077E");

  const feeGlpTracker = await contractAt("RewardTracker", "0xa2242d0A8b0b5c1A487AbFC03Cd9FEf6262BAdCA");
  const stakedGlpTracker = await contractAt("RewardTracker", "0x2D5875ab0eFB999c1f49C798acb9eFbd1cfBF63c");

  const rewardRouter = await deployContract("RewardRouterV4", [])

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
    glpManager.address
  ), "rewardRouter.initialize")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
