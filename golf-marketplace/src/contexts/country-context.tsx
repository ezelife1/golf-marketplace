"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CountryConfig {
  code: string
  name: string
  flag: string
  currency: {
    code: string
    symbol: string
    position: 'before' | 'after'
  }
  pricing: {
    pro: number
    business: number
    pgaPro: number
  }
  shipping: {
    free: number
    standard: number
    express: number
  }
  golfAssociation: string
  locale: string
}

export const COUNTRIES: Record<string, CountryConfig> = {
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: { code: 'GBP', symbol: '£', position: 'before' },
    pricing: { pro: 7, business: 22, pgaPro: 45 },
    shipping: { free: 50, standard: 5.99, express: 15 },
    golfAssociation: 'PGA Professional',
    locale: 'en-GB'
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: { code: 'USD', symbol: '$', position: 'before' },
    pricing: { pro: 9, business: 29, pgaPro: 59 },
    shipping: { free: 65, standard: 7.99, express: 19.99 },
    golfAssociation: 'PGA of America Professional',
    locale: 'en-US'
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: { code: 'AUD', symbol: 'A$', position: 'before' },
    pricing: { pro: 12, business: 39, pgaPro: 79 },
    shipping: { free: 75, standard: 9.99, express: 24.99 },
    golfAssociation: 'PGA of Australia Professional',
    locale: 'en-AU'
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: { code: 'CAD', symbol: 'C$', position: 'before' },
    pricing: { pro: 11, business: 35, pgaPro: 69 },
    shipping: { free: 70, standard: 8.99, express: 22.99 },
    golfAssociation: 'PGA of Canada Professional',
    locale: 'en-CA'
  },
  EU: {
    code: 'EU',
    name: 'European Union',
    flag: '🇪🇺',
    currency: { code: 'EUR', symbol: '€', position: 'before' },
    pricing: { pro: 8, business: 25, pgaPro: 52 },
    shipping: { free: 55, standard: 6.99, express: 17.99 },
    golfAssociation: 'European PGA Professional',
    locale: 'en-EU'
  }
}

interface CountryContextType {
  country: CountryConfig
  setCountry: (countryCode: string) => void
  formatPrice: (amount: number) => string
  convertPrice: (amount: number, fromCurrency?: string) => number
}

const CountryContext = createContext<CountryContextType | undefined>(undefined)

// Exchange rates (in a real app, fetch from API)
const EXCHANGE_RATES: Record<string, number> = {
  GBP: 1.0,
  USD: 1.27,
  EUR: 1.15,
  CAD: 1.70,
  AUD: 1.89
}

interface CountryProviderProps {
  children: ReactNode
}

export function CountryProvider({ children }: CountryProviderProps) {
  const [country, setCountryState] = useState<CountryConfig>(COUNTRIES.GB)

  useEffect(() => {
    // Try to detect user's country from localStorage or geolocation
    const savedCountry = localStorage.getItem('clubup-country')
    if (savedCountry && COUNTRIES[savedCountry]) {
      setCountryState(COUNTRIES[savedCountry])
    } else {
      // Try to detect from timezone or browser
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (timezone.includes('America/New_York') || timezone.includes('America/Los_Angeles')) {
          setCountryState(COUNTRIES.US)
        } else if (timezone.includes('Australia')) {
          setCountryState(COUNTRIES.AU)
        } else if (timezone.includes('Europe') && !timezone.includes('London')) {
          setCountryState(COUNTRIES.EU)
        } else if (timezone.includes('America/Toronto')) {
          setCountryState(COUNTRIES.CA)
        }
      } catch (error) {
        // Fallback to UK
        setCountryState(COUNTRIES.GB)
      }
    }
  }, [])

  const setCountry = (countryCode: string) => {
    if (COUNTRIES[countryCode]) {
      setCountryState(COUNTRIES[countryCode])
      localStorage.setItem('clubup-country', countryCode)
    }
  }

  const convertPrice = (amount: number, fromCurrency: string = 'GBP'): number => {
    const fromRate = EXCHANGE_RATES[fromCurrency] || 1
    const toRate = EXCHANGE_RATES[country.currency.code] || 1
    return Math.round(amount * (toRate / fromRate))
  }

  const formatPrice = (amount: number): string => {
    const { symbol, position } = country.currency
    const formattedAmount = amount.toLocaleString(country.locale, {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    })

    return position === 'before'
      ? `${symbol}${formattedAmount}`
      : `${formattedAmount}${symbol}`
  }

  const value = {
    country,
    setCountry,
    formatPrice,
    convertPrice
  }

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  )
}

export const useCountry = () => {
  const context = useContext(CountryContext)
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider')
  }
  return context
}
