import { ethers } from "hardhat";

const BISWAP_ROUTER_ADDRESS = '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8'
const PANCAKESWAP_ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E'

async function main() {
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
