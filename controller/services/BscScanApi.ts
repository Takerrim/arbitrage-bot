import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const { BSC_SCAN_API_KEY } = process.env

class BscScanApi {
  public async getContractABI(address: string) {
    try {
      const { data } = await axios(`https://api.bscscan.com/api?module=contract&action=getabi&address=${address}&apikey=${BSC_SCAN_API_KEY}`)
      return data.result as string
    } catch (error) {
      console.error(error)
      return null
    }
  }
}

export const bscScanApi = new BscScanApi()
