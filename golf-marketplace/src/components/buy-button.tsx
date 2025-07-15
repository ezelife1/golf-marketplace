"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CreditCard, Loader2, Truck, Clock, Shield, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PayPalButton } from '@/components/paypal-button'

interface BuyButtonProps {
  productId: string
  price: number
  title: string
  sellerId: string
  disabled?: boolean
  requiresShipping?: boolean
  sellerPostcode?: string
  dimensions?: {
    length: number
    width: number
    height: number
    weight: number
  }
}

export function BuyButton({
  productId,
  price,
  title,
  sellerId,
  disabled = false,
  requiresShipping = false,
  sellerPostcode,
  dimensions
}: BuyButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showShippingModal, setShowShippingModal] = useState(false)
  const [buyerPostcode, setBuyerPostcode] = useState('')
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)

  const handlePurchase = async () => {
    // Clear any previous errors
    setError(null)

    // Check authentication
    if (status === 'loading') {
      setError('Please wait while we check your authentication...')
      return
    }

    if (!session?.user?.email) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href))
      return
    }

    // Prevent self-purchase
    if (session.user.id === sellerId) {
      setError('You cannot purchase your own item')
      return
    }

    // If shipping is required, show shipping modal first
    if (requiresShipping && sellerPostcode && dimensions) {
      setShowShippingModal(true)
      return
    }

    // Proceed with direct checkout (free shipping or no shipping required)
    await proceedToCheckout()
  }

  const calculateShipping = async () => {
    if (!buyerPostcode.trim() || !sellerPostcode || !dimensions) return

    setShippingLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromPostcode: sellerPostcode,
          toPostcode: buyerPostcode.trim(),
          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,
          weight: dimensions.weight,
          value: price,
          category: 'golf-equipment'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate shipping')
      }

      setShippingOptions(data.options || [])

    } catch (err: any) {
      setError(err.message || 'Unable to calculate shipping')
      setShippingOptions([])
    } finally {
      setShippingLoading(false)
    }
  }

  const proceedToCheckout = async () => {
    setLoading(true)

    try {
      console.log('Starting checkout process for product:', productId)

      const checkoutData: any = {
        productId,
        buyerEmail: session!.user!.email,
        successUrl: `${window.location.origin}/purchase/success`,
        cancelUrl: window.location.href
      }

      // Add shipping information if applicable
      if (selectedShipping && buyerPostcode) {
        checkoutData.shippingOptionId = selectedShipping
        checkoutData.buyerPostcode = buyerPostcode
      }

      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData)
      })

      const data = await response.json()
      console.log('Checkout API response:', data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      if (!data.success || !data.url) {
        throw new Error('Invalid response from checkout API')
      }

      // Show commission info to user
      if (data.commission) {
        console.log(`Commission: ${(data.commission.rate * 100).toFixed(1)}% (£${data.commission.amount.toFixed(2)})`)
        console.log(`Seller receives: £${data.commission.sellerReceives.toFixed(2)}`)
      }

      console.log('Redirecting to Stripe checkout:', data.url)

      // Redirect to Stripe checkout
      window.location.href = data.url

    } catch (error: any) {
      console.error('Checkout error:', error)
      setError(error.message || 'Failed to start checkout process')
    } finally {
      setLoading(false)
      setShowShippingModal(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Options for items without shipping */}
        {!requiresShipping && session ? (
          <Tabs defaultValue="stripe" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="stripe">Credit/Debit Card</TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
            </TabsList>

            <TabsContent value="stripe" className="space-y-3">
              <Button
                onClick={handlePurchase}
                disabled={disabled || loading || status === 'loading'}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Buy Now - £{price.toFixed(2)}
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">Secure payment with Stripe</p>
            </TabsContent>

            <TabsContent value="paypal" className="space-y-3">
              <PayPalButton
                amount={price}
                productId={productId}
                onSuccess={() => {}}
                onError={(error) => setError(error.message)}
                disabled={disabled || loading}
              />
              <p className="text-xs text-gray-500 text-center">Pay securely with PayPal</p>
            </TabsContent>
          </Tabs>
        ) : (
          /* Single button for items with shipping or when not logged in */
          <Button
            onClick={handlePurchase}
            disabled={disabled || loading || status === 'loading'}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Buy Now - £{price.toFixed(2)}
                {requiresShipping && <span className="text-xs ml-1">+ shipping</span>}
              </>
            )}
          </Button>
        )}

        {!session && status !== 'loading' && (
          <p className="text-sm text-gray-600 text-center">
            You need to sign in to purchase this item
          </p>
        )}

        {session && (
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>Secure payment with Stripe & PayPal</p>
            <p>Buyer protection included</p>
          </div>
        )}
      </div>

      {/* Shipping Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Select Shipping Option</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShippingModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-gray-600 mb-6">
                Please enter your postcode to calculate shipping costs for this item.
              </p>

              {/* Postcode Input */}
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="shipping-postcode">Your Postcode</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="shipping-postcode"
                      value={buyerPostcode}
                      onChange={(e) => setBuyerPostcode(e.target.value.toUpperCase())}
                      placeholder="e.g., M1 1AA"
                      className="flex-1"
                    />
                    <Button
                      onClick={calculateShipping}
                      disabled={shippingLoading || !buyerPostcode.trim()}
                    >
                      {shippingLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Calculate'
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Shipping Options */}
              {shippingOptions.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="font-medium">Available Shipping Options:</h4>
                  {shippingOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedShipping === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={selectedShipping === option.id}
                        onChange={(e) => setSelectedShipping(e.target.value)}
                        className="sr-only"
                      />

                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{option.carrier}</div>
                          <Badge variant="outline" className="text-xs">
                            {option.service}
                          </Badge>
                          {option.tracking && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Tracked
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {option.price === 0 ? 'FREE' : `£${option.price.toFixed(2)}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {option.estimatedDays}
                        </div>
                        {option.insurance && (
                          <div className="flex items-center">
                            <Shield className="w-4 h-4 mr-1" />
                            Insured up to £{option.insurance}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-700">{option.description}</p>
                    </label>
                  ))}
                </div>
              )}

              {/* Payment Options */}
              {selectedShipping && (
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Choose Payment Method:</h4>
                  <Tabs defaultValue="stripe" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="stripe">Credit/Debit Card</TabsTrigger>
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stripe" className="space-y-3">
                      <Button
                        onClick={proceedToCheckout}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay with Card - £{(price + (shippingOptions.find(opt => opt.id === selectedShipping)?.price || 0)).toFixed(2)}
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 text-center">Secure payment with Stripe</p>
                    </TabsContent>

                    <TabsContent value="paypal" className="space-y-3">
                      <PayPalButton
                        amount={price + (shippingOptions.find(opt => opt.id === selectedShipping)?.price || 0)}
                        productId={productId}
                        onSuccess={() => setShowShippingModal(false)}
                        onError={(error) => setError(error.message)}
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 text-center">Pay securely with PayPal</p>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Cancel Button */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowShippingModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
