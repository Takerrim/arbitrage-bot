import hre from "hardhat"
import { BISWAP_ROUTER_ADDRESS, PANCAKESWAP_ROUTER_ADDRESS, PATHS } from "../constants"
import { formatUnits, parseUnits } from "../utils"
import { Arbitrage__factory } from "../typechain-types"
import { approve, topupAssetToSigner } from "../helpers"
import { TTransactionRequest } from "../types"
import wbnbAbi from '../abi/wbnb.abi.json'

const IMPERSONATED_ACCOUNT = '0xadcf6e49e999227ab909fbbeedd81115f5fb53c3'

async function main() {
  const provider = new hre.ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
  const signer = provider.getSigner()
  const signerAddress = await signer.getAddress()
  
  /** UNCOMMENT IF NEEDED TO DEPOSIT MORE BNB TO WBNB */
  const wbnbContract = new hre.ethers.Contract('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', wbnbAbi, signer)
  const tx = await wbnbContract.functions.deposit({
    value: parseUnits(5)
  })
  await tx.wait()

  /** UNCOMMENT IF NEEDED TO TOPUP USDT */
  await topupAssetToSigner(provider.getSigner())

  const usdtContract = new hre.ethers.Contract('0x55d398326f99059fF775485246999027B3197955', wbnbAbi, provider)
  const initialUsdtBalance = await usdtContract.functions.balanceOf(signerAddress)
  console.log(`initialUsdtBalance: ${initialUsdtBalance}`)

  const arbitrage = Arbitrage__factory.connect('0x3971F697cb1a3F7D090FB6a915F654e8741EF797', provider.getSigner())
  const tradedAmount = await arbitrage.estimateDualTrade(initialUsdtBalance.toString(), PATHS["USDT/CAKE"], PANCAKESWAP_ROUTER_ADDRESS, BISWAP_ROUTER_ADDRESS)
  const profit = tradedAmount.sub(initialUsdtBalance.toString())

  console.log(`Estimated profit without tx fee ${formatUnits(profit)}$`)
  // await approve('0x55d398326f99059fF775485246999027B3197955', wbnbAbi, signer, PANCAKESWAP_ROUTER_ADDRESS, initialUsdtBalance)
  // await approve('0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', wbnbAbi, signer, BISWAP_ROUTER_ADDRESS, 350)
  const tradeTx = await arbitrage.trade(initialUsdtBalance.toString(), PATHS["USDT/CAKE"], PANCAKESWAP_ROUTER_ADDRESS, BISWAP_ROUTER_ADDRESS, {
    gasLimit: 1000000,
  })
  await tradeTx.wait()

  const usdtBalanceAfterArbitrage = await usdtContract.functions.balanceOf(signerAddress)
  console.log(`usdtBalanceAfterArbitrage: ${formatUnits(usdtBalanceAfterArbitrage)}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
