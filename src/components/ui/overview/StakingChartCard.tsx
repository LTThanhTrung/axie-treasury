import { Badge } from "@/components/Badge"
import { LineChart } from "@/components/LineChart"
import { StakingAXSData } from "@/data/schema"
import { cx, formatters, percentageFormatter } from "@/lib/utils"
import {
  eachDayOfInterval,
  formatDate,
  interval,
  isWithinInterval,
} from "date-fns"
import { DateRange } from "react-day-picker"
import { getPeriod } from "./DashboardFilterbar"

type PeriodValue = "previous-period" | "last-year" | "no-comparison"

export type StakingCardProps = {
  title: string
  selectedDates: DateRange | undefined
  selectedPeriod: PeriodValue
  isThumbnail?: boolean
  data: StakingAXSData[]
}

export const getBadgeType = (value: number) => {
  if (value > 0) {
    return "success"
  } else if (value < 0) {
    if (value < -50) {
      return "warning"
    }
    return "error"
  } else {
    return "neutral"
  }
}

export function StakingChartCard({
  title,
  selectedDates,
  selectedPeriod,
  isThumbnail,
  data: rawData = [],
}: StakingCardProps) {
  const formatter = formatters.unit
  const selectedDatesInterval =
    selectedDates?.from && selectedDates?.to
      ? interval(selectedDates.from, selectedDates.to)
      : null
  const allDatesInInterval =
    selectedDates?.from && selectedDates?.to
      ? eachDayOfInterval(interval(selectedDates.from, selectedDates.to))
      : null
  const prevDates = getPeriod(selectedDates, selectedPeriod)

  const prevDatesInterval =
    prevDates?.from && prevDates?.to
      ? interval(prevDates.from, prevDates.to)
      : null

  const data = rawData
    .filter((item) => {
      if (selectedDatesInterval) {
        const dateStr = item.date.includes('T') ? item.date.split('T')[0] : item.date
        return isWithinInterval(new Date(dateStr + 'T00:00:00'), selectedDatesInterval)
      }
      return true
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const prevData = rawData
    .filter((item) => {
      if (prevDatesInterval) {
        const dateStr = item.date.includes('T') ? item.date.split('T')[0] : item.date
        return isWithinInterval(new Date(dateStr + 'T00:00:00'), prevDatesInterval)
      }
      return false
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const chartData = allDatesInInterval
    ?.map((date) => {
      const dateStr = formatDate(date, "yyyy-MM-dd")
      const record = data.find(d => {
        const dDateStr = d.date.includes('T') ? d.date.split('T')[0] : d.date;
        return formatDate(new Date(dDateStr + 'T00:00:00'), "yyyy-MM-dd") === dateStr
      })

      const daysDiff = selectedDates?.from ? Math.floor((date.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24)) : 0
      const prevDateTarget = prevDates?.from ? new Date(prevDates.from.getTime() + daysDiff * 24 * 60 * 60 * 1000) : null
      const prevDateStr = prevDateTarget ? formatDate(prevDateTarget, "yyyy-MM-dd") : null

      const prevRecord = prevDateStr ? prevData.find(d => {
        const dDateStr = d.date.includes('T') ? d.date.split('T')[0] : d.date;
        return formatDate(new Date(dDateStr + 'T00:00:00'), "yyyy-MM-dd") === prevDateStr
      }) : undefined

      const value = (record?.axs_total) || 0
      const previousValue = (prevRecord?.axs_total) || null

      return {
        title,
        date: date,
        formattedDate: formatDate(date, "dd/MM/yyyy"),
        value,
        previousDate: prevRecord?.date,
        previousFormattedDate: prevRecord
          ? formatDate(new Date(prevRecord.date), "dd/MM/yyyy")
          : null,
        previousValue:
          selectedPeriod !== "no-comparison" ? previousValue : null,
        evolution:
          selectedPeriod !== "no-comparison" && value && previousValue
            ? (value - previousValue) / previousValue
            : undefined,
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const categories =
    selectedPeriod === "no-comparison" ? ["value"] : ["value", "previousValue"]
  
  // For staking, we might want the average or simply the last value
  // But DashboardChartCard uses sum. Let's stick to the visual style.
  // Actually, for "total staked", average or last makes more sense than sum.
  // Let's use the LAST value in the interval for the main display instead of sum.
  const displayValue = chartData && chartData.length > 0 ? chartData[chartData.length - 1].value : 0
  const displayPrevValue = chartData && chartData.length > 0 ? chartData[chartData.length - 1].previousValue || 0 : 0
  
  const evolution =
    selectedPeriod !== "no-comparison" && displayPrevValue !== 0
      ? (displayValue - displayPrevValue) / displayPrevValue
      : 0

  return (
    <div className={cx("transition")}>
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-2">
          <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
            {title}
          </dt>
          {selectedPeriod !== "no-comparison" && (
            <Badge variant={getBadgeType(evolution)}>
              {percentageFormatter(evolution)}
            </Badge>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <dd className="text-xl text-gray-900 dark:text-gray-50">
          {displayValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </dd>
        {selectedPeriod !== "no-comparison" && (
          <dd className="text-sm text-gray-500">
            from {displayPrevValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </dd>
        )}
      </div>
      <LineChart
        className="mt-6 h-32"
        data={chartData || []}
        index="formattedDate"
        colors={["blue", "gray"]}
        startEndOnly={true}
        valueFormatter={(value) => formatter(value as number)}
        showYAxis={false}
        showLegend={false}
        categories={categories}
        showTooltip={isThumbnail ? false : true}
        autoMinValue
      />
    </div>
  )
}
