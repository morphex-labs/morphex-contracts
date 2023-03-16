const { signers, deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getArbValues() {
  const glp = { address: "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258" }
  const glpManager = { address: "0x321F653eED006AD1C29D174e17d96351BDe22649" }
  const stakedGlpTracker = await contractAt("RewardTracker", "0x1aDDD80E6039594eE970E5872D247bf0414C8903")
  const feeGlpTracker = await contractAt("RewardTracker", "0x4e971a87900b931fF39d1Aad67697F49835400b6")

  return { glp, glpManager, stakedGlpTracker, feeGlpTracker }
}

async function getAvaxValues() {
  const glp = { address: "0x01234181085565ed162a948b6a5e88758CD7c7b8" }
  const glpManager = { address: "0xe1ae4d4b06A5Fe1fc288f6B4CD72f9F8323B107F" }
  const stakedGlpTracker = await contractAt("RewardTracker", "0x9e295B5B976a184B14aD8cd72413aD846C299660")
  const feeGlpTracker = await contractAt("RewardTracker", "0xd2D1162512F927a7e282Ef43a362659E4F2a728F")

  return { glp, glpManager, stakedGlpTracker, feeGlpTracker }
}

async function getValues() {
  if (network === "arbitrum") {
    return getArbValues()
  }

  if (network === "avax") {
    return getAvaxValues()
  }
}

async function main() {
  const signer = signers.fantomTestnet;
  // const { glp, glpManager, stakedGlpTracker, feeGlpTracker } = await getValues()
  const glp = { address: "0xd5c313DE2d33bf36014e6c659F13acE112B80a8E" }
  const glpManager = { address: "0xA3Ea99f8aE06bA0d9A6Cf7618d06AEa4564340E9" }
  const stakedGlpTracker = await contractAt("RewardTracker", "0x49A97680938B4F1f73816d1B70C3Ab801FAd124B") // fsMLP
  const feeGlpTracker = await contractAt("RewardTracker", "0xd3C5dEd5F1207c80473D39230E5b0eD11B39F905") // fMLP

  // const timelock = await contractAt("Timelock", await stakedGlpTracker.gov(), signer)

  const stakedGlp = await deployContract("StakedGlp", [
    glp.address,
    glpManager.address,
    stakedGlpTracker.address,
    feeGlpTracker.address
  ])

  // await sendTxn(timelock.signalSetHandler(stakedGlpTracker.address, stakedGlp.address, true), "timelock.signalSetHandler(stakedGlpTracker)")
  // await sendTxn(timelock.signalSetHandler(feeGlpTracker.address, stakedGlp.address, true), "timelock.signalSetHandler(stakedGlpTracker)")

  await deployContract("GlpBalance", [glpManager.address, stakedGlpTracker.address])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
