"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  ExternalLink,
  Filter,
  MoreHorizontal,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  CreditCard
} from "lucide-react"
import { format } from "date-fns"

interface PayoutHistoryProps {
  className?: string
}

interface Payout {
  id: string
  transactionId: string
  grossAmount: number
  commissionAmount: number
  stripeFee: number
  netAmount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed'
  processedAt: string | null
  stripeTransferId: string | null
  payoutMethod: 'stripe' | 'paypal'
  paypalPayoutId?: string | null
  paypalBatchId?: string | null
  receiverEmail?: string
  paypalFee?: number
  transaction?: {
    id: string
    productId: string
    amount: number
    status: string
    createdAt: string
  }
}

interface StripeTransfer {
  id: string
  amount: number
  currency: string
  created: Date
  description: string | null
  status: string
  metadata: Record<string, string>
}

interface PayPalPayout {
  id: string
  transactionId: string
  grossAmount: number
  commissionAmount: number
  paypalFee: number
  netAmount: number
  status: string
  processedAt: string | null
  paypalPayoutId: string | null
  paypalBatchId: string | null
  receiverEmail: string
  transaction?: {
    id: string
    productId: string
    amount: number
    status: string
    createdAt: string
  }
}

interface PayoutData {
  payouts: Payout[]
  stripeTransfers: StripeTransfer[]
  paypalPayouts: PayPalPayout[]
  hasConnectAccount: boolean
  hasPayPalAccount: boolean
}

export default function PayoutHistory({ className }: PayoutHistoryProps) {
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')

  useEffect(() => {
    fetchPayoutHistory()
  }, [])

  const fetchPayoutHistory = async () => {
    try {
      // Fetch Stripe payout data
      const stripeResponse = await fetch('/api/stripe/connect/payout')
      let stripeData = { payouts: [], stripeTransfers: [], hasConnectAccount: false }

      if (stripeResponse.ok) {
        stripeData = await stripeResponse.json()
      }

      // Fetch PayPal payout data
      const paypalResponse = await fetch('/api/paypal/payout')
      let paypalData = { payouts: [], hasPayPalAccount: false }

      if (paypalResponse.ok) {
        paypalData = await paypalResponse.json()
      }

      // Combine data
      const combinedData = {
        payouts: [
          ...stripeData.payouts.map((p: any) => ({ ...p, payoutMethod: 'stripe' })),
          ...paypalData.payouts.map((p: any) => ({ ...p, payoutMethod: 'paypal' }))
        ].sort((a, b) => new Date(b.processedAt || b.createdAt).getTime() - new Date(a.processedAt || a.createdAt).getTime()),
        stripeTransfers: stripeData.stripeTransfers || [],
        paypalPayouts: paypalData.payouts || [],
        hasConnectAccount: stripeData.hasConnectAccount,
        hasPayPalAccount: paypalData.payouts.length > 0
      }

      setPayoutData(combinedData)
    } catch (error) {
      console.error('Error fetching payout history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed':
      case 'reversed':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      processing: 'secondary',
      failed: 'destructive',
      reversed: 'destructive'
    } as const

    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      reversed: 'bg-red-100 text-red-800 border-red-200'
    } as const

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  const filteredPayouts = payoutData?.payouts.filter(payout => {
    if (filter === 'all') return true
    return payout.status === filter
  }) || []

  const totalEarnings = payoutData?.payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.netAmount, 0) || 0

  const pendingEarnings = payoutData?.payouts
    .filter(p => ['pending', 'processing'].includes(p.status))
    .reduce((sum, p) => sum + p.netAmount, 0) || 0

  const totalCommission = payoutData?.payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.commissionAmount, 0) || 0

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!payoutData?.hasConnectAccount) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <ArrowUpRight className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No Payout Account</h3>
              <p className="text-gray-600">Set up your payout account to start receiving earnings</p>
            </div>
            <Button>Set Up Payouts</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">£{totalEarnings.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">£{pendingEarnings.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-gray-700">£{totalCommission.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                Track your earnings and payout status
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All Payouts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('completed')}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('failed')}>
                    Failed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayouts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Payouts Yet</h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? "Your payouts will appear here once you make sales"
                  : `No ${filter} payouts found`
                }
              </p>
            </div>
          ) : (
            <Tabs defaultValue="payouts">
              <TabsList>
                <TabsTrigger value="payouts">All Payouts</TabsTrigger>
                <TabsTrigger value="stripe">Stripe Transfers</TabsTrigger>
                <TabsTrigger value="paypal">PayPal Payouts</TabsTrigger>
              </TabsList>

              <TabsContent value="payouts" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Gross</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            {payout.processedAt
                              ? format(new Date(payout.processedAt), 'MMM dd, yyyy')
                              : format(new Date(), 'MMM dd, yyyy')
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            Transaction #{payout.transactionId.slice(-8)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {payout.payoutMethod === 'paypal' ? (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-blue-600" />
                                <span className="text-xs text-blue-600">PayPal</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3 text-gray-600" />
                                <span className="text-xs text-gray-600">Bank Transfer</span>
                              </div>
                            )}
                            {payout.transaction && (
                              <span className="text-xs text-gray-500">
                                {payout.transaction.productId.slice(-8)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">£{payout.grossAmount.toFixed(2)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Commission: £{payout.commissionAmount.toFixed(2)}</div>
                            {payout.payoutMethod === 'paypal' ? (
                              <div>PayPal: £{(payout.paypalFee || 0.20).toFixed(2)}</div>
                            ) : (
                              <div>Stripe: £{payout.stripeFee.toFixed(2)}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-green-600">
                            £{payout.netAmount.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payout.status)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                View Details
                              </DropdownMenuItem>
                              {payout.stripeTransferId && (
                                <DropdownMenuItem>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View in Stripe
                                </DropdownMenuItem>
                              )}
                              {payout.paypalPayoutId && (
                                <DropdownMenuItem>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View in PayPal
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="stripe" className="mt-4">
                {payoutData.stripeTransfers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No Stripe transfers found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Transfer ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payoutData.stripeTransfers.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell>
                            {format(transfer.created, 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            {transfer.description || 'ClubUp sale payout'}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              £{transfer.amount.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transfer.status)}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {transfer.id}
                            </code>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="paypal" className="mt-4">
                {payoutData.paypalPayouts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No PayPal payouts found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>PayPal ID</TableHead>
                        <TableHead>Recipient</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payoutData.paypalPayouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>
                            {payout.processedAt ? format(new Date(payout.processedAt), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            Transaction #{payout.transactionId.slice(-8)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              £{payout.netAmount.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payout.status)}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {payout.paypalPayoutId || 'N/A'}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {payout.receiverEmail}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
