const { deployContract, contractAt , sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

// const network = (process.env.HARDHAT_NETWORK || 'mainnet');
// const tokens = require('./tokens')[network];

async function main() {
  // const { nativeToken } = tokens

  const orderBook = await deployContract("OrderBook", []);

  await sendTxn(orderBook.initialize(
    "0xAa40201575140862E9aE4F00515245670582e6e0", // router
    "0xff745bdB76AfCBa9d3ACdCd71664D4250Ef1ae49", // vault
    "0x4200000000000000000000000000000000000006", // weth
    "0x77F480fdB7100d096c2de1876C1f4960Fa488246", // usdg
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
