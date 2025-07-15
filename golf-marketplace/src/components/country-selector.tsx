"use client"

import { useState } from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCountry, COUNTRIES } from '@/contexts/country-context'

interface CountrySelectorProps {
  variant?: 'default' | 'compact' | 'full'
  showCurrency?: boolean
  className?: string
}

export function CountrySelector({
  variant = 'default',
  showCurrency = true,
  className = ''
}: CountrySelectorProps) {
  const { country, setCountry } = useCountry()
  const [open, setOpen] = useState(false)

  const handleCountryChange = (countryCode: string) => {
    setCountry(countryCode)
    setOpen(false)
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`gap-2 ${className}`}>
            <span className="text-lg">{country.flag}</span>
            <span className="font-medium">{country.currency.symbol}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {Object.values(COUNTRIES).map((countryOption) => (
            <DropdownMenuItem
              key={countryOption.code}
              onClick={() => handleCountryChange(countryOption.code)}
              className="flex items-center justify-between p-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{countryOption.flag}</span>
                <div>
                  <div className="font-medium">{countryOption.name}</div>
                  <div className="text-xs text-gray-500">
                    {countryOption.currency.code} ({countryOption.currency.symbol})
                  </div>
                </div>
              </div>
              {country.code === countryOption.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className}`}>
          {variant === 'full' ? (
            <>
              <Globe className="w-4 h-4" />
              <span className="text-lg">{country.flag}</span>
              <span>{country.name}</span>
              {showCurrency && (
                <span className="text-sm text-gray-500">
                  ({country.currency.code})
                </span>
              )}
              <ChevronDown className="w-4 h-4" />
            </>
          ) : (
            <>
              <span className="text-lg">{country.flag}</span>
              <span>{country.currency.code}</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <div className="text-sm font-medium text-gray-700 mb-2 px-2">
            Select your country
          </div>
          {Object.values(COUNTRIES).map((countryOption) => (
            <DropdownMenuItem
              key={countryOption.code}
              onClick={() => handleCountryChange(countryOption.code)}
              className="flex items-center justify-between p-3 cursor-pointer rounded-md"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{countryOption.flag}</span>
                <div>
                  <div className="font-medium">{countryOption.name}</div>
                  <div className="text-xs text-gray-500">
                    Currency: {countryOption.currency.code} ({countryOption.currency.symbol})
                  </div>
                  {variant === 'full' && (
                    <div className="text-xs text-gray-500">
                      Pro Plan: {countryOption.currency.symbol}{countryOption.pricing.pro}/month
                    </div>
                  )}
                </div>
              </div>
              {country.code === countryOption.code && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
        <div className="border-t p-2">
          <div className="text-xs text-gray-500 px-2">
            Prices automatically convert to your local currency
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact version for mobile/header
export function CountrySelectorCompact(props: Omit<CountrySelectorProps, 'variant'>) {
  return <CountrySelector {...props} variant="compact" />
}

// Full version for settings/onboarding
export function CountrySelectorFull(props: Omit<CountrySelectorProps, 'variant'>) {
  return <CountrySelector {...props} variant="full" />
}
