import { BigNumberish } from "ethers"
import { ethers } from "hardhat"
import { DECIMALS } from "./constants"

export const formatUnits = (value: BigNumberish, decimals = DECIMALS) => ethers.utils.formatUnits(value.toString(), decimals)

export const parseUnits = (value: BigNumberish) => ethers.utils.parseUnits(value.toString())
