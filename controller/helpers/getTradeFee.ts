export const getTradeFee = (amount: string, feeInPercents: number) => {
  return (feeInPercents * parseFloat(amount)) / 100
}