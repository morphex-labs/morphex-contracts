const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')['base'];

async function getArbValues() {
  const vault = await contractAt("Vault", "0x489ee077994B6658eAfA855C308275EAd8097C4A")

  const {} = tokens
  const tokenArr = []

  return { vault, tokenArr }
}

async function getAvaxValues() {
  const vault = await contractAt("Vault", "0x9ab2De34A33fB459b538c43f251eB825645e8595")

  const { btcb } = tokens
  const tokenArr = [btcb]

  return { vault, tokenArr }
}

async function getValues() {
  if (network === "arbitrum") {
    return getArbValues()
  }

  if (network === "avax") {
    return getAvaxValues()
  }
}

async function main() {
  // const signer = await getFrameSigner()

  // const { vault, tokenArr } = await getValues()
  const vault = await contractAt("Vault", "0xec8d8D4b215727f3476FF0ab41c406FA99b4272C")
  const timelock = await contractAt("Timelock", await vault.gov())

  // const vaultMethod = "signalVaultSetTokenConfig"
  // const vaultMethod = "vaultSetTokenConfig"

  const { usdcCircle } = tokens
  const tokenArr = [usdcCircle]

  console.log("vault", vault.address)
  console.log("timelock", timelock.address)   
  console.log("tokenArr", tokenArr.map(t => t.address))
  // console.log("vaultTimelock", vaultTimelock.address)
  // console.log("vaultMethod", vaultMethod)

  for (const token of tokenArr) {
    await sendTxn(timelock.vaultSetTokenConfig(
      vault.address,
      token.address, // _token
      token.decimals, // _tokenDecimals
      token.tokenWeight, // _tokenWeight
      token.minProfitBps, // _minProfitBps
      expandDecimals(token.maxUsdgAmount, 18), // _maxUsdgAmount
      token.isStable, // _isStable
      token.isShortable // _isShortable
    ), `vault.setTokenConfig(${token.name}) ${token.address}`)
  }
  
  // for (const token of tokenArr) {
  //   await sendTxn(vaultTimelock[vaultMethod](
  //     vault.address,
  //     token.address, // _token
  //     token.decimals, // _tokenDecimals
  //     token.tokenWeight, // _tokenWeight
  //     token.minProfitBps, // _minProfitBps
  //     expandDecimals(token.maxUsdgAmount, 18), // _maxUsdgAmount
  //     token.isStable, // _isStable
  //     token.isShortable // _isShortable
  //   ), `vault.${vaultMethod}(${token.name}) ${token.address}`)
  // }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
