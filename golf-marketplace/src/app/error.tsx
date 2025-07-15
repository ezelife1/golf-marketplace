"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import {
  RefreshCw,
  Home,
  MessageCircle,
  AlertTriangle,
  ArrowLeft,
  Shield,
  Clock
} from "lucide-react"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Error Graphic */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-red-600 mb-4">500</div>
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold mb-4">Something went wrong on our end</h1>
          <p className="text-xl text-gray-600 mb-8">
            We're experiencing a temporary technical issue. Our team has been notified and is working to fix it.
            Please try again in a few moments.
          </p>

          {/* Error Details */}
          {error.digest && (
            <Alert className="mb-8 text-left">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Error ID:</strong> {error.digest}
                <br />
                <span className="text-sm text-gray-600">
                  Please include this ID when contacting support for faster assistance.
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={reset}
              className="px-8"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>

            <Link href="/">
              <Button size="lg" variant="outline" className="px-8">
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Status Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">What can you do?</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3 p-3">
                  <RefreshCw className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium">Refresh the page</div>
                    <div className="text-sm text-gray-600">The issue might resolve automatically</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3">
                  <Clock className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <div className="font-medium">Wait a few minutes</div>
                    <div className="text-sm text-gray-600">Our team is working on it</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <div className="font-medium">Your data is safe</div>
                    <div className="text-sm text-gray-600">No information has been lost</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3">
                  <MessageCircle className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <div className="font-medium">Contact support</div>
                    <div className="text-sm text-gray-600">If the problem persists</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="mt-8 p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium mb-2">Need immediate assistance?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Our support team is available to help resolve any issues
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </div>

          {/* Status Footer */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Error occurred at: {new Date().toLocaleString()}
              <br />
              ClubUp Status: Monitoring • Support: Available 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
