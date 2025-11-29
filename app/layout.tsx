import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider"
import { CustomChat } from "@/components/custom-chat"
import "./fonts.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap', // Prevent invisible text during font load
  preload: true,
  weight: ['300', '400', '500', '600', '700', '800']
});

export const metadata = {
  title: "Ztake - Payment Gateway for Modern Businesses",
  description: "Accept payments globally with the fastest, most secure gateway. Designed for scale, engineered for speed.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        <ThemeProvider>
          <SmoothScrollProvider>
            {children}
            <CustomChat />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
