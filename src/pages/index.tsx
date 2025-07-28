"use client"
import { Geist, Geist_Mono } from "next/font/google";
import {
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table"


import { typeData } from "@/data/type-data"

import axios from 'axios'
import Spinner from "@/components/Spinner";
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar"

import { Card } from "@/components/Card";
import DonutChartCallbackExample from "@/components/Test"
import { cx, tokenAddressesToNames, flattenAndSumTokens } from "@/lib/utils"
import React, { useEffect } from "react"
import { DateRange } from "react-day-picker"
import { subDays, toDate } from "date-fns"
import { overviews } from "@/data/overview-data"
import { ChartCard } from "@/components/ui/overview/DashboardChartCard"

import { Bar, BarList } from '@/components/BarChart'
import { OverviewData, TokenData } from "@/data/schema";
import { TokenPrice } from "./api/getTokenPrice";


export type PeriodValue = "previous-period" | "last-year" | "no-comparison"

interface TableHeroProps {
  price: TokenPrice[] | undefined
}

const categories: {
  title: keyof OverviewData
  type: "currency" | "unit"
}[] = [
    {
      title: "WETH",
      type: "unit",
    },
    {
      title: "RON",
      type: "unit",
    },
    {
      title: "AXS",
      type: "unit",
    },
    {
      title: "USDC",
      type: "unit",
    }
  ]

const data = [
  { name: "marketplace", value: 843 },
  { name: "breeding", value: 46 },
  { name: "ascend", value: 3 },
  { name: "evolve", value: 20 },
  { name: "rune & charm", value: 108 },
  { name: "streak restore", value: 384 },
]


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export function TableHero({ price }: TableHeroProps) {
  const [data, setData] = React.useState<TokenData[]>()
  useEffect(() => {
    if (price != undefined && price != null) {
      let flattenedData = flattenAndSumTokens(typeData)
      let tokens = Object.keys(flattenedData)
      let data: TokenData[] = tokens.map((token) => {
        let tokenIndex = price.findIndex((item) => item.address == token)
        let amount = tokenAddressesToNames[token] == "WETH" ? flattenedData[token] - 56078 : flattenedData[token]
        return {
          name: tokenAddressesToNames[token],
          price: price[tokenIndex].price,
          amount: amount,
          value: amount * price[tokenIndex].price
        }
      })
      setData(data)
    }
  },
    [price]
  )

  return (
    <>
      {data ? <TableRoot>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Token</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.name}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.price.toFixed(2)}</TableCell>
                <TableCell>{item.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFoot>
            <TableRow>
              <TableHeaderCell colSpan={1} scope="row" >
                Total
              </TableHeaderCell>
              <TableHeaderCell colSpan={2} scope="row" >
                {data.reduce((acc, value) => {
                  return acc + value.value
                }, 0).toLocaleString()} USD
              </TableHeaderCell>
            </TableRow>
          </TableFoot>
        </Table>
      </TableRoot> : <></>}
    </>
  )
}

const overviewsDates = overviews.map((item) => toDate(item.date).getTime())
const maxDate = toDate(Math.max(...overviewsDates))

export default function Home() {
  const [selectedDates, setSelectedDates] = React.useState<
    DateRange | undefined
  >({
    from: subDays(maxDate, 30),
    to: maxDate,
  })
  const [selectedPeriod, setSelectedPeriod] =
    React.useState<PeriodValue>("previous-period")

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    categories.map((category) => category.title),
  )

  useEffect(() => {
    fetchTokenPrice()
  }, [])

  const [loading, setLoading] = React.useState<boolean>(true)
  const [price, setPrice] = React.useState<TokenPrice[]>()
  const barData : any = price ?  Object.keys(typeData).map((item)=>{
    let tokens = typeData[item]
    let objs = Object.keys(tokens).map((token)=>{
      let amount = item.toLowerCase() == "marketplace" && tokenAddressesToNames[token] == "WETH" ?
        tokens[token] - 56078 :
        tokens[token]
      let tokenPrice = price[price.findIndex((item) => item.address == token)].price
      let value = amount * tokenPrice
      return { 
        name : tokenAddressesToNames[token],
        value: value
      }
    })
    let value = objs.reduce((acc, item) => { return acc + item.value}, 0)
    return {
      name: item,
      value : value
    }
  }) : []
      console.log(barData)

  const fetchTokenPrice = async () => {
    await axios.get('/api/getTokenPrice').then(async (response) => {
      if (response.status == 200) {
        await setPrice(response.data)
      }
      if (loading) {
        setLoading(false)
      }
    })
  }

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7`}
    >
      <div className="flex flex-col gap-16">
        <div className="mt-4 grid grid-cols-1 gap-8 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
          <Card className={loading ? "flex items-center justify-center min-h-64" : ""}>
            {loading ? <Spinner></Spinner> : <DonutChartCallbackExample price={price} />}
          </Card>
          <Card className={loading ? "flex items-center justify-center " : ""}>
            {loading ? <Spinner /> :
              <>
                <div className="flex flex-row items-center gap-x-2">
                  <p className="font-semibold tracking-tight text-gray-700 transition-all group-data-[state=active]:text-indigo-600 sm:text-lg dark:text-gray-400 dark:group-data-[state=active]:text-indigo-400">
                    Token Breakdown By USD
                  </p>
                </div>
                <TableHero price={price} />
              </>
            }
          </Card>
          <Card className={loading ? "flex items-center justify-center min-h-64" : ""}>
            {loading ? <Spinner /> : <>
              <p className="font-semibold tracking-tight text-gray-700 transition-all group-data-[state=active]:text-indigo-600 sm:text-lg dark:text-gray-400 dark:group-data-[state=active]:text-indigo-400">
                Revenue Breakdown (USD)
              </p>
              <div className="mt-2">
                <BarList data={barData} price={price} />
              </div>
            </>}
          </Card>
        </div>
        <section aria-labelledby="usage-overview">
          <h1
            id="usage-overview"
            className="mt-2 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
          >
            Overview
          </h1>
          <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 sm:pt-6 lg:top-0 lg:mx-0 lg:px-0 lg:pt-8 dark:border-gray-800 dark:bg-gray-950">
            <Filterbar
              maxDate={maxDate}
              minDate={new Date(2021, 3, 27)}
              selectedDates={selectedDates}
              onDatesChange={(dates) => setSelectedDates(dates)}
              selectedPeriod={selectedPeriod}
              onPeriodChange={(period) => setSelectedPeriod(period)}
              categories={categories}
              setSelectedCategories={setSelectedCategories}
              selectedCategories={selectedCategories}
            />
          </div>
          <dl
            className={cx(
              "mt-10 grid grid-cols-1 gap-14 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2",
            )}
          >
            {categories
              .filter((category) => selectedCategories.includes(category.title))
              .map((category) => {
                return (
                  <ChartCard
                    key={category.title}
                    title={category.title}
                    type={category.type}
                    selectedDates={selectedDates}
                    selectedPeriod={selectedPeriod}
                  />
                )
              })}
          </dl>
        </section>
      </div>
    </div>
  );
}
