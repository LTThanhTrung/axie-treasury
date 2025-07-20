import { Badge } from "@/components/Badge"
import { cx } from "@/lib/utils"
import { Tooltip } from "recharts"

import type { KpiEntryExtended } from "@/pages"

export type CardProps = {
    title: string
    value: string
    subtitle: string
    data: KpiEntryExtended[]
}

export function CategoryBarCard({
    title,
    value,
    subtitle,
    data,
}: CardProps) {
    return (
        <>
            <div className="flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                            {title}
                        </h3>
                    </div>
                    <p className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl text-gray-900 dark:text-gray-50">
                            {value}
                        </span>
                    </p>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                            {subtitle}
                        </p>
                        <div className="mt-2 flex items-center gap-0.5">
                            {data.map((item) => (
                                <div
                                    className={cx(item.color, `h-1.5`)}
                                    style={{ width: `${item.percentage}%` }}
                                />
                            ))}
                        </div>
                    </div>
                    <ul role="list" className="mt-5 space-y-2">
                        {data.map((item) => (
                            <li key={item.title} className="flex items-center gap-2 text-xs">
                                <span
                                    className={cx(item.color, "size-2.5 ")}
                                    aria-hidden="true"
                                />
                                <span className="text-gray-900 dark:text-gray-50">
                                    {item.title}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    ({item.value} / {item.percentage}%)
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}
