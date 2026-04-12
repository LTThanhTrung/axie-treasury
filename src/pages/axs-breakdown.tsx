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

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/sumAXS')
      // Map the response keys to match our state if needed, but the API already does mapping via Prisma if successful.
      // However, if Prisma generate failed, we might get raw MongoDB keys. Let's handle both.
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

  const distributionData = data ? [
    { name: "Breeding", value: data.Breeding, amount: data.Breeding, color: "bg-emerald-500", chartColor: "emerald" as const },
    { name: "Ascend", value: data.Ascend, amount: data.Ascend, color: "bg-violet-500", chartColor: "violet" as const },
    { name: "Evolve", value: data.Evolve, amount: data.Evolve, color: "bg-blue-500", chartColor: "blue" as const },
    { name: "Runes & Charms", value: data.RunesCharms, amount: data.RunesCharms, color: "bg-rose-500", chartColor: "rose" as const },
    { name: "Atia's Restore", value: data.AtiaRestore, amount: data.AtiaRestore, color: "bg-indigo-500", chartColor: "indigo" as const },
    { name: "Forge", value: data.Forge, amount: data.Forge, color: "bg-orange-500", chartColor: "orange" as const },
    { name: "bAXS", value: data.bAXS, amount: data.bAXS, color: "bg-cyan-500", chartColor: "cyan" as const },
    { name: "Other", value: data.Other, amount: data.Other, color: "bg-gray-500", chartColor: "gray" as const },
  ].sort((a, b) => b.value - a.value) : []

  return (
    <div className={`${geistSans.className} ${geistMono.className} p-4 sm:px-6 lg:px-10 min-h-screen`}>
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">AXS Inflow Breakdown</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Detailed view of AXS entering the ecosystem by source.
          </p>
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
                        data={distributionData}
                        category="name"
                        value="value"
                        colors={distributionData.map(d => d.chartColor)}
                        valueFormatter={(number) => `${(number || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} AXS`}
                        className="h-80 w-80 sm:h-96 sm:w-96"
                        showLabel={true}
                        label={(data.absoluteTotal || 0).toLocaleString(undefined, { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 })}
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
                        {distributionData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between py-2.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-colors border-b border-gray-50 dark:border-gray-900 last:border-0">
                            <div className="flex items-center gap-3 w-1/3">
                              <div className={`w-3 h-3 rounded-full shrink-0 ${item.color}`} />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
                            </div>
                            <div className="text-right w-1/3">
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            <div className="text-right w-1/3">
                              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                {((item.value / (data.absoluteTotal || 1)) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                         <div className="flex justify-between items-center px-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-50 uppercase tracking-tighter">Total Inflow</span>
                            <span className="text-lg font-black text-gray-900 dark:text-gray-50">
                              {data.absoluteTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} AXS
                            </span>
                         </div>
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
