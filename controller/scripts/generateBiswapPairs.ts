import { biswap } from "../contracts/Biswap"
import { saveAllBiswapPairsIntoFile } from "../helpers/saveAllBiswapPairs"

saveAllBiswapPairsIntoFile(biswap.jsonRpcProvider)
