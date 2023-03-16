const { deployContract, contractAt , sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

// const network = (process.env.HARDHAT_NETWORK || 'mainnet');
// const tokens = require('./tokens')[network];

async function main() {
  // const { nativeToken } = tokens

  const orderBook = await deployContract("OrderBook", []);

  // Fantom testnet addresses
  await sendTxn(orderBook.initialize(
    "0x3Acf67bD8C291F9C5bbBB14AC0eC86F60ABCE36E", // router
    "0x3CB54f0eB62C371065D739A34a775CC16f46563e", // vault
    "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // weth
    "0xB7209EbCBF71c0ffA1585B4468A11CFfdcDBB9a9", // usdg
    "250000000000000000", // 0.25 FTM
    expandDecimals(10, 30) // min purchase token amount usd
  ), "orderBook.initialize");

  writeTmpAddresses({
    orderBook: orderBook.address
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
