const { deployContract, contractAt , sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

// const network = (process.env.HARDHAT_NETWORK || 'mainnet');
// const tokens = require('./tokens')[network];

async function main() {
  // const { nativeToken } = tokens

  const orderBook = await deployContract("OrderBook", []);

  await sendTxn(orderBook.initialize(
    "0x26e6C47682FfC1824d7aC5512752FC671dA5e607", // router
    "0x46940Dc651bFe3F2CC3E04cf9dC5579B50Cf0765", // vault
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // weth
    "0x548f93779fBC992010C07467cBaf329DD5F059B7", // usdg
    "3500000000000000", // 0.0035 BNB
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
