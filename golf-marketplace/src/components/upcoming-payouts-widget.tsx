"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  DollarSign,
  Calendar,
  Zap,
  RefreshCw,
  TrendingUp,
  ArrowRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, formatDistanceToNow, addHours } from "date-fns"

interface UpcomingPayoutsWidgetProps {
  className?: string
  compact?: boolean
}

interface ScheduledPayout {
  transactionId: string
  productTitle: string
  amount: number
  netAmount: number
  buyerEmail: string
  scheduledAt: string
  productImage?: string
  payoutStatus: 'scheduled' | 'ready' | 'processing' | 'completed' | 'failed'
  deliveryConfirmedAt: string
  timeUntilPayout: string
  estimatedArrival?: string
}

export default function UpcomingPayoutsWidget({ className, compact = false }: UpcomingPayoutsWidgetProps) {
  const [scheduledPayouts, setScheduledPayouts] = useState<ScheduledPayout[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPending, setTotalPending] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchScheduledPayouts()

    // Refresh every 5 minutes to update countdown timers
    const interval = setInterval(fetchScheduledPayouts, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const fetchScheduledPayouts = async () => {
    try {
      // Get transactions with confirmed delivery but scheduled payouts
      const response = await fetch('/api/escrow?status=confirmed&role=seller')
      const data = await response.json()

      if (response.ok && data.success) {
        // Filter and format transactions with scheduled payouts
        const scheduled = data.transactions
          .filter((t: any) => t.paymentHold?.metadata?.payoutScheduledAt)
          .map((t: any) => {
            const scheduledAt = new Date(t.paymentHold.metadata.payoutScheduledAt)
            const now = new Date()
            const isReady = now >= scheduledAt
            const deliveryConfirmed = new Date(t.deliveryConfirmedAt)

            return {
              transactionId: t.id,
              productTitle: t.product.title,
              amount: t.amount,
              netAmount: t.amount - (t.paymentHold?.commissionHeld || 0) - (t.paymentHold?.processingFeeHeld || 0),
              buyerEmail: t.buyerEmail,
              scheduledAt: t.paymentHold.metadata.payoutScheduledAt,
              productImage: t.product.primaryImage,
              payoutStatus: t.paymentHold.metadata.payoutStatus || (isReady ? 'ready' : 'scheduled'),
              deliveryConfirmedAt: t.deliveryConfirmedAt,
              timeUntilPayout: isReady ? 'Ready for processing' : formatDistanceToNow(scheduledAt, { addSuffix: true }),
              estimatedArrival: isReady ? 'Processing next cron run' : format(addHours(scheduledAt, 2), 'MMM dd, HH:mm')
            }
          })
          .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

        setScheduledPayouts(scheduled)
        setTotalPending(scheduled.reduce((sum: number, p: any) => sum + p.netAmount, 0))
      } else {
        console.error('Failed to fetch scheduled payouts:', data.error)
      }
    } catch (error: any) {
      console.error('Error fetching scheduled payouts:', error)
      // Don't show error toast for this widget - it's not critical
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string, timeUntilPayout: string) => {
    if (timeUntilPayout === 'Ready for processing') {
      return {
        icon: <Zap className="w-4 h-4 text-green-600" />,
        text: 'Ready',
        color: 'bg-green-100 text-green-800 border-green-200'
      }
    }

    switch (status) {
      case 'ready':
        return {
          icon: <Zap className="w-4 h-4 text-green-600" />,
          text: 'Ready',
          color: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'scheduled':
        return {
          icon: <Clock className="w-4 h-4 text-blue-600" />,
          text: 'Scheduled',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        }
      case 'processing':
        return {
          icon: <RefreshCw className="w-4 h-4 text-yellow-600" />,
          text: 'Processing',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        }
      default:
        return {
          icon: <Clock className="w-4 h-4 text-gray-600" />,
          text: 'Pending',
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (scheduledPayouts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Payouts
          </CardTitle>
          <CardDescription>
            Automatic payouts scheduled after delivery confirmation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No Scheduled Payouts</h3>
            <p className="text-sm text-gray-600">
              Payouts will appear here 2 hours after buyers confirm delivery
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const readyPayouts = scheduledPayouts.filter(p => p.timeUntilPayout === 'Ready for processing')
  const upcomingPayouts = scheduledPayouts.filter(p => p.timeUntilPayout !== 'Ready for processing')

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Payouts
              {scheduledPayouts.length > 0 && (
                <Badge variant="outline">{scheduledPayouts.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Automatic payouts scheduled after delivery confirmation
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchScheduledPayouts}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">£{totalPending.toFixed(2)}</div>
            <div className="text-sm text-green-800">Total Pending</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{readyPayouts.length}</div>
            <div className="text-sm text-blue-800">Ready Now</div>
          </div>
        </div>

        {/* Ready for Processing */}
        {readyPayouts.length > 0 && (
          <div>
            <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Ready for Processing ({readyPayouts.length})
            </h4>
            <div className="space-y-2">
              {readyPayouts.slice(0, compact ? 2 : 5).map((payout) => {
                const statusInfo = getStatusInfo(payout.payoutStatus, payout.timeUntilPayout)
                return (
                  <div key={payout.transactionId} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    {payout.productImage && (
                      <img
                        src={payout.productImage}
                        alt={payout.productTitle}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{payout.productTitle}</div>
                      <div className="text-xs text-gray-600">
                        Confirmed {format(new Date(payout.deliveryConfirmedAt), 'MMM dd, HH:mm')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">£{payout.netAmount.toFixed(2)}</div>
                      <Badge className={statusInfo.color} variant="outline">
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.text}</span>
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Upcoming Payouts */}
        {upcomingPayouts.length > 0 && (
          <div>
            {readyPayouts.length > 0 && <Separator />}
            <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Scheduled ({upcomingPayouts.length})
            </h4>
            <div className="space-y-2">
              {upcomingPayouts.slice(0, compact ? 3 : 5).map((payout) => {
                const statusInfo = getStatusInfo(payout.payoutStatus, payout.timeUntilPayout)
                return (
                  <div key={payout.transactionId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {payout.productImage && (
                      <img
                        src={payout.productImage}
                        alt={payout.productTitle}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{payout.productTitle}</div>
                      <div className="text-xs text-gray-600">{payout.timeUntilPayout}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">£{payout.netAmount.toFixed(2)}</div>
                      <Badge className={statusInfo.color} variant="outline">
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.text}</span>
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* More items indicator */}
        {scheduledPayouts.length > (compact ? 5 : 10) && (
          <div className="text-center">
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/seller?tab=holds">
                View All {scheduledPayouts.length} Payouts
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900">Automatic Processing</div>
              <div className="text-blue-700">
                Payouts are processed hourly. Ready payouts will be sent to your connected account automatically.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
