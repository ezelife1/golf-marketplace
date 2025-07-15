"use client"

import { Suspense } from "react"
export const dynamic = "force-dynamic"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, RefreshCw, ArrowLeft, HelpCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

function PaymentCancelledPageContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason") || "cancelled"
  const paymentType = searchParams.get("type") || "subscription"
  const plan = searchParams.get("plan")

  const getTitle = () => {
    switch (reason) {
      case "failed":
        return "Payment Failed"
      case "cancelled":
        return "Payment Cancelled"
      case "declined":
        return "Payment Declined"
      default:
        return "Payment Not Completed"
    }
  }

  const getMessage = () => {
    switch (reason) {
      case "failed":
        return "There was an issue processing your payment. Please check your payment details and try again."
      case "cancelled":
        return "You cancelled the payment process. No charges have been made to your account."
      case "declined":
        return "Your payment was declined by your bank or card issuer. Please try with a different payment method."
      default:
        return "Your payment was not completed. Please try again or contact support if you continue to have issues."
    }
  }

  const getRetryUrl = () => {
    if (paymentType === "subscription" && plan) {
      return `/auth/signup?trial=${plan}`
    }
    return "/pricing"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              {getTitle()}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                {getMessage()}
              </p>
            </div>

            {/* Common Issues */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Common Issues & Solutions
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Check that your card details are correct</li>
                <li>• Ensure you have sufficient funds available</li>
                <li>• Verify your card is enabled for online purchases</li>
                <li>• Try using a different payment method</li>
                <li>• Contact your bank if payments keep getting declined</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <Button className="w-full" asChild>
                <Link href={getRetryUrl()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to ClubUp
                </Link>
              </Button>
            </div>

            {/* Alternative Options */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Alternative Options:</h4>
              <div className="space-y-3">
                {paymentType === "subscription" ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium mb-2">Continue with Free Plan</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Start using ClubUp with our free plan while you sort out payment issues.
                      </p>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/dashboard">Use Free Plan</Link>
                      </Button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium mb-2">Try Different Plan</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Maybe try our {plan === "pro" ? "Business" : "Pro"} plan instead?
                      </p>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/pricing">View All Plans</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Browse Other Services</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Check out our other services while you're here.
                    </p>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/services">All Services</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Support */}
            <div className="border-t pt-6 text-center">
              <h4 className="font-medium mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Our support team is here to help you get started with ClubUp.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/help">Help Center</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <PaymentCancelledPageContent />
    </Suspense>
  )
}
