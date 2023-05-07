import { biswap } from "../contracts/Biswap"
import biswapPairs from '../constants/biswap-pairs.json'
import inquirer from 'inquirer'
import { toUpperCase } from "../helpers/toUpperCase";
import { formatPairString } from "../helpers/formatPairString";

type TAnswerName = 'inputTokenSymbol' | 'outputTokenSymbol'
type TKey = keyof typeof biswapPairs;
type TAnswersMap = Record<TAnswerName, string>

const main = async () => {
  const validateAnswer = (input: string, answersMap: TAnswersMap) => {
    if (answersMap.inputTokenSymbol && !Object.keys(biswapPairs).includes(formatPairString(toUpperCase(answersMap.inputTokenSymbol), toUpperCase(input)))) {
      return 'Such pair does not exist'
    }
    return input === '' ? 'You have to type the symbol of token' : true
  }

  const { inputTokenSymbol, outputTokenSymbol } = await inquirer.prompt<TAnswersMap>(
    [
      {
        message: 'Enter symbol of input token (example ETH)',
        name: 'inputTokenSymbol',
        validate: validateAnswer,
        transformer: toUpperCase,
      },
      {
        message: 'Enter symbol of output token (example USDT)',
        name: 'outputTokenSymbol',
        validate: validateAnswer,
        transformer: toUpperCase,
      },
    ],
  )

  const upperCaseInputTokenSymbol = toUpperCase(inputTokenSymbol)
  const upperCaseOutputTokenSymbol = toUpperCase(outputTokenSymbol)

  const formattedPair = formatPairString(upperCaseInputTokenSymbol, upperCaseOutputTokenSymbol) as TKey

  const amountOut = await biswap.getAmountOut({ tokenIn: biswapPairs[formattedPair][0], tokenOut: biswapPairs[formattedPair][1] })
  console.log(`${formattedPair}: ${amountOut}`)
}

main()
