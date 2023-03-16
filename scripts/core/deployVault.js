const { deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
// const tokens = require('./tokens')[network];

async function main() {
  const nativeTokenAddress = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";

  // const vault = await deployContract("Vault", [])
  const vault = await contractAt("Vault", "0x3CB54f0eB62C371065D739A34a775CC16f46563e")
  // const usdg = await deployContract("USDG", [vault.address])
  const usdg = await contractAt("USDG", "0xB7209EbCBF71c0ffA1585B4468A11CFfdcDBB9a9")
  const router = await deployContract("Router", [vault.address, usdg.address, nativeTokenAddress])
  // const router = await contractAt("Router", "0x662B64186B50d5346321cf4740119EF04A72De27")
  const vaultPriceFeed = await contractAt("VaultPriceFeed", "0x1e4eed8fd57DFBaaE060F894582eC0183c5D6e38")
  // const secondaryPriceFeed = await deployContract("FastPriceFeed", [5 * 60])

  // const vaultPriceFeed = await deployContract("VaultPriceFeed", [])

  await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation") // 0.05 USD
  await sendTxn(vaultPriceFeed.setPriceSampleSpace(1), "vaultPriceFeed.setPriceSampleSpace")
  await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), "vaultPriceFeed.setIsAmmEnabled")

  const glp = await deployContract("GLP", [])
  await sendTxn(glp.setInPrivateTransferMode(true), "glp.setInPrivateTransferMode")
  // const glp = await contractAt("GLP", "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258")

  const shortsTracker = await deployContract("ShortsTracker", [vault.address])
  // await sendTxn(shortsTracker.setGov(gov.address), "shortsTracker.setGov")

  const glpManager = await deployContract("GlpManager", [vault.address, usdg.address, glp.address, shortsTracker.address, 15 * 60])
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
