import { PAIR_SEPARATOR } from "../constants";

export const formatPairString = (inputSymbol: string, outputSymbol: string) => `${inputSymbol}${PAIR_SEPARATOR}${outputSymbol}`