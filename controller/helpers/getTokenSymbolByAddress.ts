import { currencies } from "../constants/currencies"
import { TAddress } from "../types/common"

export const getTokenSymbolByAddress = (address: TAddress) => {
  return Object.entries(currencies).find(([, value]) => value === address)?.[0]
}