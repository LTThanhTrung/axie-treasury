import { Html, Head, Main, NextScript } from "next/document";
import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans"



export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning className="dark:bg-gray-950">
      <Head />
      <body className={`${GeistSans.className} antialiased min-h-screen scroll-auto antialiased selection:bg-indigo-100 selection:text-indigo-700 dark:bg-gray-950`}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
