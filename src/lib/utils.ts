// Tremor Raw cx [v0.0.0]

import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TransactionTypeData, TokenAmount } from "@/data/schema"

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

// Tremor focusInput [v0.0.2]

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-blue-200 dark:focus:ring-blue-700/30",
  // border color
  "focus:border-blue-500 dark:focus:border-blue-700",
]

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
]

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
]

// Number formatter function

export const usNumberformatter = (number: number, decimals = 0) =>
  Intl.NumberFormat("us", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(Number(number))
    .toString()

export const percentageFormatter = (number: number, decimals = 1) => {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
  const symbol = number > 0 && number !== Infinity ? "+" : ""

  return `${symbol}${formattedNumber}`
}

export const millionFormatter = (number: number, decimals = 1) => {
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
  return `${formattedNumber}M`
}
export const formatters: { [key: string]: any } = {
  currency: (number: number, currency: string = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(number),
  unit: (number: number) => `${usNumberformatter(number)}`,
}

export const tokenAddressesToNames: { [address: string]: string } = {
  "0x97a9107c1793bc407d6f527b77e7fff4d812bece": "AXS", // Example token
  "0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5": "WETH", // Example token
  "0x0000000000000000000000000000000000000000": "RON", // Common representation for native currency
  "0x0b7007c13325c48911f73a2dad5fa5dcbf808adc": "USDC", // Example token
  // ... add more as needed
};


export function flattenAndSumTokens(data: TransactionTypeData): TokenAmount {
  const flattenedResult: TokenAmount = {};

  // Iterate over each category (Breeding, Marketplace, etc.)
  for (const category in data) {
    if (Object.prototype.hasOwnProperty.call(data, category)) {
      const tokens = data[category];

      // Iterate over each token and its value within the current category
      for (const tokenAddress in tokens) {
        if (Object.prototype.hasOwnProperty.call(tokens, tokenAddress)) {
          const value = tokens[tokenAddress];

          // If the tokenAddress already exists in our flattenedResult, add the value
          // Otherwise, initialize it with the current value
          if (flattenedResult[tokenAddress]) {
            flattenedResult[tokenAddress] += value;
          } else {
            flattenedResult[tokenAddress] = value;
          }
        }
      }
    }
  }
  return flattenedResult;
}