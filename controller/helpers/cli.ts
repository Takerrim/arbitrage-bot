import inquirer from 'inquirer'
import { toUpperCase, formatPairString } from "./common"
import biswapPairs from '../constants/biswap-pairs.json'
import { DEXES } from '../constants'

type TDexes = ['Biswap', 'Pancakeswap']
type TKey = keyof typeof biswapPairs
type TAnswersMap = {
  dexes: TDexes
  inputTokenSymbol: string,
  outputTokenSymbol: string,
}

const validateTokenSymbol = (input: string, answersMap: TAnswersMap) => {
  if (answersMap.inputTokenSymbol && !Object.keys(biswapPairs).includes(formatPairString(toUpperCase(answersMap.inputTokenSymbol), toUpperCase(input)))) {
    return 'Such pair does not exist'
  }
  return input === '' ? 'You have to type the symbol of token' : true
}

export const getInitialParamsByCli = async () => {
  try {
    const { inputTokenSymbol, outputTokenSymbol, dexes } = await inquirer.prompt<TAnswersMap>(
      [
        {
          message: 'Select two dex exchanges',
          name: 'dexes',
          type: 'checkbox',
          choices: DEXES,
          validate: (input: string[]) => {
            return input.length === 2 ? true : 'You have to choose two dexes to continue'
          } 
        },
        {
          message: 'Enter symbol of input token (example ETH)',
          name: 'inputTokenSymbol',
          validate: validateTokenSymbol,
          transformer: toUpperCase,
        },
        {
          message: 'Enter symbol of output token (example USDT)',
          name: 'outputTokenSymbol',
          validate: validateTokenSymbol,
          transformer: toUpperCase,
        },
      ],
    )
    
    const upperCaseInputTokenSymbol = toUpperCase(inputTokenSymbol)
    const upperCaseOutputTokenSymbol = toUpperCase(outputTokenSymbol)
    
    const formattedPair = formatPairString(upperCaseInputTokenSymbol, upperCaseOutputTokenSymbol) as TKey
  
    return {
      pair: formattedPair,
      dexes,
    }
  } catch (error) {
    console.error(error)
  }
}
