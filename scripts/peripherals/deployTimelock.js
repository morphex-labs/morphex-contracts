const { deployContract, contractAt, sendTxn, getFrameSigner } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getArbValues() {
  const vault = await contractAt("Vault", "0x489ee077994B6658eAfA855C308275EAd8097C4A")
  const tokenManager = { address: "0xddDc546e07f1374A07b270b7d863371e575EA96A" }
  const glpManager = { address: "0x3963FfC9dff443c2A94f21b129D429891E32ec18" }
  const rewardRouter = { address: "0xB95DB5B167D75e6d04227CfFFA61069348d271F5" }

  const positionRouter = { address: "0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868" }
  const positionManager = { address: "0x75E42e6f01baf1D6022bEa862A28774a9f8a4A0C" }
  const gmx = { address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a" }

  return { vault, tokenManager, glpManager, rewardRouter, positionRouter, positionManager, gmx }
}

async function getAvaxValues() {
  const vault = await contractAt("Vault", "0x9ab2De34A33fB459b538c43f251eB825645e8595")
  const tokenManager = { address: "0x8b25Ba1cAEAFaB8e9926fabCfB6123782e3B4BC2" }
  const glpManager = { address: "0xD152c7F25db7F4B95b7658323c5F33d176818EE4" }
  const rewardRouter = { address: "0xB70B91CE0771d3f4c81D87660f71Da31d48eB3B3" }

  const positionRouter = { address: "0xffF6D276Bc37c61A23f06410Dce4A400f66420f8" }
  const positionManager = { address: "0xA21B83E579f4315951bA658654c371520BDcB866" }
  const gmx = { address: "0x62edc0692BD897D2295872a9FFCac5425011c661" }

  return { vault, tokenManager, glpManager, rewardRouter, positionRouter, positionManager, gmx }
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
  // const signer = await getFrameSigner()

  const admin = "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce"
  const buffer = 0.5 * 60 * 60 // 24 * 60 * 60 - 24 hours, change to this later
  const maxTokenSupply = expandDecimals("50000000", 18)

  // const { vault, tokenManager, glpManager, rewardRouter, positionRouter, positionManager, gmx } = await getValues()

  const vault = await contractAt("Vault", "0x3CB54f0eB62C371065D739A34a775CC16f46563e")
  const tokenManager = { address: "0xC28f1D82874ccFebFE6afDAB3c685D5E709067E5" }
  const glpManager = { address: "0xA3Ea99f8aE06bA0d9A6Cf7618d06AEa4564340E9" }
  const rewardRouter = { address: "0x20De7f8283D377fA84575A26c9D484Ee40f55877" }

  const positionRouter = { address: "0x26e6C47682FfC1824d7aC5512752FC671dA5e607" }
  const positionManager = { address: "0x366152Fc0FC4680e0A05ce9739a4210228C72BA3" }

  const gmx = { address: "0x66eEd5FF1701E6ed8470DC391F05e27B1d0657eb" }


  const mintReceiver = tokenManager

  const timelock = await deployContract("Timelock", [
    admin, // admin
    buffer, // buffer
    tokenManager.address, // tokenManager
    mintReceiver.address, // mintReceiver
    glpManager.address, // glpManager
    rewardRouter.address, // rewardRouter
    maxTokenSupply, // maxTokenSupply
    10, // marginFeeBasisPoints 0.1%
    500 // maxMarginFeeBasisPoints 5%
  ], "Timelock")

  const deployedTimelock = await contractAt("Timelock", timelock.address)

  await sendTxn(deployedTimelock.setShouldToggleIsLeverageEnabled(true), "deployedTimelock.setShouldToggleIsLeverageEnabled(true)")
  await sendTxn(deployedTimelock.setContractHandler(positionRouter.address, true), "deployedTimelock.setContractHandler(positionRouter)")
  await sendTxn(deployedTimelock.setContractHandler(positionManager.address, true), "deployedTimelock.setContractHandler(positionManager)")

  // update gov of vault
  const vaultGov = await contractAt("Timelock", await vault.gov())

  await sendTxn(vaultGov.signalSetGov(vault.address, deployedTimelock.address), "vaultGov.signalSetGov")
  await sendTxn(deployedTimelock.signalSetGov(vault.address, vaultGov.address), "deployedTimelock.signalSetGov(vault)")

  const handlers = [
    "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce", // Morpheus
    "0xCf4f678B5c2051C97f2e02723Bdd1158d35E1341", // J
    "0x72671e23A369114786Fd00b555CF16A89C66c00F", // PBnather
    "0x48E53189a4AfF640ce484D89b270c4AedfE4E7Cc", // nkmctsh
  ]

  for (let i = 0; i < handlers.length; i++) {
    const handler = handlers[i]
    await sendTxn(deployedTimelock.setContractHandler(handler, true), `deployedTimelock.setContractHandler(${handler})`)
  }

  const keepers = [
    "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce" // Morpheus
  ]

  for (let i = 0; i < keepers.length; i++) {
    const keeper = keepers[i]
    await sendTxn(deployedTimelock.setKeeper(keeper, true), `deployedTimelock.setKeeper(${keeper})`)
  }

  // await sendTxn(deployedTimelock.signalApprove(gmx.address, admin, "1000000000000000000"), "deployedTimelock.signalApprove")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
