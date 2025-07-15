"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  CreditCard,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Banknote,
  Shield,
  TrendingUp,
  Info
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PayoutSetupProps {
  className?: string
}

interface ConnectAccountStatus {
  connected: boolean
  accountId?: string
  status?: {
    chargesEnabled: boolean
    payoutsEnabled: boolean
    detailsSubmitted: boolean
    requiresAction: boolean
    currentlyDue: string[]
    pendingVerification: string[]
  }
  subscriptionTier?: string
}

interface PayoutCalculation {
  grossAmount: number
  commissionRate: number
  commissionAmount: number
  stripeFee: number
  netAmount: number
}

export default function PayoutSetup({ className }: PayoutSetupProps) {
  const [accountStatus, setAccountStatus] = useState<ConnectAccountStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  // Example calculation based on subscription tier
  const calculateExamplePayout = (tier: string = 'free'): PayoutCalculation => {
    const sampleSale = 100 // £100 sale example

    const commissionRate =
      tier === 'pga-pro' ? 0.01 :
      tier === 'business' || tier === 'pro' ? 0.03 :
      0.05 // free tier

    const commissionAmount = sampleSale * commissionRate
    const stripeFee = (sampleSale * 0.029) + 0.20
    const netAmount = sampleSale - commissionAmount - stripeFee

    return {
      grossAmount: sampleSale,
      commissionRate,
      commissionAmount,
      stripeFee,
      netAmount
    }
  }

  useEffect(() => {
    fetchAccountStatus()
  }, [])

  const fetchAccountStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect/account')
      const data = await response.json()

      if (response.ok) {
        setAccountStatus(data)
      } else {
        console.error('Error fetching account status:', data.error)
      }
    } catch (error) {
      console.error('Error fetching account status:', error)
      toast({
        title: "Error",
        description: "Failed to load payout account status",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/stripe/connect/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_account' })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Account Created",
          description: "Redirecting to Stripe for account setup...",
        })

        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl
      } else {
        throw new Error(data.error || 'Failed to create account')
      }
    } catch (error: any) {
      console.error('Error creating account:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create payout account",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleCreateOnboardingLink = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/stripe/connect/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_onboarding_link' })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Onboarding Link Created",
          description: "Redirecting to complete your setup...",
        })

        window.location.href = data.onboardingUrl
      } else {
        throw new Error(data.error || 'Failed to create onboarding link')
      }
    } catch (error: any) {
      console.error('Error creating onboarding link:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create onboarding link",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleOpenDashboard = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/stripe/connect/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_dashboard_link' })
      })

      const data = await response.json()

      if (response.ok) {
        window.open(data.dashboardUrl, '_blank')
      } else {
        throw new Error(data.error || 'Failed to create dashboard link')
      }
    } catch (error: any) {
      console.error('Error creating dashboard link:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to open Stripe dashboard",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const examplePayout = calculateExamplePayout(accountStatus?.subscriptionTier)
  const isFullySetup = accountStatus?.connected &&
                      accountStatus?.status?.chargesEnabled &&
                      accountStatus?.status?.payoutsEnabled &&
                      accountStatus?.status?.detailsSubmitted

  const needsAction = accountStatus?.connected &&
                     accountStatus?.status?.requiresAction

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Setup Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                Payout Setup
              </CardTitle>
              <CardDescription>
                Set up your payout account to receive earnings from sales
              </CardDescription>
            </div>
            {isFullySetup && (
              <Badge className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
            {needsAction && (
              <Badge variant="secondary" className="bg-yellow-500 text-white">
                <AlertCircle className="w-3 h-3 mr-1" />
                Action Required
              </Badge>
            )}
            {!accountStatus?.connected && (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                Not Setup
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!accountStatus?.connected ? (
            // Not connected - show setup
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You need to set up a payout account to receive payments from your sales.
                  This is handled securely by Stripe and takes just a few minutes.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Secure & Protected</div>
                    <div className="text-sm text-gray-600">Bank details are encrypted and stored securely by Stripe</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Fast Payouts</div>
                    <div className="text-sm text-gray-600">Receive your earnings within 2 business days</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Multiple Payment Methods</div>
                    <div className="text-sm text-gray-600">Bank transfer, debit card, or digital wallet</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateAccount}
                disabled={processing}
                className="w-full"
                size="lg"
              >
                {processing ? "Creating Account..." : "Set Up Payout Account"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : needsAction ? (
            // Connected but needs action
            <div className="space-y-4">
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Your payout account needs additional information to process payments.
                  {accountStatus.status?.currentlyDue?.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium">Required information:</div>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {accountStatus.status.currentlyDue.map((item) => (
                          <li key={item}>{item.replace(/_/g, ' ')}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleCreateOnboardingLink}
                disabled={processing}
                variant="default"
                className="w-full"
              >
                {processing ? "Loading..." : "Complete Account Setup"}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            // Fully connected and active
            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your payout account is active and ready to receive payments.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Payouts Enabled</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Account Verified</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>

              <Button
                onClick={handleOpenDashboard}
                disabled={processing}
                variant="outline"
                className="w-full"
              >
                {processing ? "Loading..." : "Manage Payout Settings"}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Calculator</CardTitle>
          <CardDescription>
            See how much you'll receive from a £{examplePayout.grossAmount} sale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Sale Amount</span>
              <span className="font-medium">£{examplePayout.grossAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>ClubUp Commission ({(examplePayout.commissionRate * 100).toFixed(1)}%)</span>
              <span>-£{examplePayout.commissionAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Payment Processing (2.9% + 20p)</span>
              <span>-£{examplePayout.stripeFee.toFixed(2)}</span>
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>You Receive</span>
              <span className="text-green-600">£{examplePayout.netAmount.toFixed(2)}</span>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {accountStatus?.subscriptionTier === 'pga-pro' &&
                "As a PGA Pro member, you pay just 1% commission! "}
              {(accountStatus?.subscriptionTier === 'business' || accountStatus?.subscriptionTier === 'pro') &&
                "As a Pro member, you pay just 3% commission! "}
              {accountStatus?.subscriptionTier === 'free' &&
                "Upgrade to Pro to reduce your commission to just 3%, or PGA Pro for 1%! "}
              Payouts are processed within 2 business days.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Automatic Payouts</div>
                <div className="text-sm text-gray-600">Receive payments automatically when sales complete</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Real-time Tracking</div>
                <div className="text-sm text-gray-600">Monitor all your payouts and transaction history</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Secure Processing</div>
                <div className="text-sm text-gray-600">Bank-level security powered by Stripe</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Multiple Currencies</div>
                <div className="text-sm text-gray-600">Support for GBP, EUR, and USD</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
