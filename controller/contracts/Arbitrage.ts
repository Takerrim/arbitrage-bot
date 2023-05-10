import { ARBITRAGE_BOT_CONTRACT_ADDRESS } from "../constants";
import { ArbitrageAbi, ArbitrageAbi__factory } from "../types/ethers-contracts";
import { BaseContract } from "./BaseContract";

class Arbitrage extends BaseContract {
  private contract!: ArbitrageAbi

  constructor() {
    super()
    this.contract = ArbitrageAbi__factory.connect(ARBITRAGE_BOT_CONTRACT_ADDRESS, this.provider)
  }

  async trade() {
    this.contract.topupAssetBalance('0x377533d0e68a22cf180205e9c9ed980f74bc5050', {
      value: 50,
    })
  }
}

export const arbitrage = new Arbitrage()
