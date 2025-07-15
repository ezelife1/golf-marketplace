"use client"

import { Suspense } from "react"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Package, Truck, ArrowRight, ShoppingBag } from "lucide-react"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

interface OrderDetails {
  id: string
  total: number
  itemCount: number
  estimatedDelivery: string
  trackingNumber?: string
}

function CheckoutSuccessPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd fetch order details from your API using the session ID
      setTimeout(() => {
        setOrderDetails({
          id: `CU-${Date.now().toString().slice(-6)}`,
          total: 765.50,
          itemCount: 2,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          trackingNumber: undefined
        })
        setLoading(false)
      }, 1000)
    } else {
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!sessionId || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Order Not Found</h2>
              <p className="text-gray-600 mb-4">We couldn't find details for this order.</p>
              <Button asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
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
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Order Confirmed!</CardTitle>
            <p className="text-gray-600">Thank you for your purchase from ClubUp</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Order Details</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Order Number:</span>
                      <span className="font-medium">{orderDetails.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span className="font-medium">{orderDetails.itemCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Paid:</span>
                      <span className="font-medium">£{orderDetails.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Delivery</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Estimated Delivery:</span>
                      <span className="font-medium">{orderDetails.estimatedDelivery}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tracking:</span>
                      <span className="font-medium">
                        {orderDetails.trackingNumber ? orderDetails.trackingNumber : "Available soon"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What happens next?</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Order Confirmation</h4>
                    <p className="text-sm text-gray-600">You'll receive a confirmation email with your order details</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-yellow-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Seller Preparation</h4>
                    <p className="text-sm text-gray-600">Sellers will prepare your items for shipping within 1-2 business days</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Shipping & Tracking</h4>
                    <p className="text-sm text-gray-600">You'll get tracking information once items are shipped</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Delivery & Enjoyment</h4>
                    <p className="text-sm text-gray-600">Receive your golf equipment and elevate your game!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <Button className="w-full" asChild>
                <Link href="/dashboard/orders">
                  <Package className="w-4 h-4 mr-2" />
                  Track Your Order
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/products">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>

            {/* Additional Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Order confirmation email sent to your inbox</p>
                <p>• Questions? Contact our support team</p>
                <p>• 14-day return policy on all purchases</p>
                <p>• Buyer protection included with every order</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Recommended Next Steps:</h4>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/dashboard">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Go to Your Dashboard
                  </Link>
                </Button>

                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/sell/new">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Sell Your Golf Equipment
                  </Link>
                </Button>

                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/help">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Help & Support
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <CheckoutSuccessPageContent />
    </Suspense>
  )
}
