const { contractAt , sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

// const network = (process.env.HARDHAT_NETWORK || 'mainnet');
// const tokens = require('./tokens')[network];

// async function getArbValues() {
//   const referralStorage = await contractAt("ReferralStorage", "0xe6fab3F0c7199b0d34d7FbE83394fc0e0D06e99d")

//   return { referralStorage }
// }

// async function getAvaxValues() {
//   const referralStorage = await contractAt("ReferralStorage", "0x827ED045002eCdAbEb6e2b0d1604cf5fC3d322F8")

//   return { referralStorage }
// }

// async function getValues() {
//   if (network === "arbitrum") {
//     return getArbValues()
//   }

//   if (network === "avax") {
//     return getAvaxValues()
//   }
// }

async function main() {
  const referralStorage = await contractAt("ReferralStorage", "0x8DEfd6b1C07ff577D2b271D3de143FB3E724288e")

  await sendTxn(referralStorage.setTier(0, 1000, 5000), "referralStorage.setTier 0")
  await sendTxn(referralStorage.setTier(1, 2000, 5000), "referralStorage.setTier 1")
  await sendTxn(referralStorage.setTier(2, 2500, 4000), "referralStorage.setTier 2")

  await sendTxn(referralStorage.setReferrerTier("0xDd257d090FA0f9ffB496b790844418593e969ba6", 1), "referralStorage.setReferrerTier 1")
  await sendTxn(referralStorage.setReferrerTier("0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce", 2), "referralStorage.setReferrerTier 2")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
