const { deployContract, contractAt , sendTxn } = require("../shared/helpers")

const nativeTokenAddress = "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38"; // wS
const depositFee = 30 // 0.3%

async function main() {
  const vault = await contractAt("Vault", "0x9cC4E8e60a2c9a67Ac7D20f54607f98EfBA38AcF")
  // const timelock = await contractAt("Timelock", await vault.gov(), signer)
  const router = await contractAt("Router", await vault.router())
  const shortsTracker = await contractAt("ShortsTracker", "0xE974A88385935CB8846482F3Ab01b6c0f70fa5f3")
  const weth = await contractAt("WETH", nativeTokenAddress)
  const orderBook = await contractAt("OrderBook", "0x7e3F5E2D89f6C83988301989fa3fc3a4ea3612A6")
  // const referralStorage = await contractAt("ReferralStorage", "0x32034bF6693Cf8c4F970962740609BF7A43ff350")

  const positionManagerAddress = undefined

  const orderKeepers = [
    { address: "0xD7a38CbC6d7153e1c37Bab3E010cB73dEc6F4971" }
  ]
  const liquidators = [
    { address: "0xb6254092f30A141bF85b2a7e3B2BcEc65d809Dd0" }
  ]

  const partnerContracts = []

  let positionManager
  if (positionManagerAddress) {
    console.log("Using position manager at", positionManagerAddress)
    positionManager = await contractAt("PositionManager", positionManagerAddress)
  } else {
  console.log("Deploying new position manager")
  const positionManagerArgs = [vault.address, router.address, shortsTracker.address, weth.address, depositFee, orderBook.address]
  positionManager = await deployContract("PositionManager", positionManagerArgs)
  }

  // positionManager only reads from referralStorage so it does not need to be set as a handler of referralStorage
  // if ((await positionManager.referralStorage()).toLowerCase() != referralStorage.address.toLowerCase()) {
  //   await sendTxn(positionManager.setReferralStorage(referralStorage.address), "positionManager.setReferralStorage")
  // }
  if (await positionManager.shouldValidateIncreaseOrder()) {
    await sendTxn(positionManager.setShouldValidateIncreaseOrder(false), "positionManager.setShouldValidateIncreaseOrder(false)")
  }

  for (let i = 0; i < orderKeepers.length; i++) {
    const orderKeeper = orderKeepers[i]
    if (!(await positionManager.isOrderKeeper(orderKeeper.address))) {
      await sendTxn(positionManager.setOrderKeeper(orderKeeper.address, true), "positionManager.setOrderKeeper(orderKeeper)")
    }
  }

  for (let i = 0; i < liquidators.length; i++) {
    const liquidator = liquidators[i]
    if (!(await positionManager.isLiquidator(liquidator.address))) {
      await sendTxn(positionManager.setLiquidator(liquidator.address, true), "positionManager.setLiquidator(liquidator)")
    }
  }

  // if (!(await timelock.isHandler(positionManager.address))) {
  //   await sendTxn(timelock.setContractHandler(positionManager.address, true), "timelock.setContractHandler(positionManager)")
  // }
  // if (!(await vault.isLiquidator(positionManager.address))) {
  //   await sendTxn(timelock.setLiquidator(vault.address, positionManager.address, true), "timelock.setLiquidator(vault, positionManager, true)")
  // }
  if (!(await shortsTracker.isHandler(positionManager.address))) {
    await sendTxn(shortsTracker.setHandler(positionManager.address, true), "shortsTracker.setContractHandler(positionManager.address, true)")
  }
  if (!(await router.plugins(positionManager.address))) {
    await sendTxn(router.addPlugin(positionManager.address), "router.addPlugin(positionManager)")
  }

  for (let i = 0; i < partnerContracts.length; i++) {
    const partnerContract = partnerContracts[i]
    if (!(await positionManager.isPartner(partnerContract))) {
      await sendTxn(positionManager.setPartner(partnerContract, true), "positionManager.setPartner(partnerContract)")
    }
  }

  // if ((await positionManager.gov()) != (await vault.gov())) {
  //   await sendTxn(positionManager.setGov(await vault.gov()), "positionManager.setGov")
  // }

  console.log("done.")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
