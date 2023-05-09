import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect } from "chai"
import hre from "hardhat"

const BISWAP_ROUTER_ADDRESS = '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8'
const PANCAKESWAP_ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
// USDT -> ETH
const PATH = ['0x55d398326f99059fF775485246999027B3197955', '0x2170Ed0880ac9A755fd29B2688956BD959F933F8']

const main = async () => {
  describe('Arbitrage', () => {
    it('Estimating dual trade must be equal to', async () => {
      const Arbitrage = await hre.ethers.getContractFactory('Arbitrage')
      const arbitrage = await Arbitrage.deploy()
      const expectedProfit = await arbitrage.estimateDualTrade(1, [''], BISWAP_ROUTER_ADDRESS, PANCAKESWAP_ROUTER_ADDRESS)
    })
  })
}

main()
