const { deployContract } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const { AddressZero } = ethers.constants

async function runForArbitrum() {
  const admin = "0x49B373D422BdA4C6BfCdd5eC1E48A9a26fdA2F8b"
  const rewardManager = { address: AddressZero }
  const buffer = 24 * 60 * 60
  const longBuffer = 7 * 24 * 60 * 60
  const tokenManager = { address: "0xddDc546e07f1374A07b270b7d863371e575EA96A" }
  const mintReceiver = { address: AddressZero }
  const maxTokenSupply = expandDecimals("13250000", 18)

  const timelock = await deployContract("GmxTimelock", [
    admin,
    buffer,
    longBuffer,
    rewardManager.address,
    tokenManager.address,
    mintReceiver.address,
    maxTokenSupply
  ], "GmxTimelock", { gasLimit: 100000000 })
}

async function runForAvax() {
  const admin = "0x49B373D422BdA4C6BfCdd5eC1E48A9a26fdA2F8b"
  const rewardManager = { address: ethers.constants.AddressZero }
  const buffer = 24 * 60 * 60
  const longBuffer = 7 * 24 * 60 * 60
  const tokenManager = { address: "0x8b25Ba1cAEAFaB8e9926fabCfB6123782e3B4BC2" }
  const mintReceiver = { address: AddressZero }
  const maxTokenSupply = expandDecimals("13250000", 18)

  const timelock = await deployContract("GmxTimelock", [
    admin,
    buffer,
    longBuffer,
    rewardManager.address,
    tokenManager.address,
    mintReceiver.address,
    maxTokenSupply
  ])
}

async function runForFantom() {
  const admin = "0xB1dD2Fdb023cB54b7cc2a0f5D9e8d47a9F7723ce"
  const rewardManager = { address: ethers.constants.AddressZero }
  const buffer = 48 * 60 * 60
  const longBuffer = 30 * 24 * 60 * 60
  const tokenManager = { address: "0xDd257d090FA0f9ffB496b790844418593e969ba6" }
  const mintReceiver = { address: AddressZero }
  const maxTokenSupply = expandDecimals("50000000", 18)

  const timelock = await deployContract("MpxTimelock", [
    admin,
    buffer,
    longBuffer,
    rewardManager.address,
    tokenManager.address,
    mintReceiver.address,
    maxTokenSupply
  ])
}

async function runForBase() {
  const admin = "0xE02Fb5C70aF32F80Aa7F9E8775FE7F12550348ec"
  const rewardManager = { address: ethers.constants.AddressZero }
  const buffer = 24 * 60 * 60
  const longBuffer = 30 * 24 * 60 * 60
  const tokenManager = { address: "0xE02Fb5C70aF32F80Aa7F9E8775FE7F12550348ec" }
  const mintReceiver = { address: AddressZero }
  const maxTokenSupply = expandDecimals("10000000", 18)

  const timelock = await deployContract("BmxTimelock", [
    admin,
    buffer,
    longBuffer,
    rewardManager.address,
    tokenManager.address,
    mintReceiver.address,
    maxTokenSupply
  ])
  console.log("timelock", timelock.address)
}

async function runForMode() {
  const admin = "0x99FC968d932f394256e536B5dF3A6e2C8aa2DD36"
  const rewardManager = { address: ethers.constants.AddressZero }
  const buffer = 24 * 60 * 60
  const longBuffer = 30 * 24 * 60 * 60
  const tokenManager = { address: "0x99FC968d932f394256e536B5dF3A6e2C8aa2DD36" }
  const mintReceiver = { address: AddressZero }
  const maxTokenSupply = expandDecimals("10000000", 18)

  const timelock = await deployContract("BmxTimelock", [
    admin,
    buffer,
    longBuffer,
    rewardManager.address,
    tokenManager.address,
    mintReceiver.address,
    maxTokenSupply
  ])
  console.log("timelock", timelock.address)
}

async function main() {
  await runForMode()
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
