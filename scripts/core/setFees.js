const { getFrameSigner, deployContract, contractAt , sendTxn, writeTmpAddresses, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = 'bsc';

async function main() {
  let vault
  if (network === "bsc") {
    vault = await contractAt("Vault", "0x46940Dc651bFe3F2CC3E04cf9dC5579B50Cf0765")
  }
  if (network === "fantom") {
    vault = await contractAt("Vault", "0x3CB54f0eB62C371065D739A34a775CC16f46563e")
  }

  const timelock = await contractAt("Timelock", await vault.gov())
  console.log("timelock", timelock.address)

  await sendTxn(timelock.setFees(
    vault.address,
    50, // _taxBasisPoints
    5, // _stableTaxBasisPoints
    20, // _mintBurnFeeBasisPoints
    30, // _swapFeeBasisPoints
    1, // _stableSwapFeeBasisPoints
    10, // _marginFeeBasisPoints
    toUsd(5), // _liquidationFeeUsd
    86400, // _minProfitTime
    true // _hasDynamicFees
  ), "vault.setFees")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
