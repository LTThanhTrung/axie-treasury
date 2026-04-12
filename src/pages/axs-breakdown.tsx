"use client"
import React, { useEffect, useState } from "react"
import axios from 'axios'
import { Geist, Geist_Mono } from "next/font/google"
import { DonutChart } from "@/components/DonutChart"
import { Card } from "@/components/Card"
import Spinner from "@/components/Spinner"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

type BreakdownData = {
  Forge: number
  Evolve: number
  Other: number
  bAXS: number
  Breeding: number
  AtiaRestore: number
  RunesCharms: number
  Ascend: number
  absoluteTotal: number
}

export default function AXSBreakdown() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BreakdownData | null>(null)
  const [excludedNames, setExcludedNames] = useState<Set<string>>(new Set())

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/sumAXS')
      const raw = res.data
      setData({
        Forge: raw.Forge || 0,
        Evolve: raw.Evolve || 0,
        Other: raw.Other || 0,
        bAXS: raw.bAXS || 0,
        Breeding: raw.Breeding || 0,
        AtiaRestore: raw.AtiaRestore || raw["Atia's Restore"] || 0,
        RunesCharms: raw.RunesCharms || raw["Runes & Charms"] || 0,
        Ascend: raw.Ascend || 0,
        absoluteTotal: raw.absoluteTotal || raw.absolute_total || 0,
      })
    } catch (error) {
      console.error("Erro ao carregar breakdown de AXS:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
    { name: "Breeding", value: data.Breeding, amount: data.Breeding, color: "bg-emerald-500", chartColor: "emerald" as const },
    { name: "Ascend", value: data.Ascend, amount: data.Ascend, color: "bg-violet-500", chartColor: "violet" as const },
    { name: "Evolve", value: data.Evolve, amount: data.Evolve, color: "bg-blue-500", chartColor: "blue" as const },
    { name: "Runes & Charms", value: data.RunesCharms, amount: data.RunesCharms, color: "bg-pink-500", chartColor: "pink" as const },
    { name: "Atia's Restore", value: data.AtiaRestore, amount: data.AtiaRestore, color: "bg-fuchsia-500", chartColor: "fuchsia" as const },
    { name: "Forge", value: data.Forge, amount: data.Forge, color: "bg-amber-500", chartColor: "amber" as const },
    { name: "bAXS", value: data.bAXS, amount: data.bAXS, color: "bg-cyan-500", chartColor: "cyan" as const },
    { name: "Other", value: data.Other, amount: data.Other, color: "bg-gray-500", chartColor: "gray" as const },
  ].sort((a, b) => b.value - a.value) : []

  const chartData = allDistributionData.filter(item => !excludedNames.has(item.name))
  const visibleTotal = chartData.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className={`${geistSans.className} ${geistMono.className} p-4 sm:px-6 lg:px-10 min-h-screen`}>
      <div className="flex flex-col gap-8">
        <header>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">AXS Inflow Breakdown</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Detailed view of AXS entering the ecosystem by source.
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
                <h2 className="text-center font-bold text-gray-900 dark:text-gray-50 text-xl mb-12">
                  Total AXS Inflow Distribution
                </h2>

                <div className="flex flex-col lg:row-row items-center justify-center gap-12 w-full max-w-6xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
                    {/* Gráfico */}
                    <div className="relative flex items-center justify-center">
                      <DonutChart
                        data={chartData}
                        category="name"
                        value="value"
                        colors={chartData.map(d => d.chartColor)}
                        valueFormatter={(number) => `${(number || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} AXS`}
                        className="h-80 w-80 sm:h-96 sm:w-96"
                        showLabel={true}
                        label={visibleTotal.toLocaleString(undefined, { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 })}
                        labelClassName="fill-white"
                      />
                    </div>

                    {/* Legenda Customizada / Tabela */}
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
