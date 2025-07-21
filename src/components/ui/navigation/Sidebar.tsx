"use client"
import { siteConfig } from "@/lib/siteConfig"
import { cx, focusRing } from "@/lib/utils"
import {
  RiHome2Line,
  RiLinkM,
} from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import MobileSidebar from "./MobileSidebar"
import ThemeSwitch from "@/components/ThemeSwitch"

const navigation = [
  { name: "Home", href: siteConfig.baseLinks.home, icon: RiHome2Line },
  { name: "Whitepaper", href: siteConfig.baseLinks.whitepaper, icon: RiLinkM }
] as const

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (itemHref: string) => {
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
                  Treasury Data
                </p>
              </div>
            </div>

            <ul role="list" className="space-y-0.5">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
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
