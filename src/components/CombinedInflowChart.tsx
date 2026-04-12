"use client"

import React from "react"
import {
    Bar,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Line,
    ComposedChart,
} from "recharts"
import { cx } from "@/lib/utils"
import { AvailableChartColorsKeys, getColorClassName } from "@/lib/chartUtils"

interface CombinedInflowChartProps {
    data: any[]
    index: string
    categories: string[]
    colors: AvailableChartColorsKeys[]
    valueFormatter?: (value: number) => string
    className?: string
}

const CustomTooltip = ({ active, payload, label, categoryColors, valueFormatter }: any) => {
    if (active && payload && payload.length) {
        // Find the "Total Volume" payload entry
        const volumeEntry = payload.find((p: any) => p.dataKey === "totalVolume");
        
        // Bar entries sorted by their absolute value descending
        const areaEntries = payload
            .filter((p: any) => p.dataKey !== "totalVolume")
            .sort((a: any, b: any) => (b.payload[b.name] || 0) - (a.payload[a.name] || 0));

        const totalVolume = volumeEntry?.value || areaEntries.reduce((acc: number, e: any) => acc + (e.payload[e.name] || 0), 0);

        return (
            <div className="bg-white dark:bg-gray-950 p-3 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg text-sm min-w-[220px] z-50">
                <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-1.5">{label}</p>
                
                {volumeEntry && (
                    <div className="flex items-center justify-between mb-3 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded border border-indigo-100 dark:border-indigo-800/30">
                        <div className="flex items-center gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[10px] tracking-wider">Total Volume</span>
                        </div>
                        <span className="text-gray-900 dark:text-gray-100 font-black">{valueFormatter(volumeEntry.value)}</span>
                    </div>
                )}

                <div className="space-y-1.5">
                    {areaEntries.map((entry: any, index: number) => {
                        const originalValue = entry.payload[entry.name] || 0;
                        const percentage = totalVolume > 0 ? (originalValue / totalVolume) * 100 : 0;
                        const colorClass = categoryColors[entry.name] || "bg-gray-500";

                        return (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={cx("w-2 h-2 rounded-full", colorClass)} />
                                    <span className="text-gray-600 dark:text-gray-400 text-xs">{entry.name}</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-gray-900 dark:text-gray-100 font-medium text-xs">
                                        {valueFormatter(originalValue)}
                                    </span>
                                    <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold">
                                        {percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
    return null
}

const CHART_COLOR_HEX: Record<string, string> = {
    blue: "#3b82f6",
    emerald: "#10b981",
    violet: "#8b5cf6",
    amber: "#f59e0b",
    gray: "#94a3b8",
    cyan: "#06b6d4",
    pink: "#ec4899",
    lime: "#84cc16",
    fuchsia: "#d946ef",
    indigo: "#6366f1",
};

export const CombinedInflowChart = ({
    data,
    index,
    categories,
    colors,
    valueFormatter = (value: number) => value.toString(),
    className,
}: CombinedInflowChartProps) => {
    const categoryColorMap = React.useMemo(() => {
        const map: Record<string, AvailableChartColorsKeys> = {};
        categories.forEach((cat, idx) => {
            map[cat] = colors[idx % colors.length];
        });
        return map;
    }, [categories, colors]);

    const sortedCategories = React.useMemo(() => {
        const sums: Record<string, number> = {};
        categories.forEach(cat => {
            sums[cat] = data.reduce((acc, item) => acc + (item[cat] || 0), 0);
        });
        return [...categories].sort((a, b) => sums[b] - sums[a]);
    }, [categories, data]);

    const categoryColors: Record<string, string> = {};
    sortedCategories.forEach((cat) => {
        categoryColors[cat] = getColorClassName(categoryColorMap[cat], "bg");
    });
    
    const transformedData = React.useMemo(() => {
        return data.map((item) => {
            const total = sortedCategories.reduce((acc, cat) => acc + (item[cat] || 0), 0);
            const newItem: any = { ...item, totalVolume: total };
            sortedCategories.forEach((cat) => {
                newItem[`${cat}Pct`] = total > 0 ? ((item[cat] || 0) / total) * 100 : 0;
            });
            return newItem;
        });
    }, [data, sortedCategories]);

    return (
        <div className={cx("min-h-[500px] w-full", className)}>
            <ResponsiveContainer width="100%" height={500}>
                <ComposedChart
                    data={transformedData}
                    barCategoryGap={0} // Bars are now continuous (no gap)
                    margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
                >
                    <CartesianGrid 
                        vertical={false} 
                        strokeDasharray="0" 
                        className="stroke-gray-200 dark:stroke-gray-800 opacity-50"
                    />
                    <XAxis
                        dataKey={index}
                        axisLine={false}
                        tickLine={false}
                        className="text-[10px] font-bold fill-gray-500 uppercase tracking-tighter"
                        dy={15}
                        interval="preserveStartEnd"
                        minTickGap={30}
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        className="text-[10px] font-bold fill-gray-400"
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tickFormatter={(value) => `${value}%`}
                        width={45}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        className="text-[10px] font-bold fill-gray-400"
                        tickFormatter={(value) => value.toLocaleString(undefined, { notation: 'compact', compactDisplay: 'short' })}
                        domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                        width={55}
                    />
                    <Tooltip
                        content={
                            <CustomTooltip
                                categoryColors={categoryColors}
                                valueFormatter={valueFormatter}
                            />
                        }
                        cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                        isAnimationActive={false}
                    />
                    
                    {/* Background Stacked Bars */}
                    {sortedCategories.map((category) => {
                        const colorKey = categoryColorMap[category] as string;
                        const hexColor = CHART_COLOR_HEX[colorKey] || "#6b7280";
                        return (
                            <Bar
                                key={category}
                                dataKey={`${category}Pct`}
                                name={category}
                                stackId="1"
                                yAxisId="left"
                                fill={hexColor}
                                isAnimationActive={false}
                            />
                        );
                    })}

                    {/* Foreground Volume Line */}
                    <Line
                        type="monotone"
                        dataKey="totalVolume"
                        name="Total Volume"
                        yAxisId="right"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ 
                            r: 4, 
                            fill: "white", 
                            stroke: "#6366f1", 
                            strokeWidth: 2 
                        }}
                        activeDot={{ 
                            r: 6, 
                            fill: "white", 
                            stroke: "#6366f1", 
                            strokeWidth: 2 
                        }}
                        isAnimationActive={true}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Custom Bottom Legend */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-10 pb-4">
                {sortedCategories.map((category) => (
                    <div key={category} className="flex items-center gap-2">
                        <div className={cx("w-2.5 h-2.5 rounded-full", categoryColors[category])} />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {category}
                        </span>
                    </div>
                ))}
                <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-6 ml-2">
                    <div className="w-4 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                        Total Volume
                    </span>
                </div>
            </div>
        </div>
    )
}
