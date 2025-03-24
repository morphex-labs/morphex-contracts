const { deployContract, contractAt , sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

// const network = (process.env.HARDHAT_NETWORK || 'mainnet');
// const tokens = require('./tokens')[network];

async function main() {
  // const { nativeToken } = tokens

  const orderBook = await deployContract("OrderBook", []);

  await sendTxn(orderBook.initialize(
    "0x0a2653a193595d91678830512DE2733727953169", // router
    "0x9cC4E8e60a2c9a67Ac7D20f54607f98EfBA38AcF", // vault
    "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38", // wS
    "0x25431F78c9B7be0F285301A6ACF334Cdb838C4D6", // usdg
    "100000000000000000", // 0.1 S
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
