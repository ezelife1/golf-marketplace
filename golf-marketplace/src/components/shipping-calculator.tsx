"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Truck,
  Package,
  Clock,
  MapPin,
  Shield,
  Calculator,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface ShippingOption {
  id: string
  carrier: string
  service: string
  price: number
  currency: string
  estimatedDays: string
  description: string
  tracking: boolean
  insurance?: number
  size_restrictions?: string
}

interface ShippingCalculatorProps {
  productId: string
  sellerPostcode: string
  dimensions: {
    length: number
    width: number
    height: number
    weight: number
  }
  value: number
  category?: string
  freeShipping?: boolean
}

export function ShippingCalculator({
  productId,
  sellerPostcode,
  dimensions,
  value,
  category,
  freeShipping = false
}: ShippingCalculatorProps) {
  const [buyerPostcode, setBuyerPostcode] = useState('')
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calculated, setCalculated] = useState(false)

  const calculateShipping = async () => {
    if (!buyerPostcode.trim()) {
      setError('Please enter your postcode')
      return
    }

    // Basic UK postcode validation
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i
    if (!postcodeRegex.test(buyerPostcode.trim())) {
      setError('Please enter a valid UK postcode')
      return
    }

    setLoading(true)
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
          value: value,
          category: category
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate shipping')
      }

      setShippingOptions(data.options || [])
      setCalculated(true)

    } catch (err: any) {
      console.error('Shipping calculation error:', err)
      setError(err.message || 'Unable to calculate shipping at this time')
      setShippingOptions([])
    } finally {
      setLoading(false)
    }
  }

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyerPostcode(e.target.value.toUpperCase())
    setCalculated(false)
    setError(null)
  }

  if (freeShipping) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Truck className="w-5 h-5 mr-2 text-green-600" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-900">Free Shipping Included</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              This seller has included shipping costs in the product price.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Calculator className="w-5 h-5 mr-2" />
          Calculate Shipping Cost
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Package Information */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="space-y-1">
            <div className="text-xs text-gray-600">Dimensions (L×W×H)</div>
            <div className="font-medium">
              {dimensions.length}×{dimensions.width}×{dimensions.height}cm
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">Weight</div>
            <div className="font-medium">{dimensions.weight}kg</div>
          </div>
        </div>

        {/* Postcode Input */}
        <div className="space-y-2">
          <Label htmlFor="buyer-postcode">Your Postcode</Label>
          <div className="flex gap-2">
            <Input
              id="buyer-postcode"
              value={buyerPostcode}
              onChange={handlePostcodeChange}
              placeholder="e.g., M1 1AA"
              className="flex-1"
            />
            <Button
              onClick={calculateShipping}
              disabled={loading || !buyerPostcode.trim()}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Calculate'
              )}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Shipping Options */}
        {calculated && shippingOptions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Available Shipping Options:</h4>
            {shippingOptions.map((option) => (
              <div
                key={option.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
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

                {option.size_restrictions && (
                  <div className="text-xs text-gray-500 mt-1">
                    <Info className="w-3 h-3 inline mr-1" />
                    {option.size_restrictions}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Options Message */}
        {calculated && shippingOptions.length === 0 && !error && (
          <Alert>
            <Package className="w-4 h-4" />
            <AlertDescription>
              No shipping options available for this destination. Please contact the seller directly.
            </AlertDescription>
          </Alert>
        )}

        {/* Information */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Shipping costs are calculated in real-time using carrier APIs</p>
          <p>• All Royal Mail services include compensation up to £20</p>
          <p>• Tracked services provide full delivery confirmation</p>
          <p>• Collection in person is always available</p>
        </div>

        {/* Seller Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center mb-1">
            <MapPin className="w-4 h-4 text-blue-600 mr-1" />
            <span className="text-sm font-medium text-blue-900">Seller Location</span>
          </div>
          <p className="text-sm text-blue-700">
            Item will be shipped from {sellerPostcode} area
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
