import { ChainId, Token, Pair, Trade, Route, TradeType, fe } from '@pancakeswap/sdk'
import { BaseContract } from './BaseContract'
import { TAddress } from '../types/common'
import { DECIMALS } from '../constants'
import { ethers } from 'hardhat'

class PancakeSwap extends BaseContract {
  public async getAmountOut(data: { tokenIn: TAddress, tokenOut: TAddress }) {
    try {
      const tokenIn = new Token(ChainId.BSC, data.tokenIn, DECIMALS, '')
      const tokenOut = new Token(ChainId.BSC, data.tokenOut, DECIMALS, '')
      const pair = new Pair(tokenIn, tokenOut)
      const route = new Route([pair], tokenIn, tokenOut)
      const { executionPrice } = new Trade(route, new TokenAmount(tokenIn, ethers.utils.parseUnits('1', 'gwei').toString()), TradeType.EXACT_INPUT)
      return executionPrice.toSignificant(6)
    } catch {
      return null
    }
  }
}

export const pancakeSwap = new PancakeSwap()
