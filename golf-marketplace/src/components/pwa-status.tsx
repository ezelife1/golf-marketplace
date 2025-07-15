"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Monitor } from "lucide-react"

export function PWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const checkPWAStatus = () => {
      // Check if running as PWA
      const isStandaloneApp = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      const isInWebAppChrome = window.matchMedia('(display-mode: minimal-ui)').matches

      const installed = isStandaloneApp || isInWebAppiOS || isInWebAppChrome

      setIsInstalled(installed)
      setIsStandalone(isStandaloneApp || isInWebAppiOS)
    }

    checkPWAStatus()

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', checkPWAStatus)

    return () => {
      mediaQuery.removeEventListener('change', checkPWAStatus)
    }
  }, [])

  if (!isInstalled) {
    return null
  }

  return (
    <Badge
      variant="outline"
      className="bg-green-50 border-green-200 text-green-700 text-xs hidden sm:flex items-center gap-1"
    >
      {isStandalone ? (
        <Smartphone className="w-3 h-3" />
      ) : (
        <Monitor className="w-3 h-3" />
      )}
      PWA Mode
    </Badge>
  )
}
