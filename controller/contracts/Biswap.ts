import { Token, ChainId, Fetcher, Route, Trade, TokenAmount, TradeType } from 'biswap-sdk'
import { DECIMALS } from '../constants'
import { BaseContract } from './BaseContract'
import { ethers } from 'ethers'
import { TAddress } from '../types/common'

class Biswap extends BaseContract {
  public async getAmountOut(data: { tokenIn: TAddress, tokenOut: TAddress }) {
    try {
      const tokenIn = new Token(ChainId.MAINNET, data.tokenIn, DECIMALS)
      const tokenOut = new Token(ChainId.MAINNET, data.tokenOut, DECIMALS)
      const pair = await Fetcher.fetchPairData(tokenIn, tokenOut, this.provider)
      const route = new Route([pair], tokenIn)
      const { executionPrice } = new Trade(route, new TokenAmount(tokenIn, ethers.utils.parseUnits('1', 'gwei').toString()), TradeType.EXACT_INPUT)
      return executionPrice.toSignificant(6)
    } catch {
      return null
    }
  }
}

export const biswap = new Biswap()
