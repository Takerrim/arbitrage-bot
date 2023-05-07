import { BaseContract } from "./BaseContract";
import { NOMISWAP_ROUTER_CONTRACT_ADDRESS } from "../constants";
import { NomiswapRouterAbi, NomiswapRouterAbi__factory } from '../types/ethers-contracts'
import { ethers } from "ethers";
import type { TCurrency } from '../types/common'
import { getTradeFee } from "../helpers/getTradeFee";
import { NOMISWAP_TRADING_FEE_IN_PERCENTS } from "../constants/fees";
import { getTokenSymbolByAddress } from "../helpers/getTokenSymbolByAddress";

class NomiswapRouter extends BaseContract {
  private contract!: NomiswapRouterAbi

  constructor() {
    super()
    this.contract = NomiswapRouterAbi__factory.connect(NOMISWAP_ROUTER_CONTRACT_ADDRESS, this.provider)
  }

  public async swapTokenForToken() {
    // const tx = await this.contract.swapExactTokensForTokens()
  }

  public async getAmountOut(data: { tokenIn: TCurrency, tokenOut: TCurrency }) {
    const amount = await this.contract.getAmountsOut(ethers.utils.parseUnits('1', 'gwei'), [data.tokenIn, data.tokenOut])
    const amountOut = parseFloat(ethers.utils.formatUnits(amount[1], 'gwei'))
    const result = amountOut - getTradeFee(amountOut.toString(), NOMISWAP_TRADING_FEE_IN_PERCENTS)
    console.log(`[nomiswap] ${getTokenSymbolByAddress(data.tokenIn)} price: $${result}`)
    return result
  }
}

export const nomiswapRouter = new NomiswapRouter()