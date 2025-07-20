export type Usage = {
  owner: string
  status: string
  costs: number
  region: string
  stability: number
  lastEdited: string
}

export type OverviewData = {
  date: string
  "RON": number
  "ETH": number
  AXS: number
  "UDSC": number
  "Sign ups": number
  Logins: number
  "Sign outs": number
  "Support calls": number
}
