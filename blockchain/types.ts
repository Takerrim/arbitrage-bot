import type { ethers } from "ethers"

export type TTransactionRequest = ethers.utils.Deferrable<ethers.providers.TransactionRequest>
