"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  Truck,
  MapPin,
  MessageCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface DeliveryConfirmationProps {
  transactionId: string
  className?: string
}

interface TransactionDetails {
  id: string
  amount: number
  holdStatus: string
  shippedAt: string | null
  deliveredAt: string | null
  deliveryConfirmedAt: string | null
  releaseRequestedAt: string | null
  releasedAt: string | null
  shippingTrackingNumber: string | null
  shippingCarrier: string | null
  product: {
    id: string
    title: string
    primaryImage: string | null
  }
  seller: {
    id: string
    name: string
    email: string
  }
  userRole: 'buyer' | 'seller'
  paymentHold: any
}

export default function DeliveryConfirmation({ transactionId, className }: DeliveryConfirmationProps) {
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [satisfied, setSatisfied] = useState<boolean | null>(null)
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchTransactionDetails()
  }, [transactionId])

  const fetchTransactionDetails = async () => {
    try {
      const response = await fetch(`/api/escrow?transactionId=${transactionId}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setTransaction(data.transaction)
      } else {
        throw new Error(data.error || 'Failed to load transaction details')
      }
    } catch (error: any) {
      console.error('Error fetching transaction:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load transaction details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelivery = async () => {
    if (satisfied === null) {
      toast({
        title: "Please select an option",
        description: "Please indicate if you're satisfied with the delivery",
        variant: "destructive"
      })
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_delivery',
          transactionId,
          satisfied,
          notes: notes.trim()
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (data.disputed) {
          toast({
            title: "Dispute Raised",
            description: "Your concern has been reported. Our support team will review and contact you.",
          })
        } else {
          toast({
            title: "Delivery Confirmed",
            description: "Thank you! Payment has been released to the seller.",
          })
        }

        // Refresh transaction details
        await fetchTransactionDetails()
      } else {
        throw new Error(data.error || 'Failed to confirm delivery')
      }
    } catch (error: any) {
      console.error('Error confirming delivery:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to confirm delivery",
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

  if (!transaction) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Transaction Not Found</h3>
          <p className="text-gray-600">Unable to load transaction details.</p>
        </CardContent>
      </Card>
    )
  }

  // Only buyers can use this component
  if (transaction.userRole !== 'buyer') {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">Access Denied</h3>
          <p className="text-gray-600">Only buyers can confirm delivery.</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'payment_held':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-600" />,
          text: 'Payment Held - Awaiting Shipment',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
      case 'shipped':
        return {
          icon: <Truck className="w-5 h-5 text-blue-600" />,
          text: 'Item Shipped - In Transit',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        }
      case 'delivered':
        return {
          icon: <Package className="w-5 h-5 text-purple-600" />,
          text: 'Item Delivered - Confirm Receipt',
          color: 'bg-purple-100 text-purple-800 border-purple-200'
        }
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'Delivery Confirmed - Payment Released',
          color: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'release_requested':
        return {
          icon: <MessageCircle className="w-5 h-5 text-orange-600" />,
          text: 'Seller Requested Release',
          color: 'bg-orange-100 text-orange-800 border-orange-200'
        }
      case 'disputed':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          text: 'Disputed - Under Review',
          color: 'bg-red-100 text-red-800 border-red-200'
        }
      case 'released':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: 'Payment Released',
          color: 'bg-green-100 text-green-800 border-green-200'
        }
      default:
        return {
          icon: <Clock className="w-5 h-5 text-gray-600" />,
          text: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }
  }

  const statusInfo = getStatusInfo(transaction.holdStatus)
  const canConfirm = ['shipped', 'delivered', 'release_requested'].includes(transaction.holdStatus)
  const isCompleted = ['confirmed', 'released'].includes(transaction.holdStatus)
  const isDisputed = transaction.holdStatus === 'disputed'

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Transaction Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Delivery Status
              </CardTitle>
              <CardDescription>
                Transaction #{transaction.id.slice(-8)}
              </CardDescription>
            </div>
            <Badge className={statusInfo.color}>
              {statusInfo.icon}
              <span className="ml-1">{statusInfo.text}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            {transaction.product.primaryImage && (
              <img
                src={transaction.product.primaryImage}
                alt={transaction.product.title}
                className="w-16 h-16 object-cover rounded-md"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{transaction.product.title}</h3>
              <p className="text-gray-600">Seller: {transaction.seller.name}</p>
              <p className="font-bold text-lg">£{transaction.amount.toFixed(2)}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h4 className="font-medium">Delivery Timeline</h4>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Payment Received</div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(transaction.paymentHold?.heldAt || new Date()), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>

              {transaction.shippedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Item Shipped</div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(transaction.shippedAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                    {transaction.shippingTrackingNumber && (
                      <div className="text-sm text-blue-600">
                        Tracking: {transaction.shippingTrackingNumber}
                        {transaction.shippingCarrier && ` (${transaction.shippingCarrier})`}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {transaction.deliveredAt && (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Delivered</div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(transaction.deliveredAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>
              )}

              {transaction.deliveryConfirmedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Delivery Confirmed</div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(transaction.deliveryConfirmedAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Required */}
      {canConfirm && !isCompleted && !isDisputed && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Delivery</CardTitle>
            <CardDescription>
              Please confirm that you have received your item and are satisfied with the purchase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transaction.holdStatus === 'release_requested' && (
              <Alert className="border-orange-500 bg-orange-50">
                <MessageCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  The seller has requested payment release. Please confirm delivery or report any issues.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Did you receive your item as described?</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant={satisfied === true ? "default" : "outline"}
                      onClick={() => setSatisfied(true)}
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Yes, I'm satisfied
                    </Button>
                    <Button
                      variant={satisfied === false ? "destructive" : "outline"}
                      onClick={() => setSatisfied(false)}
                      className="flex items-center gap-2"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      No, there's an issue
                    </Button>
                  </div>
                </div>
              </div>

              {satisfied !== null && (
                <div className="space-y-2">
                  <Label htmlFor="notes">
                    {satisfied ? "Additional comments (optional)" : "Please describe the issue"}
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder={satisfied
                      ? "Any additional feedback about your purchase..."
                      : "Please describe what's wrong with the item or delivery..."
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <Button
                onClick={handleConfirmDelivery}
                disabled={processing || satisfied === null}
                className="w-full"
                size="lg"
                variant={satisfied === false ? "destructive" : "default"}
              >
                {processing ? "Processing..." :
                 satisfied === false ? "Report Issue" :
                 "Confirm Delivery & Release Payment"}
              </Button>
            </div>

            <Separator />

            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Buyer Protection:</p>
              <ul className="space-y-1">
                <li>• Payment is held safely until you confirm delivery</li>
                <li>• Report any issues before confirming</li>
                <li>• Our support team will help resolve disputes</li>
                <li>• You have 7 days after delivery to confirm</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed State */}
      {isCompleted && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Delivery Confirmed</h3>
            <p className="text-gray-600 mb-4">
              Thank you for confirming delivery. Payment has been released to the seller.
            </p>
            <Button variant="outline" asChild>
              <a href={`/reviews/create?transaction=${transaction.id}`}>
                <Star className="w-4 h-4 mr-2" />
                Leave a Review
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Disputed State */}
      {isDisputed && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Issue Reported</h3>
            <p className="text-gray-600 mb-4">
              Your concern has been submitted. Our support team will review and contact you within 24 hours.
            </p>
            <Button variant="outline" asChild>
              <a href="/contact" target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                Contact Support
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
