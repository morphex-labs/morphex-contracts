const { deployContract } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const { AddressZero } = ethers.constants

async function main() {
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

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
