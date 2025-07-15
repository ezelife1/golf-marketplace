"use client"

import { Suspense } from "react"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Crown, Sparkles, ArrowRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

interface SubscriptionPaymentDetails {
  type: "subscription"
  plan: string
  trialEnd: string
  amount: string
  trialLength: string
}

interface ServicePaymentDetails {
  type: "service"
  service: string
  amount: string
}

type PaymentDetails = SubscriptionPaymentDetails | ServicePaymentDetails

function PaymentSuccessPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const sessionId = searchParams.get("session_id")
  const paymentType = searchParams.get("type") || "subscription"

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd fetch payment details from your API
      // For demo purposes, we'll simulate the data
      setTimeout(() => {
        if (paymentType === "subscription") {
          const plan = searchParams.get("plan") || "pro"
          const trialDays = plan === "pga-pro" ? 60 : 30
          const amount = plan === "business" ? "£22" : plan === "pga-pro" ? "£45" : "£7"

          setPaymentDetails({
            type: "subscription",
            plan: plan,
            trialEnd: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toLocaleDateString(),
            amount: amount,
            trialLength: plan === "pga-pro" ? "60 days" : "30 days"
          })
        } else {
          setPaymentDetails({
            type: "service",
            service: searchParams.get("service") || "Quick Bump",
            amount: searchParams.get("amount") || "£2.50"
          })
        }
        setLoading(false)
      }, 1000)
    } else {
      setLoading(false)
    }
  }, [sessionId, paymentType, searchParams])

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

  if (!sessionId || !paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Payment Not Found</h2>
              <p className="text-gray-600 mb-4">We couldn't find details for this payment.</p>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
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
            <CardTitle className="text-2xl text-green-600">
              {paymentDetails.type === "subscription" ? "Welcome to ClubUp!" : "Payment Successful!"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {paymentDetails.type === "subscription" ? (
              <>
                {/* Subscription Success */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold capitalize">
                      {paymentDetails.plan} Plan Activated
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trial Period:</span>
                      <span className="font-medium">{paymentDetails.trialLength || "30 Days"} FREE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trial Ends:</span>
                      <span className="font-medium">{paymentDetails.trialEnd}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">After Trial:</span>
                      <span className="font-medium">{paymentDetails.amount}/month</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🎉 Your Premium Features Are Now Active!</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 3% commission rate (vs 5% for free users)</li>
                    <li>• Equipment swap marketplace access</li>
                    <li>• Free monthly listing bumps</li>
                    <li>• Priority customer support</li>
                    {paymentDetails.plan === "business" && (
                      <>
                        <li>• Business analytics dashboard</li>
                        <li>• Bulk upload tools</li>
                        <li>• Verified seller badge</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Button className="w-full" asChild>
                    <Link href="/dashboard/subscription">
                      <Crown className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/sell">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create First Listing
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Service Payment Success */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">Service Purchased</h3>
                  <p className="text-gray-600 mb-4">
                    Your {paymentDetails.service} purchase for {paymentDetails.amount} has been processed successfully.
                  </p>

                  <div className="bg-white rounded-lg p-4 inline-block">
                    <div className="text-sm text-gray-600">Payment Amount</div>
                    <div className="text-2xl font-bold text-green-600">{paymentDetails.amount}</div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
                  <p className="text-sm text-blue-800">
                    Your service will be activated within the next few minutes.
                    You'll receive a confirmation email with all the details.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Button className="w-full" asChild>
                    <Link href="/dashboard">
                      View Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/services">
                      More Services
                    </Link>
                  </Button>
                </div>
              </>
            )}

            {/* Next Steps */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Recommended Next Steps:</h4>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/profile">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Complete Your Profile
                  </Link>
                </Button>

                {paymentDetails.type === "subscription" && (
                  <>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/swap">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Explore Equipment Swaps
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/featured">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Feature Your Listings
                      </Link>
                    </Button>
                  </>
                )}

                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Browse Equipment
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

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessPageContent />
    </Suspense>
  )
}
