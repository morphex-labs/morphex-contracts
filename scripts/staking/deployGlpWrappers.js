const { deployContract, contractAt, sendTxn } = require("../shared/helpers")

async function main() {
  const glp = { address: "0x9E462d5603Bb983b74e941Ebd5CE9Ea76f3a9e1e" }
  const glpManager = { address: "0xC608188e753b1e9558731724b7F7Cdde40c3b174" }
  const stakedGlpTracker = await contractAt("RewardTracker", "0xd5c313DE2d33bf36014e6c659F13acE112B80a8E") // fsSLT
  const feeGlpTracker = await contractAt("RewardTracker", "0x3Acf67bD8C291F9C5bbBB14AC0eC86F60ABCE36E") // fSLT

  const stakedGlp = await deployContract("StakedGlp", [
    glp.address,
    glpManager.address,
    stakedGlpTracker.address,
    feeGlpTracker.address
  ])

  await sendTxn(stakedGlpTracker.setHandler(stakedGlp.address, true), "stakedGlpTracker.setHandler(stakedGlp.address)")
  await sendTxn(feeGlpTracker.setHandler(stakedGlp.address, true), "feeGlpTracker.setHandler(stakedGlp.address)")

  await deployContract("GlpBalance", [glpManager.address, stakedGlpTracker.address])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
