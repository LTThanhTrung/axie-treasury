export type Usage = {
  owner: string
  status: string
  costs: number
  region: string
  stability: number
  lastEdited: string
}

export type OverviewData = {
  "date": string
  "RON": number
  "WETH": number
  "AXS": number
  "USDC": number
}

export type TokenData = {
  "name" : string,
  "price" : number,
  "amount": number,
  "value" : number
}

export type TokenAmount = {
  [key: string] : number
}

export type TransactionTypeData = {
  [key: string] : TokenAmount
}