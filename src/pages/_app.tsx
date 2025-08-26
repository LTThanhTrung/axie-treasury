import RootLayout from "@/components/RootLayout";
import "@/styles/globals.css";
import { GoogleAnalytics } from "@next/third-parties/google"
import { GeistSans } from "geist/font/sans"
import type { AppProps } from "next/app";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <RootLayout>
      <div className={`${GeistSans.className} antialiased dark:bg-gray-950`}>
        <Component {...pageProps} />
      </div>
      <GoogleAnalytics gaId="G-JD9LGJBFFJ"/>
    </RootLayout>
  )
}