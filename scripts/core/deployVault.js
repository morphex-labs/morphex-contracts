const { deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
// const tokens = require('./tokens')[network];

async function main() {
  const nativeTokenAddress = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"; // wftm

  // const vault = await deployContract("Vault", [])
  const vault = await contractAt("Vault", "0x245cD6d33578de9aF75a3C0c636c726b1A8cbdAa")
  // const usdg = await deployContract("USDG", [vault.address])
  const usdg = await contractAt("USDG", "0xe135c7BFfda932b5B862Da442cF4CbC4d43DC3Ad")
  // const router = await deployContract("Router", [vault.address, usdg.address, nativeTokenAddress])
  const router = await contractAt("Router", "0x3D5343749279a974c16FCFF3515879C0e18E91C4")
  const vaultPriceFeed = await contractAt("VaultPriceFeed", "0x7a451DE877CbB6551AACa671d0458B6f9dF1e29A")
  // const secondaryPriceFeed = await deployContract("FastPriceFeed", [5 * 60])

  // const vaultPriceFeed = await deployContract("VaultPriceFeed", [])

  await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation") // 0.05 USD
  await sendTxn(vaultPriceFeed.setPriceSampleSpace(1), "vaultPriceFeed.setPriceSampleSpace")
  await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), "vaultPriceFeed.setIsAmmEnabled")

  const glp = await deployContract("GLP", [])
  await sendTxn(glp.setInPrivateTransferMode(true), "glp.setInPrivateTransferMode")
  // const glp = await contractAt("GLP", "0xbd1dCEc2103675C8F3953c34aE40Ed907E1DCAC2")

  const shortsTracker = await deployContract("ShortsTracker", [vault.address])
  // await sendTxn(shortsTracker.setGov(gov.address), "shortsTracker.setGov")

  const glpManager = await deployContract("GlpManager", [vault.address, usdg.address, glp.address, shortsTracker.address, 15 * 60])
  // const glpManager = await contractAt("GlpManager", "0x749DA3a34A6E1b098F3BFaEd23DAD2b7D7846b9B")
  await sendTxn(glpManager.setInPrivateMode(true), "glpManager.setInPrivateMode")

  await sendTxn(glp.setMinter(glpManager.address, true), "glp.setMinter")
  await sendTxn(usdg.addVault(glpManager.address), "usdg.addVault(glpManager)")

  await sendTxn(vault.initialize(
    router.address, // router
    usdg.address, // usdg
    vaultPriceFeed.address, // priceFeed
    toUsd(5), // liquidationFeeUsd
    100, // fundingRateFactor
    100 // stableFundingRateFactor
  ), "vault.initialize")

  await sendTxn(vault.setFundingRate(60 * 60, 100, 100), "vault.setFundingRate")

  await sendTxn(vault.setInManagerMode(true), "vault.setInManagerMode")
  await sendTxn(vault.setManager(glpManager.address, true), "vault.setManager")

  await sendTxn(vault.setFees(
    50, // _taxBasisPoints
    5, // _stableTaxBasisPoints
    20, // _mintBurnFeeBasisPoints
    20, // _swapFeeBasisPoints
    1, // _stableSwapFeeBasisPoints
    10, // _marginFeeBasisPoints
    toUsd(5), // _liquidationFeeUsd
    24 * 60 * 60, // _minProfitTime
    true // _hasDynamicFees
  ), "vault.setFees")

  const vaultErrorController = await deployContract("VaultErrorController", [])
  // const vaultErrorController = await contractAt("VaultErrorController", "0x512F8D4E28EB53A6d036aEDA9C5a4D1De6DBD543")

  await sendTxn(vault.setErrorController(vaultErrorController.address), "vault.setErrorController")
  await sendTxn(vaultErrorController.setErrors(vault.address, errors), "vaultErrorController.setErrors")

  const vaultUtils = await deployContract("VaultUtils", [vault.address])
  await sendTxn(vault.setVaultUtils(vaultUtils.address), "vault.setVaultUtils")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
