import { Badge } from "@/components/Badge"
import { LineChart } from "@/components/LineChart"
import { OverviewData } from "@/data/schema"
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

export type CardProps = {
  title: keyof OverviewData
  type: "currency" | "unit"
  selectedDates: DateRange | undefined
  selectedPeriod: PeriodValue
  isThumbnail?: boolean
  data: OverviewData[]
}

const formattingMap = {
  currency: formatters.currency,
  unit: formatters.unit,
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

export function ChartCard({
  title,
  type,
  selectedDates,
  selectedPeriod,
  isThumbnail,
  data: rawData = [],
}: CardProps) {
  const formatter = formattingMap[type]
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
    .filter((overview) => {
      if (selectedDatesInterval) {
        const dateStr = overview.date.includes('T') ? overview.date.split('T')[0] : overview.date
        return isWithinInterval(new Date(dateStr + 'T00:00:00'), selectedDatesInterval)
      }
      return true
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const prevData = rawData
    .filter((overview) => {
      if (prevDatesInterval) {
        const dateStr = overview.date.includes('T') ? overview.date.split('T')[0] : overview.date
        return isWithinInterval(new Date(dateStr + 'T00:00:00'), prevDatesInterval)
      }
      return false
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const chartData = allDatesInInterval
    ?.map((date) => {
      const dateStr = formatDate(date, "yyyy-MM-dd")
      const overview = data.find(d => {
        const dDateStr = d.date.includes('T') ? d.date.split('T')[0] : d.date;
        return formatDate(new Date(dDateStr + 'T00:00:00'), "yyyy-MM-dd") === dateStr
      })

      // Calculate previous date match
      // For each date in the current interval, we want the corresponding date in the previous interval
      // The simple index matching is brittle. We should find the date relative to the start.

      const daysDiff = selectedDates?.from ? Math.floor((date.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24)) : 0
      const prevDateTarget = prevDates?.from ? new Date(prevDates.from.getTime() + daysDiff * 24 * 60 * 60 * 1000) : null
      const prevDateStr = prevDateTarget ? formatDate(prevDateTarget, "yyyy-MM-dd") : null

      const prevOverview = prevDateStr ? prevData.find(d => {
        const dDateStr = d.date.includes('T') ? d.date.split('T')[0] : d.date;
        return formatDate(new Date(dDateStr + 'T00:00:00'), "yyyy-MM-dd") === prevDateStr
      }) : undefined

      const value = (overview?.[title] as number) || 0
      const previousValue = (prevOverview?.[title] as number) || null

      return {
        title,
        date: date,
        formattedDate: formatDate(date, "dd/MM/yyyy"),
        value,
        previousDate: prevOverview?.date,
        previousFormattedDate: prevOverview
          ? formatDate(new Date(prevOverview.date), "dd/MM/yyyy")
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
  const value =
    chartData?.reduce((acc, item) => acc + (item.value || 0), 0) || 0
  const previousValue =
    chartData?.reduce((acc, item) => acc + (item.previousValue || 0), 0) || 0
  const evolution =
    selectedPeriod !== "no-comparison"
      ? (value - previousValue) / previousValue
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
          {(value.toFixed(2))}
        </dd>
        {selectedPeriod !== "no-comparison" && (
          <dd className="text-sm text-gray-500">
            from {previousValue.toFixed(2)}
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
