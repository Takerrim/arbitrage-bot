import fse from 'fs-extra'
import { BiswapFactoryAbi__factory } from '../types/ethers-contracts'
import { FACTORY_ADDRESS } from 'biswap-sdk'
import { ethers } from 'ethers'
import { bscScanApi } from '../services/BscScanApi'
import { isJsonString } from './index'
import { TJSONPair } from '../types/common'
import path from 'path'

export const saveAllBiswapPairsIntoFile = async (provider: ethers.providers.JsonRpcProvider) => {
  try {
    const factory = BiswapFactoryAbi__factory.connect(FACTORY_ADDRESS, provider)
    const pairsCount = (await factory.allPairsLength()).toNumber()
    const pairAddresses: TJSONPair = {}
  
    for (let i = 0; i <= pairsCount; ++i) {
      const pairAddress = await factory.allPairs(i)
      const abi = await bscScanApi.getContractABI(pairAddress)
      if (!isJsonString(abi)) {
        continue
      }
      const pairContract = await new ethers.Contract(pairAddress, abi, provider)
      const [token0Address, token1Address] = await Promise.all([pairContract.token0(), pairContract.token1()])
      const [pairToken0Abi, pairToken1Abi] = await Promise.all([bscScanApi.getContractABI(token0Address), bscScanApi.getContractABI(token1Address)])
      if (!isJsonString(pairToken0Abi) || !isJsonString(pairToken1Abi)) {
        continue
      }
      const pairToken0Contract = new ethers.Contract(token0Address, pairToken0Abi, provider)
      const pairToken1Contract = new ethers.Contract(token1Address, pairToken1Abi, provider)
      if (!pairToken0Contract.symbol || !pairToken1Contract.symbol) {
        continue
      }
      const [pairToken0Symbol, pairToken1Symbol] = await Promise.all([pairToken0Contract.symbol(), pairToken1Contract.symbol()])
      pairAddresses[`${pairToken0Symbol.toUpperCase()}/${pairToken1Symbol.toUpperCase()}`] = [token0Address, token1Address]
      console.info(`Adding pair number ${i} of ${pairsCount}`)
      fse.outputJSONSync(path.resolve(__dirname, '../constants/biswap-pairs.json'), pairAddresses, { spaces: 2 })
    }
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
