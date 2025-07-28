"use client"

import React, { useEffect } from "react"

import { DonutChart, TooltipProps } from "@/components/DonutChart"
import { TokenPrice } from "@/pages/api/getTokenPrice"
import { typeData } from "@/data/type-data"
import { tokenAddressesToNames, flattenAndSumTokens } from "@/lib/utils"

interface DataItem {
  name: string
  amount: number,
  value: number,
  address: string
}

interface DonutChartProps {
  price: TokenPrice[] | undefined
}

function DonutChartCallbackExample({price}:DonutChartProps) {
  const [datas, setDatas] = React.useState<TooltipProps | null>(null)
  const [data, setData] = React.useState<DataItem[]>()

  const sumNumericArray = (arr: number[]): number =>
    arr.reduce((sum, num) => sum + num, 0)

  const currencyFormatter = (number: number) =>
    `$${Intl.NumberFormat("us").format(number)}`

  const payload = datas?.payload?.[0]
  const value = payload?.value ?? 0

  useEffect(() => {
    if (price != undefined && price != null) {
      let flattenedData = flattenAndSumTokens(typeData)
      let tokens = Object.keys(flattenedData)
      let data: any = tokens.map((token) => {
        let tokenIndex = price.findIndex((item)=> item.address == token)
        let amount = tokenAddressesToNames[token] == "WETH"? flattenedData[token] -  56078 : flattenedData[token]
        return {
          name: tokenAddressesToNames[token],
          amount: amount,
          value: amount * price[tokenIndex].price ,
          address: token
        }
      })
      setData(data)
    }
  }, [price])

  const formattedValue = payload 
    ? currencyFormatter(value)
    : data ? currencyFormatter(
        sumNumericArray(data.map((dataPoint) => dataPoint.value)),
      ) : 0

  return (
    <div>
      <p className="text-center font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-indigo-600 sm:text-lg dark:text-gray-400 dark:group-data-[state=active]:text-indigo-400">
        Treasury by token
      </p>
      <p className="mt-2 w-full text-center text-xl font-semibold text-gray-900 dark:text-gray-50">
        {formattedValue}
      </p>
      {data ?       
      <DonutChart
        data={data}
        category="name"
        value="value"
        className="mx-auto mt-2"
        colors={["blue", "violet", "cyan", "emerald"]}
        tooltipCallback={(props) => {
          if (props.active) {
            return props
          } else {
            setDatas(null)
          }
          return null
        }}
      /> : <></>}

    </div>
  )
}

export default DonutChartCallbackExample