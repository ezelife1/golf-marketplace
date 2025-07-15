import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { CartProvider } from "@/contexts/cart-context"
import { PayPalProvider } from "@/components/paypal-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ClubUp - Golf Equipment Marketplace",
  description: "The premier marketplace for premium golf equipment. Buy, sell, and discover exceptional gear.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <PayPalProvider>
            {children}
            <Toaster />
          </PayPalProvider>
        </Providers>
      </body>
    </html>
  )
}
