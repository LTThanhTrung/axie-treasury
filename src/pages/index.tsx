"use client"
import { Geist, Geist_Mono } from "next/font/google";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table"
import { CategoryBarCard } from "@/components/ui/overview/DashboardProgressBarCard";
import { CategoryBar } from "@/components/CategoryBar";
import { Button } from "@/components/Button";
import Spinner from "@/components/Spinner";
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar"

import { Card } from "@/components/Card";
import DonutChartCallbackExample from "@/components/Test"
import { AreaChartTypeExample } from "@/components/Test2";
import { DonutChart, TooltipProps } from "@/components/DonutChart"
import { RiMoneyDollarBoxFill, RiAlarmWarningLine } from "@remixicon/react";
import { cx } from "@/lib/utils"
import React from "react"
import { DateRange } from "react-day-picker"
import { subDays, toDate } from "date-fns"
import { overviews } from "@/data/overview-data"
import { ChartCard } from "@/components/ui/overview/DashboardChartCard"


import { BarList } from '@/components/BarChart'
import { OverviewData } from "@/data/schema";

export type PeriodValue = "previous-period" | "last-year" | "no-comparison"


const categories: {
  title: keyof OverviewData
  type: "currency" | "unit"
}[] = [
    {
      title: "ETH",
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
      title: "UDSC",
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

export const BarListExample = () => {
  return <BarList data={data} />
}

interface DataItem {
  name: string
  amount: number
  category: string
}



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



const chartdata = [
  {
    date: "Jan 23",
    SolarPanels: 2890,
    Inverters: 2338,
  },
  {
    date: "Feb 23",
    SolarPanels: 2756,
    Inverters: 2103,
  },
  {
    date: "Mar 23",
    SolarPanels: 3322,
    Inverters: 2194,
  },
  {
    date: "Apr 23",
    SolarPanels: 3470,
    Inverters: 2108,
  },
  {
    date: "May 23",
    SolarPanels: 3475,
    Inverters: 1812,
  },
  {
    date: "Jun 23",
    SolarPanels: 3129,
    Inverters: 1726,
  },
  {
    date: "Jul 23",
    SolarPanels: 3490,
    Inverters: 1982,
  },
  {
    date: "Aug 23",
    SolarPanels: 2903,
    Inverters: 2012,
  },
  {
    date: "Sep 23",
    SolarPanels: 2643,
    Inverters: 2342,
  },
  {
    date: "Oct 23",
    SolarPanels: 2837,
    Inverters: 2473,
  },
  {
    date: "Nov 23",
    SolarPanels: 2954,
    Inverters: 3848,
  },
  {
    date: "Dec 23",
    SolarPanels: 3239,
    Inverters: 3736,
  },
]

export type KpiEntry = {
  title: string
  percentage: number
  current: number
  allowed: number
  unit?: string
}

export type KpiEntryExtended = Omit<
  KpiEntry,
  "current" | "allowed" | "unit"
> & {
  value: string
  color: string
}

const data3: KpiEntryExtended[] = [
  {
    title: "ETH",
    percentage: 70.1,
    value: "$200",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "AXS",
    percentage: 20.8,
    value: "$61.1",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "RON",
    percentage: 5,
    value: "$31.9",
    color: "bg-gray-400 dark:bg-gray-600",
  },
  {
    title: "USDC",
    percentage: 4.1,
    value: "$31.9",
    color: "bg-gray-400 dark:bg-gray-600",
  },
]

export function TableHero() {
  const data: Array<{
    name: string
    prices: string
    values: string
  }> = [
      {
        name: "ETH",
        prices: "3500",
        values: "3500",

      },
      {
        name: "AXS",
        prices: "2.6",
        values: "3500",

      },
      {
        name: "RON",
        prices: "0.55",
        values: "3500",


      },
      {
        name: "USDC",
        prices: "0.99",
        values: "3500",

      }
    ]
  return (
    <TableRoot>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Token</TableHeaderCell>
            <TableHeaderCell>Amount</TableHeaderCell>
            <TableHeaderCell>Value</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.name}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.prices}</TableCell>
              <TableCell>{item.values}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableHeaderCell colSpan={2} scope="row" >
              Total
            </TableHeaderCell>
            <TableHeaderCell colSpan={1} scope="row" >
              14000
            </TableHeaderCell>
          </TableRow>
        </TableFoot>

      </Table>
    </TableRoot>
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
    React.useState<PeriodValue>("last-year")

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    categories.map((category) => category.title),
  )

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7`}
    >
      <div className="flex flex-col gap-16">
        <div className="mt-4 grid grid-cols-1 gap-8 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
          <Card>
            <DonutChartCallbackExample />
          </Card>
          <Card>
            <div className="flex flex-row items-center gap-x-2">
              <p className="font-semibold tracking-tight text-gray-700 transition-all group-data-[state=active]:text-indigo-600 sm:text-lg dark:text-gray-400 dark:group-data-[state=active]:text-indigo-400">
                Token Price (USD)
              </p>
            </div>
            <TableHero />
          </Card>
          <Card>
            <p className="font-semibold tracking-tight text-gray-700 transition-all group-data-[state=active]:text-indigo-600 sm:text-lg dark:text-gray-400 dark:group-data-[state=active]:text-indigo-400">
              Revenue Breakdown (USD)
            </p>
            <div className="mt-2">
              <BarListExample />
            </div>
          </Card>
        </div>
        <section aria-labelledby="usage-overview">
          <h1
            id="usage-overview"
            className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
          >
            Overview
          </h1>
          <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 sm:pt-6 lg:top-0 lg:mx-0 lg:px-0 lg:pt-8 dark:border-gray-800 dark:bg-gray-950">
          </div>
                  <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 sm:pt-6 lg:top-0 lg:mx-0 lg:px-0 lg:pt-8 dark:border-gray-800 dark:bg-gray-950">
          <Filterbar
            maxDate={maxDate}
            minDate={new Date(2024, 0, 1)}
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
