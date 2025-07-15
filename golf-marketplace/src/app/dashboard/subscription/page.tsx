"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, CheckCircle, XCircle, Calendar, CreditCard, AlertTriangle } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface SubscriptionData {
  id: string
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
  plan: 'pro' | 'business' | 'pga-pro'
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  nextInvoiceAmount?: number
}

export default function SubscriptionDashboard() {
  const { data: session, status } = useSession()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock subscription data - in real app, fetch from your API
  useEffect(() => {
    if (session) {
      // Simulate API call
      setTimeout(() => {
        setSubscription({
          id: 'sub_1234567890',
          status: 'trialing',
          plan: 'pro',
          currentPeriodEnd: '2025-02-12',
          cancelAtPeriodEnd: false,
          trialEnd: '2025-01-12',
          nextInvoiceAmount: 700 // £7.00 in pence
        })
        setLoading(false)
      }, 1000)
    }
  }, [session])

  const handleStartTrial = async (plan: 'pro' | 'business') => {
    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error starting trial:', error)
    }
  }

  const handleManageSubscription = async () => {
    try {
      // Create customer portal session
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error accessing customer portal:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trialing':
        return 'bg-blue-500'
      case 'active':
        return 'bg-green-500'
      case 'past_due':
        return 'bg-yellow-500'
      case 'canceled':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'trialing':
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'past_due':
        return <AlertTriangle className="w-4 h-4" />
      case 'canceled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
              <p className="text-gray-600 mb-4">Please sign in to manage your subscription.</p>
              <Button asChild>
                <a href="/auth/signin">Sign In</a>
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your ClubUp membership and billing</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Subscription */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-6">
                    {/* Plan Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold capitalize">{subscription.plan} Plan</h3>
                        <p className="text-gray-600">
                          {subscription.plan === 'pro'
                            ? 'For serious sellers and collectors'
                            : subscription.plan === 'business'
                            ? 'For golf shops and dealers'
                            : 'For PGA Professionals and industry experts'}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(subscription.status)} text-white`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(subscription.status)}
                          {subscription.status === 'trialing' ? 'Free Trial' : subscription.status}
                        </span>
                      </Badge>
                    </div>

                    {/* Trial Status */}
                    {subscription.status === 'trialing' && subscription.trialEnd && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">Free Trial Active</span>
                        </div>
                        <p className="text-blue-700 text-sm">
                          Your {subscription.plan === 'pga-pro' ? '2-month' : '1-month'} free trial ends on {new Date(subscription.trialEnd).toLocaleDateString()}
                        </p>
                        <p className="text-blue-600 text-sm mt-1">
                          After trial: £{((subscription.nextInvoiceAmount || 0) / 100).toFixed(2)}/month
                        </p>
                      </div>
                    )}

                    {/* Billing Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">Next Billing Date</span>
                        </div>
                        <p className="text-lg">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">Amount</span>
                        </div>
                        <p className="text-lg">
                          {subscription.status === 'trialing' ? 'Free' : `£${((subscription.nextInvoiceAmount || 0) / 100).toFixed(2)}`}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button onClick={handleManageSubscription}>
                        Manage Billing
                      </Button>

                      {subscription.plan === 'pro' && (
                        <Button
                          variant="outline"
                          onClick={() => handleStartTrial('business')}
                        >
                          Upgrade to Business
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                    <p className="text-gray-600 mb-6">Start your free trial to unlock premium features</p>

                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => handleStartTrial('pro')}>
                        Start Pro Trial (Free)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStartTrial('business')}
                      >
                        Start Business Trial (Free)
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Features */}
          <div className="space-y-6">
            {/* Plan Features */}
            <Card>
              <CardHeader>
                <CardTitle>Your Plan Features</CardTitle>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-3">
                    {subscription.plan === 'pro' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">3% commission on sales</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Equipment swap marketplace</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Free listing bumps (2/month)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Price history analytics</span>
                        </div>
                      </>
                    ) : subscription.plan === 'business' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">3% commission on sales</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Premium storefront</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Advanced swap features</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Free listing bumps (10/month)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Business analytics</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-yellow-600">1% commission on sales</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">PGA Professional badge</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Pro-only equipment access</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Teaching revenue tools</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Unlimited listing bumps</span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No active subscription</p>
                )}
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>This Month's Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Listing Bumps Used</span>
                    <span className="font-medium">
                      0 / {subscription?.plan === 'pga-pro' ? '∞' : subscription?.plan === 'business' ? '10' : '2'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Equipment Swaps</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Listings</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
