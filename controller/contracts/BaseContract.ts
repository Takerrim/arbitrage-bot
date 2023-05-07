import { ethers } from 'ethers'
import type { ethers as TEthers } from 'ethers'
import dotenv from 'dotenv'
dotenv.config()

const { JSON_RPC_PROVIDER_URL } = process.env

export class BaseContract {
  protected provider!: TEthers.providers.JsonRpcProvider

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(JSON_RPC_PROVIDER_URL)
  }

  get jsonRpcProvider() {
    return this.provider
  }
}
