const { deployContract, contractAt, writeTmpAddresses, sendTxn } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function main() {
  const reader = await deployContract("Reader", [], "Reader")
  await sendTxn(reader.setConfig(true), "Reader.setConfig")

  // if (network === "avax") {
  //   await sendTxn(reader.setConfig(true), "Reader.setConfig")
  // }

  writeTmpAddresses({
    reader: reader.address
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
