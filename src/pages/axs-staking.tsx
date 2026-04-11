"use client"
import React, { useEffect, useState } from "react"
import axios from 'axios'
import { subDays, toDate } from "date-fns"
import { DateRange } from "react-day-picker"

import Spinner from "@/components/Spinner"
import { StakingFilterbar } from "@/components/ui/overview/StakingFilterbar"
import { StakingChartCard } from "@/components/ui/overview/StakingChartCard"
import { StakingAXSData } from "@/data/schema"
import { Geist, Geist_Mono } from "next/font/google"
import { DonutChart } from "@/components/DonutChart"
import { flattenAndSumTokens } from "@/lib/utils"
import { Card } from "@/components/Card"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export type PeriodValue = "previous-period" | "last-year" | "no-comparison"

export default function AXSStaking() {
  const [loading, setLoading] = useState(true)
  const [stakingData, setStakingData] = useState<StakingAXSData[]>([])
  const [circulatingSupply, setCirculatingSupply] = useState<number>(0)
  const [treasuryAXS, setTreasuryAXS] = useState<number>(0)

  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodValue>("previous-period")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [stakingRes, typeDataRes, supplyRes] = await Promise.all([
        axios.get('/api/stakingAXS'),
        axios.get('/api/typeData'),
        axios.get('https://skynet-api.roninchain.com/ronin/supplies/axs/circulating')
      ]);

      const data = stakingRes.data || [];
      const lastStakingVal = data.length > 0 ? data[data.length - 1].axs_total : 0;
      setStakingData(data)

      // Calculate Treasury AXS
      const rawTypeData = Array.isArray(typeDataRes.data) ? typeDataRes.data[0] : typeDataRes.data;
      const { id, ...cleanTypeData } = rawTypeData || {};
      const flattened = flattenAndSumTokens(cleanTypeData);
      const axsAddress = "0x97a9107c1793bc407d6f527b77e7fff4d812bece";
      const totalTreasury = flattened[axsAddress] || 0;
      setTreasuryAXS(totalTreasury);

      // Set Circulating Supply
      const totalCirculating = Number(supplyRes.data.result.value);
      setCirculatingSupply(totalCirculating);

      if (data.length > 0) {
        const dates = data.map((item: any) => {
          const dateStr = item.date.includes('T') ? item.date.split('T')[0] : item.date;
          return new Date(dateStr + 'T00:00:00').getTime();
        })
        const maxDate = toDate(Math.max(...dates))
        const minDate = toDate(Math.min(...dates))

        // Mantemos os últimos 30 dias como padrão, mas garantimos que 'from' não seja antes de 'minDate'
        const defaultFrom = subDays(maxDate, 30);
        setSelectedDates({
          from: defaultFrom < minDate ? minDate : defaultFrom,
          to: maxDate
        })
      }
    } catch (error) {
      console.error("Erro ao carregar dados de staking:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const maxDateValue = stakingData.length > 0
    ? toDate(Math.max(...stakingData.map(i => toDate(i.date + 'T00:00:00').getTime())))
    : new Date();

  const minDateValue = stakingData.length > 0
    ? toDate(Math.min(...stakingData.map(i => toDate(i.date + 'T00:00:00').getTime())))
    : new Date(2021, 3, 27); // Fallback caso não haja dados

  return (
    <div className={`${geistSans.className} ${geistMono.className} p-4 sm:px-6 lg:px-10`}>
      <div className="flex flex-col gap-8">
        <section aria-labelledby="staking-overview">
          <div className="mt-8">
            <Card className={loading ? "flex items-center justify-center min-h-64" : "p-8"}>
              {loading ? <Spinner /> : (() => {
                const currentStaked = stakingData.length > 0 ? stakingData[stakingData.length - 1].axs_total : 0;
                const distributionData = [
                  { name: "Staking", value: currentStaked, amount: currentStaked, color: "bg-blue-500", chartColor: "blue" as const },
                  { name: "Treasury", value: treasuryAXS, amount: treasuryAXS, color: "bg-violet-500", chartColor: "violet" as const },
                  { name: "Players/Investors", value: Math.max(0, circulatingSupply - currentStaked - treasuryAXS), amount: Math.max(0, circulatingSupply - currentStaked - treasuryAXS), color: "bg-emerald-500", chartColor: "emerald" as const }
                ].sort((a, b) => b.value - a.value);

                return (
                  <div className="flex flex-col items-center justify-center">
                    <h2 className="text-center font-bold text-gray-900 dark:text-gray-50 text-xl mb-8">
                      Circulating AXS Distribution
                    </h2>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-5xl">
                      {/* Gráfico */}
                      <div className="relative flex items-center justify-center">
                        <DonutChart
                          data={distributionData}
                          category="name"
                          value="value"
                          colors={distributionData.map(d => d.chartColor)}
                          valueFormatter={(number) => `${(number || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} AXS`}
                          className="h-72 w-72"
                          showLabel={true}
                          label={(circulatingSupply || 0) > 0 ? (circulatingSupply || 0).toLocaleString(undefined, { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 2 }) : ""}
                        />
                      </div>

                      {/* Legenda Customizada */}
                      <div className="flex flex-col gap-4 w-full md:w-[480px]">
                        {distributionData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${item.color}`} />
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {(item.value / 1000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}mi AXS
                              </span>
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-50">
                                {((item.value / (circulatingSupply || 1)) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Circulating Supply</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                              {(circulatingSupply || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} AXS
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Supply</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                              270.000.000 AXS
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </Card>
          </div>

          <h2 id="staking-history-title" className="mt-12 text-2xl font-bold text-gray-900 dark:text-gray-50">
            AXS Staking History
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor the total AXS staked over time.
          </p>

          <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 dark:bg-gray-950">
            <StakingFilterbar
              maxDate={maxDateValue}
              minDate={minDateValue}
              selectedDates={selectedDates}
              onDatesChange={setSelectedDates}
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner />
                </div>
              ) : (
                <StakingChartCard
                  title="Total AXS Staked"
                  selectedDates={selectedDates}
                  selectedPeriod={selectedPeriod}
                  data={stakingData}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

