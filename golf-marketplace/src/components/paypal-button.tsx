"use client"

import { PayPalButtons } from '@paypal/react-paypal-js'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'

interface PayPalButtonProps {
  amount: number
  productId?: string
  items?: any[]
  onSuccess?: (orderId: string) => void
  onError?: (error: any) => void
  disabled?: boolean
}

export function PayPalButton({
  amount,
  productId,
  items,
  onSuccess,
  onError,
  disabled
}: PayPalButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const createOrder = async (): Promise<string> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/paypal/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          items,
          orderType: productId ? 'single' : 'cart'
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      return data.paypalOrderId
    } catch (error: any) {
      setError(error.message)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const onApprove = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paypalOrderId: data.orderID })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      onSuccess?.(data.orderID)
      router.push(`/purchase/success?payment_method=paypal&order_id=${data.orderID}`)
    } catch (error: any) {
      setError(error.message)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center text-red-700">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <PayPalButtons
        style={{ layout: 'vertical', color: 'gold', shape: 'rect' }}
        disabled={disabled || loading}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={(error) => {
          setError('PayPal payment failed')
          onError?.(error)
        }}
      />
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  )
}
