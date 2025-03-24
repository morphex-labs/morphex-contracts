const { deployContract, contractAt, sendTxn, getFrameSigner } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const admin = "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce"
  const buffer = 0 * 60 * 60 
  const maxTokenSupply = expandDecimals("10000000", 18)

  const tokenManager = { address: "0xE02Fb5C70aF32F80Aa7F9E8775FE7F12550348ec" }
  const glpManager = { address: "0xC608188e753b1e9558731724b7F7Cdde40c3b174" }
  const rewardRouter = { address: "0x0DF4DbeB0aeABbBB95cC600E7a268125A0Bb8064" }

  const positionRouter = { address: "0x77F480fdB7100d096c2de1876C1f4960Fa488246" }
  const positionManager = { address: "0x620253Be916A915fEE00Fab30840A04A2389C886" }

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
    40 // maxMarginFeeBasisPoints 0.4%
  ], "Timelock")

  const deployedTimelock = await contractAt("Timelock", timelock.address)
  const vault = await contractAt("Vault", "0x9cC4E8e60a2c9a67Ac7D20f54607f98EfBA38AcF")

  await sendTxn(deployedTimelock.setShouldToggleIsLeverageEnabled(true), "deployedTimelock.setShouldToggleIsLeverageEnabled(true)")
  await sendTxn(deployedTimelock.setContractHandler(positionRouter.address, true), "deployedTimelock.setContractHandler(positionRouter)")
  await sendTxn(deployedTimelock.setContractHandler(positionManager.address, true), "deployedTimelock.setContractHandler(positionManager)")

  // update gov of vault
  await sendTxn(vault.setGov(deployedTimelock.address), "vault.setGov")

  const handlers = [
    "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce", // Morpheus
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
