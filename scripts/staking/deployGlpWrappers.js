const { signers, deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

async function main() {
  const glp = { address: "0xe771b4E273dF31B85D7A7aE0Efd22fb44BdD0633" }
  const glpManager = { address: "0x9fAc7b75f367d5B35a6D6D0a09572eFcC3D406C5" }
  const stakedGlpTracker = await contractAt("RewardTracker", "0xA9F0fAed6940915A0737237d156B70Af6d9879F3") // fsBLP
  const feeGlpTracker = await contractAt("RewardTracker", "0x4D4554307c9a3f20EffE1cc2D1D4ba6190D3C469") // fBLP

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
