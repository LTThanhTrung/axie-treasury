// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios'

interface TokenHashmap {
  [key: string]: string
}

const addressToToken: TokenHashmap = {
  "0x97a9107c1793bc407d6f527b77e7fff4d812bece": "AXS",
  "0x0b7007c13325c48911f73a2dad5fa5dcbf808adc": "USDC",
  "0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5": "WETH",
  "0xe514d9deb7966c8be0ca922de8a064264ea6bcd4": "RON"
}

export interface TokenPrice {
  address: string,
  name: string,
  price: number
}

export interface ErrorResponse {
  error: {
    message: string
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenPrice[] | ErrorResponse>,
) {
  try {
    const url = `https://exchange-rate.skymavis.com/v2/prices?addresses=0x97a9107c1793bc407d6f527b77e7fff4d812bece,0x0b7007c13325c48911f73a2dad5fa5dcbf808adc,0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5,0xe514d9deb7966c8be0ca922de8a064264ea6bcd4&vs_currencies=usd`

    const results: TokenPrice[] = []

    await axios.get(url).then((response) => {
      const result = response.data.result
      Object.keys(result).map((key) => {
        const obj: TokenPrice = {
          address: key == "0xe514d9deb7966c8be0ca922de8a064264ea6bcd4" ? "0x0000000000000000000000000000000000000000" : key,
          price: result[key].usd,
          name: addressToToken[key]
        }
        results.push(obj)
      })
    })
    res.status(200).json(results)
  }
  catch (ex) {
    res.status(500).json({ error: { message: JSON.stringify(ex) } })
  }
}
