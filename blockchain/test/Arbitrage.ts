import { expect } from "chai"
import hre, { ethers } from "hardhat"
import { DECIMALS } from "../constants"

// USDT -> ETH
const PATH = ['0x55d398326f99059fF775485246999027B3197955', '0x2170Ed0880ac9A755fd29B2688956BD959F933F8']

const main = async () => {
  describe('Arbitrage', () => {
    it('Check asset balance is replenished', async () => {
      const Arbitrage = await hre.ethers.getContractFactory('Arbitrage')
      const arbitrage = await Arbitrage.deploy()
      const usdt = '0x2170Ed0880ac9A755fd29B2688956BD959F933F8'
      const tx = await arbitrage.topupAssetBalance(usdt, 100)
      await tx.wait()
      const amount = await arbitrage.currentAssetBalance(usdt)
      const formattedAmount = ethers.utils.formatUnits(amount, DECIMALS)
      expect(formattedAmount).to.equal('100')
    })
  })
}

main()
