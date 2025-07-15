"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import {
  CheckCircle,
  Package,
  CreditCard,
  Download,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

interface PaymentDetails {
  orderId: string
  amount: number
  currency: string
  paymentMethod: 'stripe' | 'paypal'
  status: string
  createdAt: string
}

function PurchaseSuccessContent() {
  const searchParams = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const sessionId = searchParams.get('session_id') // Stripe session ID
  const paypalOrderId = searchParams.get('order_id') // PayPal order ID
  const paymentMethod = searchParams.get('payment_method') as 'stripe' | 'paypal' || 'stripe'
  const amount = searchParams.get('amount')

  useEffect(() => {
    const loadPaymentDetails = async () => {
      try {
        if (paymentMethod === 'paypal' && paypalOrderId) {
          // For PayPal, we can use the provided data or fetch from our API
          setPaymentDetails({
            orderId: paypalOrderId,
            amount: parseFloat(amount || '0'),
            currency: 'GBP',
            paymentMethod: 'paypal',
            status: 'completed',
            createdAt: new Date().toISOString()
          })
        } else if (paymentMethod === 'stripe' && sessionId) {
          // For Stripe, we could fetch session details if needed
          setPaymentDetails({
            orderId: sessionId,
            amount: parseFloat(amount || '0'),
            currency: 'GBP',
            paymentMethod: 'stripe',
            status: 'completed',
            createdAt: new Date().toISOString()
          })
        } else {
          throw new Error('Invalid payment parameters')
        }
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadPaymentDetails()
  }, [sessionId, paypalOrderId, paymentMethod, amount])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-semibold mb-2">Processing your payment...</h1>
            <p className="text-gray-600">Please wait while we confirm your transaction.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold mb-2 text-red-900">Payment Error</h1>
              <p className="text-red-700 mb-6">
                {error || "We couldn't find your payment details. Please contact support if you believe this is an error."}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
                <Button asChild>
                  <Link href="/support">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">Payment Successful!</h1>
            <p className="text-xl text-gray-600">
              Your order has been confirmed and is being processed.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {paymentDetails.orderId.substring(0, 16)}...
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  £{paymentDetails.amount.toFixed(2)} {paymentDetails.currency}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Method:</span>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="capitalize">{paymentDetails.paymentMethod}</span>
                  <Badge
                    className={
                      paymentDetails.paymentMethod === 'paypal'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }
                  >
                    {paymentDetails.paymentMethod === 'paypal' ? 'PayPal' : 'Stripe'}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(paymentDetails.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Order Confirmation</h4>
                    <p className="text-gray-600 text-sm">
                      You'll receive an email confirmation with your order details within the next few minutes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Seller Notification</h4>
                    <p className="text-gray-600 text-sm">
                      The seller has been notified and will prepare your item for shipping.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Shipping Update</h4>
                    <p className="text-gray-600 text-sm">
                      You'll receive tracking information once your item has been shipped.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Button size="lg" asChild>
              <Link href="/orders">
                View Order History
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>

            <Button variant="outline" size="lg" asChild>
              <Link href="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Commission Note for Sellers */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">For ClubUp Sellers:</h4>
            <p className="text-sm text-blue-800">
              Commission fees are automatically deducted from seller payouts based on your subscription tier.
              Funds will be transferred to your connected account within 2-7 business days.
            </p>
          </div>

          {/* Receipt Download */}
          <div className="mt-6 text-center">
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 animate-spin mx-auto mb-4 text-primary rounded-full border-4 border-gray-300 border-t-primary" />
            <h1 className="text-2xl font-semibold mb-2">Loading your order details...</h1>
            <p className="text-gray-600">Please wait while we confirm your transaction.</p>
          </div>
        </div>
      </div>
    }>
      <PurchaseSuccessContent />
    </Suspense>
  )
}
