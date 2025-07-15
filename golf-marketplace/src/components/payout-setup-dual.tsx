"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Info,
  Mail,
  Globe,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PayoutSetupDualProps {
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

interface PayPalAccountStatus {
  connected: boolean
  email?: string
  verified?: boolean
  status?: 'active' | 'pending' | 'requires_action'
}

interface PayoutCalculation {
  grossAmount: number
  commissionRate: number
  commissionAmount: number
  processingFee: number
  netAmount: number
  method: 'stripe' | 'paypal'
}

export default function PayoutSetupDual({ className }: PayoutSetupDualProps) {
  const [stripeStatus, setStripeStatus] = useState<ConnectAccountStatus | null>(null)
  const [paypalStatus, setPayPalStatus] = useState<PayPalAccountStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paypalEmail, setPayPalEmail] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'paypal'>('stripe')
  const { toast } = useToast()

  // Calculate payout examples for both methods
  const calculateExamplePayout = (tier: string = 'free', method: 'stripe' | 'paypal' = 'stripe'): PayoutCalculation => {
    const sampleSale = 100 // £100 sale example

    const commissionRate =
      tier === 'pga-pro' ? 0.01 :
      tier === 'business' || tier === 'pro' ? 0.03 :
      0.05 // free tier

    const commissionAmount = sampleSale * commissionRate

    // Different processing fees for each method
    const processingFee = method === 'stripe'
      ? (sampleSale * 0.029) + 0.20  // Stripe: 2.9% + 20p
      : 0.20  // PayPal: £0.20 flat fee for payouts

    const netAmount = sampleSale - commissionAmount - processingFee

    return {
      grossAmount: sampleSale,
      commissionRate,
      commissionAmount,
      processingFee,
      netAmount,
      method
    }
  }

  useEffect(() => {
    fetchAccountStatuses()
  }, [])

  const fetchAccountStatuses = async () => {
    try {
      // Fetch Stripe Connect status
      const stripeResponse = await fetch('/api/stripe/connect/account')
      if (stripeResponse.ok) {
        const stripeData = await stripeResponse.json()
        setStripeStatus(stripeData)
      }

      // TODO: Fetch PayPal account status when user has linked account
      // For now, simulate checking if PayPal account is linked
      setPayPalStatus({
        connected: false,
        email: '',
        verified: false,
        status: 'pending'
      })

    } catch (error) {
      console.error('Error fetching account statuses:', error)
      toast({
        title: "Error",
        description: "Failed to load payout account status",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStripeAccount = async () => {
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

        window.location.href = data.onboardingUrl
      } else {
        throw new Error(data.error || 'Failed to create account')
      }
    } catch (error: any) {
      console.error('Error creating Stripe account:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create payout account",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleVerifyPayPalAccount = async () => {
    if (!paypalEmail) {
      toast({
        title: "Error",
        description: "Please enter your PayPal email address",
        variant: "destructive"
      })
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/paypal/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_account',
          email: paypalEmail
        })
      })

      const data = await response.json()

      if (response.ok && data.verification.valid) {
        setPayPalStatus({
          connected: true,
          email: paypalEmail,
          verified: true,
          status: 'active'
        })

        toast({
          title: "PayPal Account Verified",
          description: "Your PayPal account is ready to receive payouts",
        })
      } else {
        throw new Error(data.verification?.error || 'PayPal account verification failed')
      }
    } catch (error: any) {
      console.error('Error verifying PayPal account:', error)
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify PayPal account",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleOpenStripeDashboard = async () => {
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

  const stripeReady = stripeStatus?.connected &&
                    stripeStatus?.status?.chargesEnabled &&
                    stripeStatus?.status?.payoutsEnabled &&
                    stripeStatus?.status?.detailsSubmitted

  const paypalReady = paypalStatus?.connected && paypalStatus?.verified

  const hasAnyPayoutMethod = stripeReady || paypalReady

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Setup Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                Payout Methods
              </CardTitle>
              <CardDescription>
                Choose how you want to receive your earnings from sales
              </CardDescription>
            </div>
            {hasAnyPayoutMethod && (
              <Badge className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Setup Complete
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as 'stripe' | 'paypal')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stripe" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Bank Transfer
              </TabsTrigger>
              <TabsTrigger value="paypal" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                PayPal
              </TabsTrigger>
            </TabsList>

            {/* Stripe Connect Tab */}
            <TabsContent value="stripe" className="space-y-4 mt-6">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Bank Transfer (Stripe Connect)</div>
                  <div className="text-sm text-gray-600">Direct transfer to your bank account</div>
                </div>
                {stripeReady && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
              </div>

              {!stripeStatus?.connected ? (
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Connect your bank account to receive payments directly.
                      This is handled securely by Stripe and takes just a few minutes.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleCreateStripeAccount}
                    disabled={processing}
                    className="w-full"
                    size="lg"
                  >
                    {processing ? "Creating Account..." : "Set Up Bank Transfer"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : stripeStatus.status?.requiresAction ? (
                <div className="space-y-4">
                  <Alert className="border-yellow-500 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      Your bank account needs additional information to process payments.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleCreateStripeAccount}
                    disabled={processing}
                    className="w-full"
                  >
                    {processing ? "Loading..." : "Complete Bank Setup"}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Your bank account is connected and ready to receive payments.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleOpenStripeDashboard}
                    disabled={processing}
                    variant="outline"
                    className="w-full"
                  >
                    {processing ? "Loading..." : "Manage Bank Settings"}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* PayPal Tab */}
            <TabsContent value="paypal" className="space-y-4 mt-6">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">PayPal Payouts</div>
                  <div className="text-sm text-gray-600">Receive payments to your PayPal account</div>
                </div>
                {paypalReady && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
              </div>

              {!paypalStatus?.connected ? (
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Enter your PayPal email address to receive payouts.
                      Make sure it's the email associated with your verified PayPal account.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="paypal-email">PayPal Email Address</Label>
                    <Input
                      id="paypal-email"
                      type="email"
                      placeholder="your-email@example.com"
                      value={paypalEmail}
                      onChange={(e) => setPayPalEmail(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleVerifyPayPalAccount}
                    disabled={processing || !paypalEmail}
                    className="w-full"
                    size="lg"
                  >
                    {processing ? "Verifying Account..." : "Verify PayPal Account"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      PayPal account {paypalStatus.email} is verified and ready to receive payouts.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setPayPalStatus({ connected: false, email: '', verified: false })
                        setPayPalEmail('')
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Change Account
                    </Button>
                    <Button
                      onClick={() => window.open('https://www.paypal.com', '_blank')}
                      variant="outline"
                      className="flex-1"
                    >
                      PayPal Dashboard
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid gap-3 mt-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Zap className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Instant Transfers</div>
                    <div className="text-sm text-gray-600">PayPal-to-PayPal transfers are often instant</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Global Support</div>
                    <div className="text-sm text-gray-600">Available in 200+ countries and territories</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payout Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Calculator</CardTitle>
          <CardDescription>
            Compare fees and earnings for a £100 sale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as 'stripe' | 'paypal')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stripe">Bank Transfer</TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
            </TabsList>

            <TabsContent value="stripe" className="space-y-4 mt-4">
              {(() => {
                const calc = calculateExamplePayout(stripeStatus?.subscriptionTier, 'stripe')
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sale Amount</span>
                      <span className="font-medium">£{calc.grossAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>ClubUp Commission ({(calc.commissionRate * 100).toFixed(1)}%)</span>
                      <span>-£{calc.commissionAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Stripe Fee (2.9% + 20p)</span>
                      <span>-£{calc.processingFee.toFixed(2)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>You Receive</span>
                      <span className="text-green-600">£{calc.netAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })()}
            </TabsContent>

            <TabsContent value="paypal" className="space-y-4 mt-4">
              {(() => {
                const calc = calculateExamplePayout(stripeStatus?.subscriptionTier, 'paypal')
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sale Amount</span>
                      <span className="font-medium">£{calc.grossAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>ClubUp Commission ({(calc.commissionRate * 100).toFixed(1)}%)</span>
                      <span>-£{calc.commissionAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>PayPal Payout Fee (flat)</span>
                      <span>-£{calc.processingFee.toFixed(2)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>You Receive</span>
                      <span className="text-green-600">£{calc.netAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })()}
            </TabsContent>
          </Tabs>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {stripeStatus?.subscriptionTier === 'pga-pro' &&
                "As a PGA Pro member, you pay just 1% commission! "}
              {(stripeStatus?.subscriptionTier === 'business' || stripeStatus?.subscriptionTier === 'pro') &&
                "As a Pro member, you pay just 3% commission! "}
              {stripeStatus?.subscriptionTier === 'free' &&
                "Upgrade to Pro to reduce your commission to just 3%, or PGA Pro for 1%! "}
              Payouts are processed within 2 business days.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Method Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Method Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Stripe Connect */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-semibold">Bank Transfer (Stripe)</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Direct to bank account</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>2-3 business day transfers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span>Requires bank verification</span>
                </div>
              </div>
            </div>

            {/* PayPal */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <h3 className="font-semibold">PayPal Payouts</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Instant PayPal transfers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Global availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Easy setup with email</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Lower flat fee for small amounts</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
