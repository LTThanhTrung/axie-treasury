"use client"
import { siteConfig } from "@/lib/siteConfig"
import { cx, focusRing } from "@/lib/utils"
import {
  RiHome2Line,
  RiLinkM,
  RiSafe2Line,
  RiPieChartLine,
  RiWallet3Line,
} from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import MobileSidebar from "./MobileSidebar"
import ThemeSwitch from "@/components/ThemeSwitch"

const navigation = [
  { name: "Treasury Data", href: siteConfig.baseLinks.home, icon: RiHome2Line, target: undefined },
  { name: "AXS Staking", href: "/axs-staking", icon: RiSafe2Line, target: undefined },
  { name: "AXS Breakdown", href: "/axs-breakdown", icon: RiPieChartLine, target: undefined },
  { name: "bAXS Breakdown", href: "/baxs-breakdown", icon: RiPieChartLine, target: undefined },
  { name: "Whitepaper", href: siteConfig.baseLinks.whitepaper, icon: RiLinkM, target: "_blank" },
  { name: "Wallet", href: "https://explorer.roninchain.com/address/0x245db945c485b68fDc429E4F7085a1761Aa4d45d?tab=tokens", icon: RiWallet3Line, target: "_blank" },
  { name: "Governance Portal", href: siteConfig.baseLinks.governance, icon: RiLinkM, target: "_blank" }
] as const

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (itemHref: string) => {
    if (itemHref === "/") {
      return pathname === "/"
    }
    return pathname === itemHref || pathname.startsWith(itemHref)
  }
  return (
    <>
      <nav className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <aside className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <nav
            aria-label="core navigation links"
            className="flex flex-1 flex-col space-y-10"
          >
            <div className="flex w-full items-center gap-x-2.5 rounded-md border-gray-300 bg-white p-2 text-sm transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 hover:dark:bg-gray-900 focus:ring-2 focus:ring-indigo-200 focus:dark:ring-indigo-700/30 focus:border-indigo-500 focus:dark:border-indigo-700">
              <img src={"axs.png"} className="size-9" />
              <div className="flex w-full items-center justify-between gap-x-4 truncate">
                <p
                  className={"truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50"}>
                  Axie Treasury
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-y-7">
              <div>
                <p className="px-2 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Dashboards
                </p>
                <ul role="list" className="space-y-0.5">
                  {navigation.slice(0, 4).map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        target={item.target}
                        className={cx(
                          isActive(item.href)
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                          "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-gray-100 hover:dark:bg-gray-900",
                          focusRing,
                        )}
                      >
                        <item.icon className="size-4 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="px-2 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  External Links
                </p>
                <ul role="list" className="space-y-0.5">
                  {navigation.slice(4).map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        target={item.target}
                        className={cx(
                          isActive(item.href)
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                          "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-gray-100 hover:dark:bg-gray-900",
                          focusRing,
                        )}
                      >
                        <item.icon className="size-4 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
          <ThemeSwitch />
        </aside>
      </nav>
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-2 shadow-sm sm:gap-x-6 sm:px-4 lg:hidden dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-1 sm:gap-2">
          <MobileSidebar />
        </div>
      </div>
    </>
  )
}
