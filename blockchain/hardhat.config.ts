import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    'bsc-testnet': {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97,
      gasPrice: 20000000000,
      accounts: ['2bb117f94d970a7dc740bafc8f6429bf87fd01b74ec18bf54765f862030f4743'],
    },
  },
}

export default config
