"use client"
import React, { useEffect, useState } from "react"
import axios from 'axios'
import { subDays, toDate } from "date-fns"
import { DateRange } from "react-day-picker"

import { Table, TableBody, TableCell, TableFoot, TableHead, TableHeaderCell, TableRoot, TableRow } from "@/components/Table"
import Spinner from "@/components/Spinner"
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar"
import { Card } from "@/components/Card"
import DonutChartCallbackExample from "@/components/Test"
import { ChartCard } from "@/components/ui/overview/DashboardChartCard"
import { BarList } from '@/components/BarChart'

import { cx, tokenAddressesToNames, flattenAndSumTokens } from "@/lib/utils"
import { OverviewData, TokenData } from "@/data/schema"
import { TokenPrice } from "./api/getTokenPrice"
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export type PeriodValue = "previous-period" | "last-year" | "no-comparison"

interface TableHeroProps {
  price: TokenPrice[] | undefined;
  typeData: any;
}

const categories: { title: keyof OverviewData; type: "currency" | "unit" }[] = [
  { title: "WETH", type: "unit" },
  { title: "RON", type: "unit" },
  { title: "AXS", type: "unit" },
  { title: "USDC", type: "unit" }
];

export function TableHero({ price, typeData }: TableHeroProps) {
  const [data, setData] = useState<TokenData[]>()

  useEffect(() => {
    if (price && typeData) {
      let flattenedData = flattenAndSumTokens(typeData)
      let tokens = Object.keys(flattenedData)
      let mappedData: TokenData[] = tokens.map((token) => {
        let tokenIndex = price.findIndex((item) => item.address == token)
        let amount = tokenAddressesToNames[token] == "WETH" ? flattenedData[token] - 56078 : flattenedData[token]
        return {
          name: tokenAddressesToNames[token],
          price: price[tokenIndex]?.price || 0,
          amount: amount,
          value: amount * (price[tokenIndex]?.price || 0)
        }
      })
      setData(mappedData)
    }
  }, [price, typeData])

  if (!data) return null;

  return (
    <TableRoot>
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
              <TableCell>{item.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableHeaderCell colSpan={1}>Total</TableHeaderCell>
            <TableHeaderCell colSpan={2}>
              {data.reduce((acc, value) => acc + value.value, 0).toLocaleString()} USD
            </TableHeaderCell>
          </TableRow>
        </TableFoot>
      </Table>
    </TableRoot>
  )
}

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [price, setPrice] = useState<TokenPrice[]>()
  const [apiTypeData, setApiTypeData] = useState<any>(null)
  const [apiOverviews, setApiOverviews] = useState<any[]>([])

  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodValue>("previous-period")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categories.map((category) => category.title),
  )

  const fetchData = async () => {
    setLoading(true)
    try {
      const [priceRes, typeDataRes, overviewRes] = await Promise.all([
        axios.get('/api/getTokenPrice'),
        axios.get('/api/typeData'),
        axios.get('/api/overviewData')
      ]);

      setPrice(priceRes.data)
      const rawTypeData = Array.isArray(typeDataRes.data)
        ? typeDataRes.data[0]
        : typeDataRes.data;

      // Remove o campo "id"
      const { id, ...cleanTypeData } = rawTypeData || {};

      setApiTypeData(cleanTypeData);
      setApiOverviews(overviewRes.data || [])

      // Ajustar data máxima baseada no banco
      if (overviewRes.data.length > 0) {
        // Parse dates as local time (append T00:00:00) to ensure they match the "calendar day" concept
        // and aren't shifted by timezone conversions (e.g. UTC midnight -> Previous day local)
        const overviewsDates = overviewRes.data.map((item: any) => {
          const dateStr = item.date.includes('T') ? item.date.split('T')[0] : item.date;
          return new Date(dateStr + 'T00:00:00').getTime();
        })
        const maxDate = toDate(Math.max(...overviewsDates))
        setSelectedDates({ from: subDays(maxDate, 30), to: maxDate })
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const barData = (price && apiTypeData) ? Object.keys(apiTypeData).map((item) => {
    let tokens = apiTypeData[item]
    let objs = Object.keys(tokens).map((token) => {
      let amount = item.toLowerCase() == "marketplace" && tokenAddressesToNames[token] == "WETH" ?
        tokens[token] - 56078 : tokens[token]
      let pIdx = price.findIndex((p) => p.address == token)
      let tokenPrice = pIdx !== -1 ? price[pIdx].price : 0
      return { name: tokenAddressesToNames[token], value: amount * tokenPrice }
    })
    return { name: item, value: objs.reduce((acc, obj) => acc + obj.value, 0) }
  }) : []

  const maxDateValue = apiOverviews.length > 0
    ? toDate(Math.max(...apiOverviews.map(i => toDate(i.date).getTime())))
    : new Date();

  return (
    <div className={`${geistSans.className} ${geistMono.className} p-4 sm:px-6 lg:px-10`}>
      <div className="flex flex-col gap-16">
        <div className="mt-4 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">

          <Card className={loading ? "flex items-center justify-center min-h-64" : ""}>
            {loading ? <Spinner /> : <DonutChartCallbackExample price={price} />}
          </Card>

          <Card className={loading ? "flex items-center justify-center" : ""}>
            {loading ? <Spinner /> : (
              <>
                <p className="font-semibold text-gray-700 sm:text-lg">Token Breakdown By Amount</p>
                <TableHero price={price} typeData={apiTypeData} />
              </>
            )}
          </Card>

          <Card className={loading ? "flex items-center justify-center min-h-64" : ""}>
            {loading ? <Spinner /> : (
              <>
                <p className="font-semibold text-gray-700 sm:text-lg">Revenue Breakdown (USD)</p>
                <div className="mt-2">
                  <BarList data={barData} />
                </div>
              </>
            )}
          </Card>
        </div>

        <section aria-labelledby="usage-overview">
          <h1 id="usage-overview" className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
            Overview
          </h1>
          <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 dark:bg-gray-950">
            <Filterbar
              maxDate={maxDateValue}
              minDate={new Date(2021, 3, 27)}
              selectedDates={selectedDates}
              onDatesChange={setSelectedDates}
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              categories={categories}
              setSelectedCategories={setSelectedCategories}
              selectedCategories={selectedCategories}
              data={apiOverviews}
            />
          </div>
          <dl className="mt-10 grid grid-cols-1 gap-14 md:grid-cols-2">
            {categories
              .filter((category) => selectedCategories.includes(category.title))
              .map((category) => (
                <ChartCard
                  key={category.title}
                  title={category.title}
                  type={category.type}
                  selectedDates={selectedDates}
                  selectedPeriod={selectedPeriod}
                  data={apiOverviews}
                />
              ))}
          </dl>
        </section>
      </div>
    </div>
  )
}