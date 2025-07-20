"use client"

import React from "react"

import { DonutChart, TooltipProps } from "@/components/DonutChart"

interface DataItem {
  name: string
  amount: number,
  value: number
}

const data: DataItem[] = [
  {
    name: "AXS",
    amount: 4890,
    value: 10,
  },
  {
    name: "WETH",
    amount: 2103,
    value: 20
  },
  {
    name: "RON",
    amount: 2050,
    value: 30

  },
  {
    name: "USDC",
    amount: 1300,
    value: 40
  },
]

function DonutChartCallbackExample() {
  const [datas, setDatas] = React.useState<TooltipProps | null>(null)

  const sumNumericArray = (arr: number[]): number =>
    arr.reduce((sum, num) => sum + num, 0)

  const currencyFormatter = (number: number) =>
    `$${Intl.NumberFormat("us").format(number)}`

  const payload = datas?.payload?.[0]
  const value = payload?.value ?? 0

  const formattedValue = payload
    ? currencyFormatter(value)
    : currencyFormatter(
        sumNumericArray(data.map((dataPoint) => dataPoint.amount)),
      )

  return (
    <div>
      <p className="text-center font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-indigo-600 sm:text-lg dark:text-gray-400 dark:group-data-[state=active]:text-indigo-400">
        Revenue by category
      </p>
      <p className="mt-2 w-full text-center text-xl font-semibold text-gray-900 dark:text-gray-50">
        {formattedValue}
      </p>
      <DonutChart
        data={data}
        category="name"
        value="amount"
        className="mx-auto mt-2"
        colors={["blue", "violet", "cyan", "emerald"]}
        tooltipCallback={(props) => {
          if (props.active) {
            // setDatas((prev) => {
            //   if (prev?.payload[0].category === props.payload[0].category)
            //     return prev
            //   return props
            // })
            return props
          } else {
            setDatas(null)
          }
          return null
        }}
      />
    </div>
  )
}

export default DonutChartCallbackExample