const { deployContract, contractAt , sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

// const network = (process.env.HARDHAT_NETWORK || 'mainnet');
// const tokens = require('./tokens')[network];

async function main() {
  // const { nativeToken } = tokens

  const orderBook = await deployContract("OrderBook", []);

  await sendTxn(orderBook.initialize(
    "0xC608188e753b1e9558731724b7F7Cdde40c3b174", // router
    "0xec8d8D4b215727f3476FF0ab41c406FA99b4272C", // vault
    "0x4200000000000000000000000000000000000006", // weth
    "0xE974A88385935CB8846482F3Ab01b6c0f70fa5f3", // usdg
    "200000000000000", // 0.0002 ETH
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
