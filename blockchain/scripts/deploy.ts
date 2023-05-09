import { ethers } from "hardhat"

async function main() {
  const Arbitrage = await ethers.getContractFactory('Arbitrage')
  const arbitrage = await Arbitrage.deploy()
  await arbitrage.deployed()
  console.log(`Arbitrage contract was deployed to ${arbitrage.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
