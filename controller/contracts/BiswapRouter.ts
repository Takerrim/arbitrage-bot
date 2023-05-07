import { BaseContract } from "./BaseContract";
import { BISWAP_ROUTER_CONTRACT_ADDRESS } from "../constants";
import { BiswapRouterAbi, BiswapRouterAbi__factory } from '../types/ethers-contracts'
import { ethers } from "ethers";
import type { TCurrency } from "../types/common";
import { getTradeFee } from "../helpers/getTradeFee";
import { BISWAP_TRADING_FEE_IN_PERCENTS } from "../constants/fees";
import { getTokenSymbolByAddress } from "../helpers/getTokenSymbolByAddress";
import { currencies } from "../constants/currencies";

class BiswapRouter extends BaseContract {
  private contract!: BiswapRouterAbi

  constructor() {
    super()
    this.contract = BiswapRouterAbi__factory.connect(BISWAP_ROUTER_CONTRACT_ADDRESS, this.provider)
  }

  public async swapTokenForToken() {
    // const tx = await this.contract.swapExactTokensForTokens()
  }

  public async getAmountOut(data: { tokenIn: TCurrency, tokenOut: TCurrency }) {
    const amount = await this.contract.getAmountsOut(ethers.utils.parseUnits('1', 'gwei'), [data.tokenIn, currencies.BNB, currencies.USDC, data.tokenOut])
    const amountOut = ethers.utils.formatUnits(amount[3], 'gwei')
    const result = parseFloat(amountOut)
    console.log(`[biswap] ${getTokenSymbolByAddress(data.tokenIn)} price: $${result}`)
    return result
  }
}

export const biswapRouter = new BiswapRouter()