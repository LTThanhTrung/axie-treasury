import { ThemeProvider } from "next-themes"
import { Inter } from "next/font/google"

import { Sidebar } from "@/components/ui/navigation/Sidebar"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="mx-auto max-w-screen-2xl">
      <ThemeProvider defaultTheme={"dark"} attribute="class">
        <Sidebar />
        <main className="lg:pl-72">{children}</main>
      </ThemeProvider>
    </div>
  )
}
