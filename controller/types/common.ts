import { currencies } from "../constants/currencies"

type ValueOf<T> = T[keyof T]

export type TCurrency = ValueOf<typeof currencies>

export type TAddress = string

export type TJSONPair = {
  [pairName: string]: [TAddress, TAddress]
}