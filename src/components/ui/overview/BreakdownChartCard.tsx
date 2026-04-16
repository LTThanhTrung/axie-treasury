import { Badge } from "@/components/Badge"
import { LineChart } from "@/components/LineChart"
import { cx, formatters, percentageFormatter } from "@/lib/utils"
import {
  eachDayOfInterval,
  formatDate,
  interval,
  isWithinInterval,
} from "date-fns"
import { DateRange } from "react-day-picker"
import { getPeriod } from "./StakingFilterbar"

type PeriodValue = "previous-period" | "last-year" | "no-comparison"

export type BreakdownCardProps = {
  title: string
  dataKey: string
  selectedDates: DateRange | undefined
  selectedPeriod: PeriodValue
  isThumbnail?: boolean
  data: any[]
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

export function BreakdownChartCard({
  title,
  dataKey,
  selectedDates,
  selectedPeriod,
  isThumbnail,
  data: rawData = [],
}: BreakdownCardProps) {
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
      if (selectedDatesInterval && item.date) {
        const dateStr = item.date.includes('T') ? item.date.split('T')[0] : item.date
        return isWithinInterval(new Date(dateStr + 'T00:00:00'), selectedDatesInterval)
      }
      return true
    })
    .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())

  const prevData = rawData
    .filter((item) => {
      if (prevDatesInterval && item.date) {
        const dateStr = item.date.includes('T') ? item.date.split('T')[0] : item.date
        return isWithinInterval(new Date(dateStr + 'T00:00:00'), prevDatesInterval)
      }
      return false
    })
    .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())

  const chartData = allDatesInInterval
    ?.map((date) => {
      const dateStr = formatDate(date, "yyyy-MM-dd")
      const record = data.find(d => {
        if (!d.date) return false;
        const dDateStr = d.date.includes('T') ? d.date.split('T')[0] : d.date;
        return formatDate(new Date(dDateStr + 'T00:00:00'), "yyyy-MM-dd") === dateStr
      })

      const daysDiff = selectedDates?.from ? Math.floor((date.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24)) : 0
      const prevDateTarget = prevDates?.from ? new Date(prevDates.from.getTime() + daysDiff * 24 * 60 * 60 * 1000) : null
      const prevDateStr = prevDateTarget ? formatDate(prevDateTarget, "yyyy-MM-dd") : null

      const prevRecord = prevDateStr ? prevData.find(d => {
        if (!d.date) return false;
        const dDateStr = d.date.includes('T') ? d.date.split('T')[0] : d.date;
        return formatDate(new Date(dDateStr + 'T00:00:00'), "yyyy-MM-dd") === prevDateStr
      }) : undefined

      // Resolving potential mapping differences (like bAXSFee vs bAXS Fee, RunesCharms vs Runes & Charms)
      const getValue = (rec: any, key: string) => {
        if (!rec) return 0;
        if (rec[key] !== undefined) return rec[key];
        // fallbacks
        if (key === "bAXSFee") return rec["bAXS Fee"] || rec["bAXS Fees"] || 0;
        if (key === "AtiaRestore") return rec["Atia's Restore"] || 0;
        if (key === "RunesCharms") return rec["Runes & Charms"] || 0;
        return 0;
      }

      const value = getValue(record, dataKey);
      const previousValue = prevRecord ? getValue(prevRecord, dataKey) : null;

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
  
  // Since this is inflow (value accumulating over the period), we SUM the interval
  const value =
    chartData?.reduce((acc, item) => acc + (item.value || 0), 0) || 0
  const previousValue =
    chartData?.reduce((acc, item) => acc + (item.previousValue || 0), 0) || 0
  const evolution =
    selectedPeriod !== "no-comparison" && previousValue !== 0
      ? (value - previousValue) / previousValue
      : 0

  return (
    <div className={cx("transition")}>
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-2">
          <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50 uppercase tracking-tight">
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
          {(value.toLocaleString(undefined, { maximumFractionDigits: 0 }))} AXS
        </dd>
        {selectedPeriod !== "no-comparison" && (
          <dd className="text-sm text-gray-500">
            from {(previousValue.toLocaleString(undefined, { maximumFractionDigits: 0 }))} AXS
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
        showYAxis={true}
        yAxisOrientation="right"
        yAxisWidth={40}
        showLegend={false}
        categories={categories}
        showTooltip={isThumbnail ? false : true}
        autoMinValue
      />
    </div>
  )
}
