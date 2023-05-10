import biswapPairs from '../constants/biswap-pairs.json'
import { getInitialParamsByCli } from "../helpers"

const main = async () => {
  const paramsByCli = await getInitialParamsByCli()
  if (paramsByCli) {
    const { pair, dexes } = paramsByCli
    
  }
}

main()
