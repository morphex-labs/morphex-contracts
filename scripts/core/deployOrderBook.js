const { deployContract, contractAt , sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

// const network = (process.env.HARDHAT_NETWORK || 'mainnet');
// const tokens = require('./tokens')[network];

async function main() {
  // const { nativeToken } = tokens

  const orderBook = await deployContract("OrderBook", []);

  await sendTxn(orderBook.initialize(
    "0x3D5343749279a974c16FCFF3515879C0e18E91C4", // router
    "0x245cD6d33578de9aF75a3C0c636c726b1A8cbdAa", // vault
    "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", // weth
    "0xe135c7BFfda932b5B862Da442cF4CbC4d43DC3Ad", // usdg
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
