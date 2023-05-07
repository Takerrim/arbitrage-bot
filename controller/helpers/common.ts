export const hasQuoteUSD = (pair: string) => pair.split('/')[1].includes('USD')

export const getPairParts = (pair: string) => ({
  base: pair.split('/')[0],
  quote: pair.split('/')[1],
})
