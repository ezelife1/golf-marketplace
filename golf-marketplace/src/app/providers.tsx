"use client"

import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/contexts/cart-context"
import { CountryProvider } from "@/contexts/country-context"
import { LocaleProvider } from "@/contexts/locale-context"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <CountryProvider>
        <LocaleProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LocaleProvider>
      </CountryProvider>
    </SessionProvider>
  )
}
