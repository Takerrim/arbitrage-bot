import dotenv from 'dotenv'
dotenv.config()

import { ethers } from "ethers";
import { BaseContract } from "./BaseContract";

class Wallet extends BaseContract {
  private wallet!: ethers.Wallet

  constructor() {
    super()
    if (process.env.PRIVATE_KEY) {
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider)
    } else {
      console.error(`${[Wallet.name]}: Private key does not exist`)
    }
  }
}

export const wallet = new Wallet()
