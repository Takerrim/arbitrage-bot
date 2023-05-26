import { BigNumberish, ethers } from "ethers";
import { DECIMALS, PAIR_SEPARATOR } from "../constants";
import { currencies } from "../constants/currencies"
import { TAddress } from "../types/common"

export const hasQuoteUSD = (pair: string) => pair.split('/')[1].includes('USD')

export const getPairParts = (pair: string) => ({
  base: pair.split('/')[0],
  quote: pair.split('/')[1],
})

export const toUpperCase = (input: string) => input.toUpperCase()

export const isJsonString = (str: string | null): str is string => {
  try {
    if (!str) {
      return false
    }
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export const getTradeFee = (amount: string, feeInPercents: number) => (feeInPercents * parseFloat(amount)) / 100

export const getTokenSymbolByAddress = (address: TAddress) => Object.entries(currencies).find(([, value]) => value === address)?.[0]

export const formatPairString = (inputSymbol: string, outputSymbol: string) => `${inputSymbol}${PAIR_SEPARATOR}${outputSymbol}`

export const formatUnits = (value: BigNumberish, decimals = DECIMALS) => ethers.utils.formatUnits(value.toString(), decimals)

export const parseUnits = (value: BigNumberish) => ethers.utils.parseUnits(value.toString())
