"use client"

import { useState } from 'react'
import { Check, ChevronDown, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLocale, LOCALES } from '@/contexts/locale-context'

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'full'
  className?: string
}

export function LanguageSelector({
  variant = 'default',
  className = ''
}: LanguageSelectorProps) {
  const { locale, setLocale, t } = useLocale()
  const [open, setOpen] = useState(false)

  const handleLanguageChange = (localeCode: string) => {
    setLocale(localeCode)
    setOpen(false)
  }

  // Get available languages (currently focusing on European languages + English variants)
  const availableLocales = Object.values(LOCALES).filter(loc =>
    ['en-GB', 'en-US', 'fr-FR', 'de-DE', 'es-ES', 'it-IT'].includes(loc.code)
  )

  if (variant === 'compact') {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`gap-2 ${className}`}>
            <span className="text-lg">{locale.flag}</span>
            <span className="font-medium text-xs">{locale.code.split('-')[0].toUpperCase()}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 mb-2 px-2">
              {t('common.language', 'Select Language')}
            </div>
            {availableLocales.map((localeOption) => (
              <DropdownMenuItem
                key={localeOption.code}
                onClick={() => handleLanguageChange(localeOption.code)}
                className="flex items-center justify-between p-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{localeOption.flag}</span>
                  <div>
                    <div className="font-medium">{localeOption.nativeName}</div>
                    <div className="text-xs text-gray-500">{localeOption.name}</div>
                  </div>
                </div>
                {locale.code === localeOption.code && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
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
              <Languages className="w-4 h-4" />
              <span className="text-lg">{locale.flag}</span>
              <span>{locale.nativeName}</span>
              <ChevronDown className="w-4 h-4" />
            </>
          ) : (
            <>
              <span className="text-lg">{locale.flag}</span>
              <span>{locale.code.split('-')[0].toUpperCase()}</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <div className="text-sm font-medium text-gray-700 mb-2 px-2">
            {t('common.language', 'Select Language')}
          </div>
          {availableLocales.map((localeOption) => (
            <DropdownMenuItem
              key={localeOption.code}
              onClick={() => handleLanguageChange(localeOption.code)}
              className="flex items-center justify-between p-3 cursor-pointer rounded-md"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{localeOption.flag}</span>
                <div>
                  <div className="font-medium">{localeOption.nativeName}</div>
                  <div className="text-xs text-gray-500">{localeOption.name}</div>
                </div>
              </div>
              {locale.code === localeOption.code && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
        <div className="border-t p-2">
          <div className="text-xs text-gray-500 px-2">
            {t('common.languageNote', 'More languages coming soon')}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact version for mobile/header
export function LanguageSelectorCompact(props: Omit<LanguageSelectorProps, 'variant'>) {
  return <LanguageSelector {...props} variant="compact" />
}

// Full version for settings/onboarding
export function LanguageSelectorFull(props: Omit<LanguageSelectorProps, 'variant'>) {
  return <LanguageSelector {...props} variant="full" />
}
