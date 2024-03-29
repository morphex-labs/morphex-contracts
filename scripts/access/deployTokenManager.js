const { deployContract, contractAt, writeTmpAddresses, sendTxn } = require("../shared/helpers")

async function main() {
  const tokenManager = await deployContract("TokenManager", [2], "TokenManager")

  // const signers = [
  //   "0x45e48668F090a3eD1C7961421c60Df4E66f693BD", // Dovey
  //   "0xD7941C4Ca57a511F21853Bbc7FBF8149d5eCb398", // G
  //   "0x881690382102106b00a99E3dB86056D0fC71eee6", // Han Wen
  //   "0x2e5d207a4c0f7e7c52f6622dcc6eb44bc0fe1a13", // Krunal Amin
  //   "0x6091646D0354b03DD1e9697D33A7341d8C93a6F5", // xhiroz
  //   "0xd6D5a4070C7CFE0b42bE83934Cc21104AbeF1AD5" // Bybit Security Team
  // ]

  const signers = [
    "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce",
    "0x72671e23A369114786Fd00b555CF16A89C66c00F",
    "0xCf4f678B5c2051C97f2e02723Bdd1158d35E1341"
  ]

  await sendTxn(tokenManager.initialize(signers), "tokenManager.initialize")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
