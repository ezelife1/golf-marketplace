"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestRedirectPage() {
  const [loading, setLoading] = useState(false)

  const testRedirect = async () => {
    setLoading(true)
    try {
      // Use the same URL that worked in the test
      const testUrl = "https://checkout.stripe.com/c/pay/cs_test_a1F0f8nhbWnIcLDoL2FZDjhHDdCwlTdjTxqfcwBrjGrpLa4kVCzZkpyz2Z#fidkdWxOYHwnPyd1blpxYHZxWlx%2FSDJAaHFCNnd2Tm4zV2hjVH1KYlxMMjU1SGBzX1JAR2snKSdjd2poVmB3c2B3Jz9xd3BgKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl"

      alert("About to redirect to test Stripe URL")
      console.log("Redirecting to:", testUrl)

      window.location.href = testUrl
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const testSimpleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/simple-checkout')
      const data = await response.json()

      console.log("Simple checkout response:", data)

      if (data.success && data.url) {
        alert("Got URL: " + data.url)
        window.location.href = data.url
      } else {
        alert("Failed: " + JSON.stringify(data))
      }
    } catch (error) {
      alert("Error: " + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Stripe Redirect Test</h1>

      <div className="space-y-4 max-w-md">
        <Button
          onClick={testRedirect}
          disabled={loading}
          className="w-full"
        >
          Test Direct Redirect to Stripe
        </Button>

        <Button
          onClick={testSimpleCheckout}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          Test Simple Checkout API
        </Button>

        <div className="text-sm text-gray-600">
          <p>This page tests if the redirect to Stripe works at all.</p>
          <p>Check the browser console for debug messages.</p>
        </div>
      </div>
    </div>
  )
}
