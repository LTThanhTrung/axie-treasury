"use client"
import React, { useEffect, useState } from "react"
import axios from 'axios'
import Head from 'next/head'
import { Geist, Geist_Mono } from "next/font/google"
import { DonutChart } from "@/components/DonutChart"
import { Card } from "@/components/Card"
import Spinner from "@/components/Spinner"
import { CombinedInflowChart } from "@/components/CombinedInflowChart"
import { subDays } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/Select"
import { cx } from "@/lib/utils"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

type BreakdownData = {
  Forge: number
  Evolve: number
  bAXS: number
  Breeding: number
  RunesCharms: number
  AtiaRestore: number
  Ascend: number
  absoluteTotal: number
}

export default function BAXSBreakdown() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BreakdownData | null>(null)
  const [dailyData, setDailyData] = useState<any[]>([])
  const [excludedNames, setExcludedNames] = useState<Set<string>>(new Set())
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '180d' | '1y' | 'all'>('30d')
  const [selectedYear, setSelectedYear] = useState<string>("All")

  const timeframeOptions = [
    { id: '7d', label: '1W' },
    { id: '30d', label: '30D' },
    { id: '90d', label: '3M' },
    { id: '180d', label: '6M' },
    { id: '1y', label: '1Y' },
    { id: 'all', label: 'All' }
  ] as const

  const availableYears = React.useMemo(() => {
    if (!dailyData.length) return []
    const years = new Set<string>()
    dailyData.forEach(item => {
      if (item.date) {
        const year = item.date.split('-')[0]
        if (year) years.add(year)
      }
    })
    return Array.from(years).sort().reverse()
  }, [dailyData])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [summaryRes, dailyRes] = await Promise.all([
        axios.get('/api/sumBAXS'),
        axios.get('/api/dailyBAXS')
      ])

      const raw = summaryRes.data
      setData({
        Forge: raw.Forge || 0,
        Evolve: raw.Evolve || 0,
        bAXS: raw["bAXS Fee"] || raw.bAXSFee || raw.bAXS || 0,
        Breeding: raw.Breeding || 0,
        RunesCharms: raw["Runes & Charms"] || raw.RunesCharms || 0,
        AtiaRestore: raw["Atia's Restore"] || raw.AtiaRestore || 0,
        Ascend: raw.Ascend || 0,
        absoluteTotal: raw.absolute_total || raw.absoluteTotal || 0,
      })

      setDailyData(dailyRes.data || [])
    } catch (error) {
      console.error("Erro ao carregar breakdown de bAXS:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredDailyData = React.useMemo(() => {
    // Priority 1: Specific Year filter
    if (selectedYear !== "All") {
      return dailyData.filter(d => d.date && d.date.startsWith(selectedYear))
    }

    // Priority 2: Relative timeframe filter (only when Year is "All")
    if (selectedTimeframe === 'all') return dailyData
    const days =
      selectedTimeframe === '7d' ? 7 :
        selectedTimeframe === '30d' ? 30 :
          selectedTimeframe === '90d' ? 90 :
            selectedTimeframe === '180d' ? 180 : 365
    return dailyData.slice(-days)
  }, [dailyData, selectedTimeframe, selectedYear])

  const toggleCategory = (name: string) => {
    setExcludedNames((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const allDistributionData = data ? [
    { name: "Breeding", value: data.Breeding, color: "bg-emerald-500", chartColor: "emerald" as const },
    { name: "Ascend", value: data.Ascend, color: "bg-violet-500", chartColor: "violet" as const },
    { name: "Evolve", value: data.Evolve, color: "bg-blue-500", chartColor: "blue" as const },
    { name: "Runes & Charms", value: data.RunesCharms, color: "bg-pink-500", chartColor: "pink" as const },
    { name: "Atia's Restore", value: data.AtiaRestore, color: "bg-fuchsia-500", chartColor: "fuchsia" as const },
    { name: "Forge", value: data.Forge, color: "bg-amber-500", chartColor: "amber" as const },
    { name: "bAXS Fee", value: data.bAXS, color: "bg-cyan-500", chartColor: "cyan" as const },
  ].sort((a, b) => b.value - a.value) : []

  const chartData = allDistributionData.filter(item => !excludedNames.has(item.name))
  const visibleTotal = chartData.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className={`${geistSans.className} ${geistMono.className} p-4 sm:px-6 lg:px-10 min-h-screen`}>
      <Head>
        <title>bAXS Breakdown | Axie Treasury</title>
      </Head>
      <div className="flex flex-col gap-8">
        <header>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">bAXS Inflow Breakdown</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Detailed view of bAXS (Bonded AXS) entering the Axie Treasury by source.
                <span className="block text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                  Note: All bAXS enters the treasury as AXS.
                </span>
              </p>
            </div>
            {excludedNames.size > 0 && (
              <button
                onClick={() => setExcludedNames(new Set())}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                Reset filters ({excludedNames.size} hidden)
              </button>
            )}
          </div>
        </header>

        <section aria-labelledby="breakdown-overview">
          <Card className={loading ? "flex items-center justify-center min-h-[500px]" : "p-8"}>
            {loading ? <Spinner /> : data && (
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-center font-bold text-gray-900 dark:text-gray-50 text-lg mb-8">
                  Total bAXS Inflow Distribution
                </h2>

                <div className="flex flex-col lg:row-row items-center justify-center gap-12 w-full max-w-6xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
                    {/* Chart */}
                    <div className="relative flex items-center justify-center">
                      <DonutChart
                        data={chartData}
                        category="name"
                        value="value"
                        colors={chartData.map(d => d.chartColor)}
                        valueFormatter={(number) => `${(number || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} bAXS`}
                        className="h-80 w-80 sm:h-96 sm:w-96"
                        showLabel={true}
                        label={visibleTotal.toLocaleString(undefined, { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 })}
                        labelClassName="fill-white"
                      />
                    </div>

                    {/* Legend / Table */}
                    <div className="flex flex-col gap-3 w-full">
                      <div className="grid grid-cols-3 pb-2 border-b border-gray-200 dark:border-gray-800 px-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Share</span>
                      </div>
                      <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {allDistributionData.map((item) => {
                          const isExcluded = excludedNames.has(item.name)
                          return (
                            <button
                              key={item.name}
                              onClick={() => toggleCategory(item.name)}
                              className={`flex items-center justify-between py-2.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-all border-b border-gray-50 dark:border-gray-900 last:border-0 w-full group ${isExcluded ? 'opacity-30 grayscale' : 'opacity-100'}`}
                            >
                              <div className="flex items-center gap-3 w-1/3 overflow-hidden">
                                <div className={`w-3 h-3 rounded-full shrink-0 transition-transform group-hover:scale-125 ${item.color}`} />
                                <span className={`text-sm font-medium transition-colors ${isExcluded ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'} truncate`}>
                                  {item.name}
                                </span>
                              </div>
                              <div className="text-right w-1/3">
                                <span className={`text-sm font-semibold transition-colors ${isExcluded ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                  {item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                              <div className="text-right w-1/3">
                                <span className={`text-sm font-bold transition-colors ${isExcluded ? 'text-gray-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                  {((item.value / (visibleTotal || 1)) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
                        <div className="flex justify-between items-center px-2">
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-tighter">
                            {excludedNames.size > 0 ? 'Visible Inflow' : 'Total Inflow'}
                          </span>
                          <span className="text-lg font-black text-gray-900 dark:text-gray-50">
                            {visibleTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} AXS
                          </span>
                        </div>
                        {excludedNames.size > 0 && (
                          <div className="flex justify-between items-center px-2 text-xs text-gray-400 italic">
                            <span>Absolute Total</span>
                            <span>{data.absoluteTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} AXS</span>
                          </div>
                        )}
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 text-right italic pt-1">
                          * All bAXS enters the treasury as AXS
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </section>

        <section aria-labelledby="historical-trends">
          <Card className={loading ? "flex items-center justify-center min-h-[600px]" : "p-8"}>
            {loading ? <Spinner /> : (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                      Historical Diversification and Volume Trends (bAXS)
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Analysis of daily trends and proportional source contribution
                      {selectedYear !== "All" ? (
                        <> (Year: {selectedYear})</>
                      ) : (
                        <> ({selectedTimeframe === 'all' ? 'All Period' : `Last ${selectedTimeframe === '7d' ? '7' : selectedTimeframe === '30d' ? '30' : selectedTimeframe === '90d' ? '90' : selectedTimeframe === '180d' ? '180' : '365'} Days`})</>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Year Selector */}
                    <div className="w-32">
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Years</SelectItem>
                          {availableYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Timeframe Selector */}
                    <div className={cx(
                      "flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl w-fit transition-all",
                      selectedYear !== "All" ? "opacity-30 pointer-events-none grayscale" : "opacity-100"
                    )}>
                      {timeframeOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedTimeframe(opt.id as any)}
                          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${selectedTimeframe === opt.id
                            ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-slate-200"
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <CombinedInflowChart
                    data={filteredDailyData.map(item => ({
                      ...item,
                      "Breeding": item.Breeding || 0,
                      "Ascend": item.Ascend || 0,
                      "Evolve": item.Evolve || 0,
                      "Runes & Charms": item["Runes & Charms"] || item.RunesCharms || 0,
                      "Atia's Restore": item["Atia's Restore"] || item.AtiaRestore || 0,
                      "Forge": item.Forge || 0,
                      "bAXS Fee": item["bAXS Fee"] || item.bAXSFee || 0
                    }))}
                    index="date"
                    categories={[
                      "Breeding",
                      "Ascend",
                      "Evolve",
                      "Runes & Charms",
                      "Atia's Restore",
                      "Forge",
                      "bAXS Fee"
                    ]}
                    colors={[
                      "emerald",
                      "violet",
                      "blue",
                      "pink",
                      "fuchsia",
                      "amber",
                      "cyan"
                    ]}
                    valueFormatter={(number) => `${(number || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  />
                </div>
              </>
            )}
          </Card>
        </section>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
      `}</style>
    </div>
  )
}
