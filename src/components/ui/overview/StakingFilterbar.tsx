"use client"

import {
    Select,
    SelectContent,
    SelectItemPeriod,
    SelectTrigger,
    SelectValue,
} from "@/components/Select"

import { DateRangePicker } from "@/components/DatePicker"
import { eachDayOfInterval, interval, subDays, subYears } from "date-fns"
import React from "react"
import { DateRange } from "react-day-picker"

type PeriodValue = "previous-period" | "last-year" | "no-comparison"

type Period = {
    value: PeriodValue
    label: string
}

const periods: Period[] = [
    {
        value: "previous-period",
        label: "Previous period",
    },
    {
        value: "last-year",
        label: "Last year",
    },
    {
        value: "no-comparison",
        label: "No comparison",
    },
]

export const getPeriod = (
    dateRange: DateRange | undefined,
    value: PeriodValue,
): DateRange | undefined => {
    if (!dateRange) return undefined
    const from = dateRange.from
    const to = dateRange.to
    switch (value) {
        case "previous-period":
            let previousPeriodFrom
            let previousPeriodTo
            if (from && to) {
                const datesInterval = interval(from, to)
                const numberOfDaysBetween = eachDayOfInterval(datesInterval).length
                previousPeriodTo = subDays(from, 1)
                previousPeriodFrom = subDays(previousPeriodTo, numberOfDaysBetween)
            }
            return { from: previousPeriodFrom, to: previousPeriodTo }
        case "last-year":
            let lastYearFrom
            let lastYearTo
            if (from) {
                lastYearFrom = subYears(from, 1)
            }
            if (to) {
                lastYearTo = subYears(to, 1)
            }
            return { from: lastYearFrom, to: lastYearTo }
        case "no-comparison":
            return undefined
    }
}

type StakingFilterbarProps = {
    maxDate?: Date
    minDate?: Date
    selectedDates: DateRange | undefined
    onDatesChange: (dates: DateRange | undefined) => void
    selectedPeriod: PeriodValue
    onPeriodChange: (period: PeriodValue) => void
}

export function StakingFilterbar({
    maxDate,
    minDate,
    selectedDates,
    onDatesChange,
    selectedPeriod,
    onPeriodChange,
}: StakingFilterbarProps) {
    return (
        <div className="flex w-full justify-between">
            <div className="w-full sm:flex sm:items-center sm:gap-2">
                <DateRangePicker
                    value={selectedDates}
                    onChange={onDatesChange}
                    className="w-full sm:w-fit"
                    toDate={maxDate}
                    fromDate={minDate}
                    align="start"
                />
                <span className="hidden text-sm font-medium text-gray-500 sm:block">
                    compared to
                </span>
                <Select
                    defaultValue="no-comparison"
                    value={selectedPeriod}
                    onValueChange={(value) => {
                        onPeriodChange(value as PeriodValue)
                    }}
                >
                    <SelectTrigger className="mt-2 w-full sm:mt-0 sm:w-fit">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {periods.map((period) => (
                            <SelectItemPeriod
                                key={period.value}
                                value={period.value}
                                period={getPeriod(selectedDates, period.value)}
                            >
                                {period.label}
                            </SelectItemPeriod>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
