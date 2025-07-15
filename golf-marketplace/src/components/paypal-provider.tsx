"use client"

import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { ReactNode } from 'react'

interface PayPalProviderProps {
  children: ReactNode
}

export function PayPalProvider({ children }: PayPalProviderProps) {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  if (!paypalClientId) {
    // If PayPal is not configured, just render children without PayPal
    return <>{children}</>
  }

  const initialOptions = {
    clientId: paypalClientId,
    currency: 'GBP',
    intent: 'capture',
    components: 'buttons,messages',
    'enable-funding': 'venmo,paylater',
    'disable-funding': 'credit,card'
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  )
}
