import { utils } from "ethers"
import dotenv from 'dotenv'
dotenv.config()

import { BNB_ROUND_FACTOR, BNB_USDT_PRICE_FEED_CONTRACT_ADDRESS, DEFAULT_GAS_LIMIT, GWEI } from "../constants"
import { BaseContract } from "./BaseContract"
import { BnbUsdtPriceFeedAbi, BnbUsdtPriceFeedAbi__factory } from '../types/ethers-contracts'

class BscPriceFeed extends BaseContract {
  private bnbUsdtPriceFeedContract!: BnbUsdtPriceFeedAbi

  constructor() {
    super()
    this.bnbUsdtPriceFeedContract = BnbUsdtPriceFeedAbi__factory.connect(BNB_USDT_PRICE_FEED_CONTRACT_ADDRESS, this.provider)
  }

  public async getBNBPrice() {
    const [, latestBnbPrice] = await this.bnbUsdtPriceFeedContract.latestRoundData()
    return utils.formatUnits(latestBnbPrice, BNB_ROUND_FACTOR)
  }

  public async getTxFeeInUSD() {
    const gasPrice = await this.provider.getGasPrice()
    const gasPriceInGwei = Number(utils.formatUnits(gasPrice, 'gwei'))
    const bnbPrice = await this.getBNBPrice()
    const roundedTxFeeInUsd = (((gasPriceInGwei * DEFAULT_GAS_LIMIT) / GWEI) * parseFloat(bnbPrice)).toFixed(2)
    return roundedTxFeeInUsd
  }
}

export const bscPriceFeed = new BscPriceFeed()
