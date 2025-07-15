"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Clock,
  Package,
  Truck,
  DollarSign,
  Calendar,
  ExternalLink,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Send,
  Eye,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface SellerPaymentHoldsProps {
  className?: string
}

interface HeldTransaction {
  id: string
  amount: number
  holdStatus: string
  shippedAt: string | null
  deliveredAt: string | null
  deliveryConfirmedAt: string | null
  releaseRequestedAt: string | null
  releasedAt: string | null
  product: {
    id: string
    title: string
    primaryImage: string | null
  }
  seller: {
    id: string
    name: string
  }
  isBuyer: boolean
  isSeller: boolean
  paymentHold: any
}

export default function SellerPaymentHolds({ className }: SellerPaymentHoldsProps) {
  const [heldTransactions, setHeldTransactions] = useState<HeldTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<HeldTransaction | null>(null)
  const [shipmentDialog, setShipmentDialog] = useState(false)
  const [releaseDialog, setReleaseDialog] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchHeldTransactions()
  }, [])

  const fetchHeldTransactions = async () => {
    try {
      const response = await fetch('/api/escrow?role=seller')
      const data = await response.json()

      if (response.ok && data.success) {
        setHeldTransactions(data.transactions)
      } else {
        throw new Error(data.error || 'Failed to load held transactions')
      }
    } catch (error: any) {
      console.error('Error fetching held transactions:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load held transactions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkShipped = async () => {
    if (!selectedTransaction || !trackingNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a tracking number",
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
          action: 'mark_shipped',
          transactionId: selectedTransaction.id,
          trackingNumber: trackingNumber.trim(),
          carrier: carrier.trim() || 'Unknown'
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Item Marked as Shipped",
          description: "Buyer has been notified and payment will be released after delivery confirmation.",
        })

        setShipmentDialog(false)
        setTrackingNumber('')
        setCarrier('')
        setSelectedTransaction(null)
        await fetchHeldTransactions()
      } else {
        throw new Error(data.error || 'Failed to mark item as shipped')
      }
    } catch (error: any) {
      console.error('Error marking shipped:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to mark item as shipped",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleRequestRelease = async () => {
    if (!selectedTransaction) return

    setProcessing(true)
    try {
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_release',
          transactionId: selectedTransaction.id
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Release Requested",
          description: "Buyer has been notified. Payment will be released automatically if no response within 24 hours.",
        })

        setReleaseDialog(false)
        setSelectedTransaction(null)
        await fetchHeldTransactions()
      } else {
        throw new Error(data.error || 'Failed to request release')
      }
    } catch (error: any) {
      console.error('Error requesting release:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to request payment release",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'payment_held':
        return {
          icon: <Clock className="w-4 h-4 text-yellow-600" />,
          text: 'Awaiting Shipment',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
      case 'shipped':
        return {
          icon: <Truck className="w-4 h-4 text-blue-600" />,
          text: 'In Transit',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        }
      case 'delivered':
        return {
          icon: <Package className="w-4 h-4 text-purple-600" />,
          text: 'Awaiting Confirmation',
          color: 'bg-purple-100 text-purple-800 border-purple-200'
        }
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          text: 'Ready for Payout',
          color: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'release_requested':
        return {
          icon: <MessageCircle className="w-4 h-4 text-orange-600" />,
          text: 'Release Requested',
          color: 'bg-orange-100 text-orange-800 border-orange-200'
        }
      case 'disputed':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-600" />,
          text: 'Under Review',
          color: 'bg-red-100 text-red-800 border-red-200'
        }
      case 'released':
        return {
          icon: <DollarSign className="w-4 h-4 text-green-600" />,
          text: 'Released',
          color: 'bg-green-100 text-green-800 border-green-200'
        }
      default:
        return {
          icon: <Clock className="w-4 h-4 text-gray-600" />,
          text: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }
  }

  const getActionButton = (transaction: HeldTransaction) => {
    switch (transaction.holdStatus) {
      case 'payment_held':
        return (
          <Button
            size="sm"
            onClick={() => {
              setSelectedTransaction(transaction)
              setShipmentDialog(true)
            }}
          >
            <Send className="w-4 h-4 mr-1" />
            Mark Shipped
          </Button>
        )

      case 'shipped':
      case 'delivered':
        // Check if 7 days have passed since delivery
        const deliveryDate = transaction.deliveredAt ? new Date(transaction.deliveredAt) : null
        const daysSinceDelivery = deliveryDate
          ? (Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
          : 0

        if (daysSinceDelivery >= 7) {
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedTransaction(transaction)
                setReleaseDialog(true)
              }}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Request Release
            </Button>
          )
        } else {
          return (
            <div className="text-sm text-gray-500">
              Can request in {Math.ceil(7 - daysSinceDelivery)} days
            </div>
          )
        }

      case 'release_requested':
        return (
          <div className="text-sm text-orange-600 font-medium">
            Awaiting buyer response
          </div>
        )

      case 'confirmed':
        return (
          <div className="text-sm text-green-600 font-medium">
            Ready for payout
          </div>
        )

      case 'released':
        return (
          <div className="text-sm text-green-600 font-medium">
            Payment released
          </div>
        )

      case 'disputed':
        return (
          <div className="text-sm text-red-600 font-medium">
            Under review
          </div>
        )

      default:
        return null
    }
  }

  const heldTransactions_filtered = heldTransactions.filter(t => t.isSeller)
  const activeHolds = heldTransactions_filtered.filter(t =>
    !['released', 'confirmed'].includes(t.holdStatus)
  )
  const completedHolds = heldTransactions_filtered.filter(t =>
    ['released', 'confirmed'].includes(t.holdStatus)
  )

  const totalHeldAmount = activeHolds.reduce((sum, t) => sum + t.amount, 0)

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Held</p>
                <p className="text-2xl font-bold text-yellow-600">£{totalHeldAmount.toFixed(2)}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Holds</p>
                <p className="text-2xl font-bold">{activeHolds.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedHolds.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Held Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Held Payments</CardTitle>
              <CardDescription>
                Payments held in escrow until delivery confirmation
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchHeldTransactions}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active Holds ({activeHolds.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedHolds.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              {activeHolds.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Active Holds</h3>
                  <p className="text-gray-600">
                    All your payments have been released or you have no pending transactions.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Held Since</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeHolds.map((transaction) => {
                      const statusInfo = getStatusInfo(transaction.holdStatus)
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {transaction.product.primaryImage && (
                                <img
                                  src={transaction.product.primaryImage}
                                  alt={transaction.product.title}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <div className="font-medium">{transaction.product.title}</div>
                                <div className="text-sm text-gray-500">
                                  #{transaction.id.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold">£{transaction.amount.toFixed(2)}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              {statusInfo.icon}
                              <span className="ml-1">{statusInfo.text}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {transaction.paymentHold?.heldAt
                                ? format(new Date(transaction.paymentHold.heldAt), 'MMM dd, yyyy')
                                : 'N/A'
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            {getActionButton(transaction)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              {completedHolds.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Completed Transactions</h3>
                  <p className="text-gray-600">
                    Completed transactions will appear here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedHolds.map((transaction) => {
                      const statusInfo = getStatusInfo(transaction.holdStatus)
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {transaction.product.primaryImage && (
                                <img
                                  src={transaction.product.primaryImage}
                                  alt={transaction.product.title}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <div className="font-medium">{transaction.product.title}</div>
                                <div className="text-sm text-gray-500">
                                  #{transaction.id.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold">£{transaction.amount.toFixed(2)}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              {statusInfo.icon}
                              <span className="ml-1">{statusInfo.text}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {transaction.releasedAt
                                ? format(new Date(transaction.releasedAt), 'MMM dd, yyyy')
                                : transaction.deliveryConfirmedAt
                                ? format(new Date(transaction.deliveryConfirmedAt), 'MMM dd, yyyy')
                                : 'N/A'
                              }
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Mark Shipped Dialog */}
      <Dialog open={shipmentDialog} onOpenChange={setShipmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Item as Shipped</DialogTitle>
            <DialogDescription>
              Provide shipping details to notify the buyer that their item is on the way.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="tracking">Tracking Number *</Label>
              <Input
                id="tracking"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="carrier">Shipping Carrier</Label>
              <Input
                id="carrier"
                placeholder="e.g., Royal Mail, DPD, UPS"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShipmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkShipped} disabled={processing || !trackingNumber.trim()}>
              {processing ? "Processing..." : "Mark as Shipped"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Release Dialog */}
      <Dialog open={releaseDialog} onOpenChange={setReleaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payment Release</DialogTitle>
            <DialogDescription>
              Request early release of held payment if the buyer hasn't confirmed delivery.
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <MessageCircle className="h-4 w-4" />
            <AlertDescription>
              The buyer will be notified and given 24 hours to respond. If no response is received,
              the payment will be automatically released to you.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestRelease} disabled={processing}>
              {processing ? "Processing..." : "Request Release"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Hold Protection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">How it works:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Payment is held safely until delivery is confirmed</li>
                <li>• Mark items as shipped with tracking information</li>
                <li>• Buyer has 7 days after delivery to confirm receipt</li>
                <li>• Request release if buyer doesn't respond</li>
                <li>• Payment automatically released after grace period</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3">Benefits:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Builds trust with buyers</li>
                <li>• Reduces disputes and chargebacks</li>
                <li>• Protects both buyer and seller</li>
                <li>• Industry-standard marketplace protection</li>
                <li>• Automatic dispute resolution</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
