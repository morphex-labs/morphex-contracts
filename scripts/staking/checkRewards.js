const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function getDistributor(rewardTracker) {
  const distributorAddress = await rewardTracker.distributor()
  return await contractAt("RewardDistributor", distributorAddress)
}

async function printDistributorBalance(token, distributor, label) {
  const balance = await token.balanceOf(distributor.address)
  const pendingRewards = await distributor.pendingRewards()
  console.log(
    label,
    ethers.utils.formatUnits(balance, 18),
    ethers.utils.formatUnits(pendingRewards, 18),
    balance.gte(pendingRewards) ? "sufficient-balance" : "insufficient-balance",
    ethers.utils.formatUnits(balance.sub(pendingRewards), 18)
  )
}

async function main() {
  const gmx = await contractAt("BMX", "0x548f93779fBC992010C07467cBaf329DD5F059B7")
  const esGmx = await contractAt("EsGMX", "0x3Ff7AB26F2dfD482C40bDaDfC0e88D01BFf79713")
  const bnGmx = await contractAt("MintableBaseToken", "0x10AB197551BAB91f8B218dC9730AE0e43d893Db2")
  const weth = await contractAt("Token", "0x4200000000000000000000000000000000000006")

  const stakedGmxTracker = await contractAt("RewardTracker", "0x3085F25Cbb5F34531229077BAAC20B9ef2AE85CB")
  const stakedGmxDistributor = await getDistributor(stakedGmxTracker)

  const bonusGmxTracker = await contractAt("RewardTracker", "0x9A8f034Df900E58C55764fAAC867c5BA11A8F70f")
  const bonusGmxDistributor = await getDistributor(bonusGmxTracker)

  const feeGmxTracker = await contractAt("RewardTracker", "0x38E5be3501687500E6338217276069d16178077E")
  const feeGmxDistributor = await getDistributor(feeGmxTracker)

  const stakedGlpTracker = await contractAt("RewardTracker", "0x2D5875ab0eFB999c1f49C798acb9eFbd1cfBF63c")
  const stakedGlpDistributor = await getDistributor(stakedGlpTracker)

  const feeGlpTracker = await contractAt("RewardTracker", "0xa2242d0A8b0b5c1A487AbFC03Cd9FEf6262BAdCA")
  const feeGlpDistributor = await getDistributor(feeGlpTracker)

  await printDistributorBalance(esGmx, stakedGmxDistributor, "esGmx in stakedGmxDistributor:")
  await printDistributorBalance(bnGmx, bonusGmxDistributor, "bnGmx in bonusGmxDistributor:")
  await printDistributorBalance(weth, feeGmxDistributor, "weth in feeGmxDistributor:")
  await printDistributorBalance(esGmx, stakedGlpDistributor, "esGmx in stakedGlpDistributor:")
  await printDistributorBalance(weth, feeGlpDistributor, "esGmx in feeGlpDistributor:")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
