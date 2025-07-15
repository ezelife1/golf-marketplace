"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Home,
  Search,
  MessageCircle,
  Heart,
  Clock,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)

    try {
      // Try to fetch a simple endpoint to test connectivity
      await fetch('/api/health', { method: 'HEAD' })
      window.location.reload()
    } catch (error) {
      // Still offline
      setTimeout(() => setIsRetrying(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          {/* Status Card */}
          <Card className="text-center mb-8">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-full ${isOnline ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {isOnline ? (
                    <Wifi className="w-8 h-8 text-green-600" />
                  ) : (
                    <WifiOff className="w-8 h-8 text-orange-600" />
                  )}
                </div>
              </div>

              <CardTitle className="text-2xl mb-2">
                {isOnline ? "Connection Restored!" : "You're Offline"}
              </CardTitle>

              <Badge
                className={isOnline ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
              >
                {isOnline ? "Online" : "No Internet Connection"}
              </Badge>
            </CardHeader>

            <CardContent>
              <p className="text-gray-600 mb-6">
                {isOnline
                  ? "Your internet connection has been restored. You can now access all ClubUp features."
                  : "Some features may be limited, but you can still browse cached content and access previously viewed items."
                }
              </p>

              <div className="space-y-3">
                {isOnline ? (
                  <Button onClick={() => window.location.reload()} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                ) : (
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    variant="outline"
                    className="w-full"
                  >
                    {isRetrying ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {isRetrying ? "Checking..." : "Try Again"}
                  </Button>
                )}

                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Go to Homepage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Available Offline Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Offline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/search" className="block">
                    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors text-center">
                      <Search className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <span className="text-sm font-medium">Browse Cache</span>
                    </div>
                  </Link>

                  <Link href="/wishlist" className="block">
                    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors text-center">
                      <Heart className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <span className="text-sm font-medium">Wishlist</span>
                    </div>
                  </Link>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <AlertCircle className="w-5 h-5 mt-0.5 text-amber-500 shrink-0" />
                    <div>
                      <p className="font-medium mb-1">Limited Functionality</p>
                      <p>
                        While offline, you can browse cached content but cannot make purchases,
                        send messages, or create new listings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Offline Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 shrink-0"></span>
                  <span>Previously viewed items are available offline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 shrink-0"></span>
                  <span>Your wishlist and favorites are cached locally</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 shrink-0"></span>
                  <span>Changes will sync when you're back online</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 shrink-0"></span>
                  <span>Check your mobile data or WiFi connection</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
