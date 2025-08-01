const { getFrameSigner, deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const vault = await contractAt("Vault", "0x9cC4E8e60a2c9a67Ac7D20f54607f98EfBA38AcF")
  // const timelock = await contractAt("Timelock", await vault.gov())
  const vaultUtils = await deployContract("VaultUtils", [vault.address])
  // await sendTxn(timelock.setVaultUtils(vault.address, vaultUtils.address), "timelock.setVaultUtils")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
