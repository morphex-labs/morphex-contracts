const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const tokens = require('./tokens')['sonic'];

async function main() {
  // const signer = await getFrameSigner()

  // const { vault, tokenArr } = await getValues()
  const vault = await contractAt("Vault", "0x9cC4E8e60a2c9a67Ac7D20f54607f98EfBA38AcF")
  const timelock = await contractAt("Timelock", await vault.gov())

  // const vaultMethod = "signalVaultSetTokenConfig"
  const vaultMethod = "vaultSetTokenConfig"

  const { s, weth, usdc } = tokens
  const tokenArr = [s, weth, usdc]

  console.log("vault", vault.address)
  console.log("timelock", timelock.address)   
  console.log("tokenArr", tokenArr.map(t => t.address))
  // console.log("vaultTimelock", vaultTimelock.address)
  // console.log("vaultMethod", vaultMethod)

  // for (const token of tokenArr) {
  //   await sendTxn(timelock.vaultSetTokenConfig(
  //     vault.address,
  //     token.address, // _token
  //     token.decimals, // _tokenDecimals
  //     token.tokenWeight, // _tokenWeight
  //     token.minProfitBps, // _minProfitBps
  //     expandDecimals(token.maxUsdgAmount, 18), // _maxUsdgAmount
  //     token.isStable, // _isStable
  //     token.isShortable // _isShortable
  //   ), `vault.setTokenConfig(${token.name}) ${token.address}`)
  // }
  
  for (const token of tokenArr) {
    await sendTxn(timelock[vaultMethod](
      vault.address,
      token.address, // _token
      token.decimals, // _tokenDecimals
      token.tokenWeight, // _tokenWeight
      token.minProfitBps, // _minProfitBps
      expandDecimals(token.maxUsdgAmount, 18), // _maxUsdgAmount
      token.isStable, // _isStable
      token.isShortable // _isShortable
    ), `vault.${vaultMethod}(${token.name}) ${token.address}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
