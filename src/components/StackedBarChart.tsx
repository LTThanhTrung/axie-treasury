"use client"

import React from "react"
import {
    Bar,
    BarChart as RechartsBarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
} from "recharts"
import { cx } from "@/lib/utils"
import { AvailableChartColorsKeys, getColorClassName } from "@/lib/chartUtils"

interface StackedBarChartProps {
    data: any[]
    index: string
    categories: string[]
    colors: AvailableChartColorsKeys[]
    valueFormatter?: (value: number) => string
    className?: string
}

const CustomTooltip = ({ active, payload, label, categoryColors, valueFormatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-950 p-3 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg text-sm">
                <p className="font-bold mb-2 text-gray-900 dark:text-gray-100">{label}</p>
                <div className="space-y-1.5">
                    {payload.map((entry: any, index: number) => {
                        // We skip the "total" entry if it's there
                        if (entry.dataKey === "total") return null;
                        
                        const colorClass = categoryColors[entry.name] || "bg-gray-500";
                        const absoluteValue = entry.payload[entry.dataKey.replace('Pct', '')] || 0;
                        const percentage = entry.value || 0;

                        return (
                            <div key={index} className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-2">
                                    <div className={cx("w-2.5 h-2.5 rounded-full", colorClass)} />
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">{entry.name}:</span>
                                </div>
                                <div className="text-right whitespace-nowrap">
                                    <span className="text-gray-900 dark:text-gray-100 font-bold mr-2">
                                        {valueFormatter(absoluteValue)}
                                    </span>
                                    <span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                                        ({percentage.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                    <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between gap-6">
                        <span className="text-gray-500 dark:text-gray-500 font-bold">Total:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-black">
                            {valueFormatter(payload[0].payload.total)}
                        </span>
                    </div>
                </div>
            </div>
        )
    }
    return null
}

export const StackedBarChart = ({
    data,
    index,
    categories,
    colors,
    valueFormatter = (value: number) => value.toString(),
    className,
}: StackedBarChartProps) => {
    const categoryColors: Record<string, string> = {};
    categories.forEach((cat, idx) => {
        categoryColors[cat] = getColorClassName(colors[idx], "bg");
    });

    // Transform data for 100% stacking
    const transformedData = data.map((item) => {
        const total = categories.reduce((acc, cat) => acc + (item[cat] || 0), 0);
        const newItem: any = { ...item, total };
        categories.forEach((cat) => {
            newItem[`${cat}Pct`] = total > 0 ? ((item[cat] || 0) / total) * 100 : 0;
        });
        return newItem;
    });

    return (
        <div className={cx("h-96 w-full", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                    data={transformedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                    <XAxis
                        dataKey={index}
                        axisLine={false}
                        tickLine={false}
                        className="text-xs fill-gray-500 dark:fill-gray-400"
                        dy={10}
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        className="text-xs fill-gray-500 dark:fill-gray-400"
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        className="text-xs fill-gray-500 dark:fill-gray-400"
                        tickFormatter={(value) => value.toLocaleString(undefined, { notation: 'compact', compactDisplay: 'short' })}
                        // The domain for the right axis should be based on the max total
                        domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                        dataKey="total"
                        hide={false}
                    />
                    <Tooltip
                        content={
                            <CustomTooltip
                                categoryColors={categoryColors}
                                valueFormatter={valueFormatter}
                            />
                        }
                        cursor={{ fill: "transparent" }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        content={({ payload }) => (
                            <div className="flex flex-wrap justify-end gap-x-6 gap-y-2 mb-6">
                                {payload?.map((entry: any, index: number) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className={cx("w-2.5 h-2.5 rounded-full", categoryColors[entry.value])} />
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {entry.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                    {categories.map((category, idx) => (
                        <Bar
                            key={category}
                            dataKey={`${category}Pct`}
                            name={category}
                            stackId="a"
                            yAxisId="left"
                            fill="currentColor"
                            className={cx(getColorClassName(colors[idx], "fill"))}
                        />
                    ))}
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    )
}
