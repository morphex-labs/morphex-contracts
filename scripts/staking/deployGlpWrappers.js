const { signers, deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

async function main() {
  const glp = { address: "0x952AdBB385296Dcf86a668f7eaa02DF7eb684439" }
  const glpManager = { address: "0xf9Fc0B2859f9B6d33fD1Cea5B0A9f1D56C258178" }
  const stakedGlpTracker = await contractAt("RewardTracker", "0x6c72ADbDc1029ee901dC97C5604487285D972A4f") // fsMLT
  const feeGlpTracker = await contractAt("RewardTracker", "0xCcBF79AA51919f1711E40293a32bbC71F8842FC3") // fMLT

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
