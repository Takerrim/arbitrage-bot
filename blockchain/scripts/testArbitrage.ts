import hre from "hardhat"
import { BISWAP_ROUTER_ADDRESS, PANCAKESWAP_ROUTER_ADDRESS, PATHS } from "../constants"
import { formatUnits, parseUnits } from "../utils"
import { Arbitrage__factory } from "../typechain-types"
import { topupUsdt } from "../helpers"
import wbnbAbi from '../abi/wbnb.abi.json'

const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'

async function main() {
  const provider = new hre.ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
  const signer = provider.getSigner()

  const arbitrage = Arbitrage__factory.connect('0x216B01f973Cfef7c82D245a182CCEDa7C132fF6a', signer)

  /** UNCOMMENT IF NEEDED TO DEPOSIT MORE BNB TO WBNB */
  const wbnbContract = new hre.ethers.Contract('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', wbnbAbi, signer)
  const tx = await wbnbContract.functions.deposit({
    value: parseUnits(5)
  })
  await tx.wait()

  /** UNCOMMENT IF NEEDED TO TOPUP USDT */
  await topupUsdt(signer, arbitrage.address)

  // const usdtContract = new hre.ethers.Contract(USDT_ADDRESS, wbnbAbi, provider)
  const initialUsdtBalance = await arbitrage.getAssetBalance(USDT_ADDRESS)
  console.log(`initialUsdtBalance: ${formatUnits(initialUsdtBalance)}`)

  const tradedAmount = await arbitrage.estimateDualTrade(initialUsdtBalance, PATHS["USDT/CAKE"], BISWAP_ROUTER_ADDRESS, PANCAKESWAP_ROUTER_ADDRESS)
  console.log(`tradedAmount: ${formatUnits(tradedAmount)}`)

  const profit = tradedAmount.sub(initialUsdtBalance)

  console.log(`Estimated profit without tx fee ${formatUnits(profit)}$`)
  const tradeTx = await arbitrage.trade(initialUsdtBalance, PATHS["USDT/CAKE"], BISWAP_ROUTER_ADDRESS, PANCAKESWAP_ROUTER_ADDRESS, {
    gasLimit: 1000000,
  })
  await tradeTx.wait()

  const usdtBalanceAfterArbitrage = await arbitrage.getAssetBalance(USDT_ADDRESS)
  console.log(`usdtBalanceAfterArbitrage: ${formatUnits(usdtBalanceAfterArbitrage)}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
