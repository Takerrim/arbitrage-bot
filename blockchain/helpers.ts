import { BigNumberish, ethers as TEthers } from "ethers"
import { ethers } from "hardhat"
import biswapRouterAbi from './abi/biswapRouter.abi.json'
import wbnbAbi from './abi/wbnb.abi.json'
import { parseUnits } from "./utils"
import { PANCAKESWAP_ROUTER_ADDRESS } from "./constants"

export const approve = async (contractAddress: string, contractAbi: TEthers.ContractInterface, signer: TEthers.Signer, spender: string, value: BigNumberish) => {
  const bnbContract = new ethers.Contract(contractAddress, contractAbi, signer)
  const tx = await bnbContract.functions.approve(spender, parseUnits(value))
  const receipt = await tx.wait()
  return receipt
}

export const topupUsdt = async (signer: TEthers.Signer, recipient: string) => {
  const router = new ethers.Contract(PANCAKESWAP_ROUTER_ADDRESS, biswapRouterAbi, signer)
  await approve('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', wbnbAbi, signer, PANCAKESWAP_ROUTER_ADDRESS, 5)
  const wbnbToUsdtPath = ['0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', '0x55d398326f99059fF775485246999027B3197955']
  const amountsOut = await router.functions.getAmountsOut(parseUnits(2), wbnbToUsdtPath)
  const deadline = Math.floor((Date.now() + 3000) / 1000)

  await router.functions.swapExactTokensForTokens(
    parseUnits(2),
    amountsOut[0][1].toString(),
    wbnbToUsdtPath,
    recipient,
    deadline
  )
}
