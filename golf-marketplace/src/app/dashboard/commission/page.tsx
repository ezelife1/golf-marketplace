"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Info,
  ExternalLink,
  Banknote
} from "lucide-react"
import Link from "next/link"

interface CommissionData {
  overview: {
    currentRate: number
    subscriptionTier: string
    totalEarnings: number
    monthlyEarnings: number
    totalCommissionPaid: number
    monthlyCommissionPaid: number
    salesCount: number
    averageSale: number
    nextPayoutDate: string
    pendingPayout: number
  }
  transactions: Array<{
    id: string
    productTitle: string
    saleAmount: number
    commissionRate: number
    commissionAmount: number
    netEarnings: number
    buyerEmail: string
    status: string
    date: string
    stripeTransferId?: string
  }>
  monthlyData: Array<{
    month: string
    sales: number
    grossRevenue: number
    commission: number
    netEarnings: number
  }>
}

// Mock data - in production this would come from API
const mockCommissionData: CommissionData = {
  overview: {
    currentRate: 3,
    subscriptionTier: 'pro',
    totalEarnings: 8745.50,
    monthlyEarnings: 1290.75,
    totalCommissionPaid: 262.37,
    monthlyCommissionPaid: 38.72,
    salesCount: 23,
    averageSale: 380.24,
    nextPayoutDate: '2025-01-15',
    pendingPayout: 1290.75
  },
  transactions: [
    {
      id: 'txn_001',
      productTitle: 'TaylorMade SIM2 Driver',
      saleAmount: 240.00,
      commissionRate: 3,
      commissionAmount: 7.20,
      netEarnings: 232.80,
      buyerEmail: 'buyer@email.com',
      status: 'completed',
      date: '2025-01-13',
      stripeTransferId: 'tr_1234567890'
    },
    {
      id: 'txn_002',
      productTitle: 'Callaway Apex Iron Set',
      saleAmount: 480.00,
      commissionRate: 3,
      commissionAmount: 14.40,
      netEarnings: 465.60,
      buyerEmail: 'another@email.com',
      status: 'completed',
      date: '2025-01-11',
      stripeTransferId: 'tr_0987654321'
    },
    {
      id: 'txn_003',
      productTitle: 'Scotty Cameron Putter',
      saleAmount: 360.00,
      commissionRate: 3,
      commissionAmount: 10.80,
      netEarnings: 349.20,
      buyerEmail: 'golf@email.com',
      status: 'pending',
      date: '2025-01-10'
    }
  ],
  monthlyData: [
    { month: 'Aug', sales: 5, grossRevenue: 1200, commission: 36, netEarnings: 1164 },
    { month: 'Sep', sales: 3, grossRevenue: 890, commission: 26.70, netEarnings: 863.30 },
    { month: 'Oct', sales: 7, grossRevenue: 1750, commission: 52.50, netEarnings: 1697.50 },
    { month: 'Nov', sales: 4, grossRevenue: 920, commission: 27.60, netEarnings: 892.40 },
    { month: 'Dec', sales: 6, grossRevenue: 1485, commission: 44.55, netEarnings: 1440.45 },
    { month: 'Jan', sales: 3, grossRevenue: 1080, commission: 32.40, netEarnings: 1047.60 }
  ]
}

const COMMISSION_RATES = {
  free: { rate: 5, label: 'Free' },
  pro: { rate: 3, label: 'Pro' },
  business: { rate: 3, label: 'Business' },
  'pga-pro': { rate: 1, label: 'PGA Pro' }
}

export default function CommissionDashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<CommissionData>(mockCommissionData)
  const [dateRange, setDateRange] = useState("6m")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-gray-600 mb-4">Please sign in to view your commission dashboard.</p>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-7xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const currentTier = COMMISSION_RATES[data.overview.subscriptionTier as keyof typeof COMMISSION_RATES]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Commission Dashboard</h1>
                <p className="text-xl text-gray-600">Track your earnings and commission rates</p>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-blue-100 text-blue-800">
                  <Crown className="w-3 h-3 mr-1" />
                  {currentTier?.label} - {currentTier?.rate}% Commission
                </Badge>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">Last Month</SelectItem>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold">£{data.overview.totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +£{data.overview.monthlyEarnings} this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Commission Paid</p>
                    <p className="text-2xl font-bold">£{data.overview.totalCommissionPaid.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 flex items-center mt-1">
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                      £{data.overview.monthlyCommissionPaid.toFixed(2)} this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sales Count</p>
                    <p className="text-2xl font-bold">{data.overview.salesCount}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Avg: £{data.overview.averageSale.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payout</p>
                    <p className="text-2xl font-bold">£{data.overview.pendingPayout.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Next: {new Date(data.overview.nextPayoutDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="rates">Commission Rates</TabsTrigger>
            </TabsList>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-4 font-medium">Product</th>
                          <th className="text-left p-4 font-medium">Sale Amount</th>
                          <th className="text-left p-4 font-medium">Commission</th>
                          <th className="text-left p-4 font-medium">Net Earnings</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Date</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.transactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="font-medium">{transaction.productTitle}</div>
                              <div className="text-sm text-gray-500">{transaction.buyerEmail}</div>
                            </td>
                            <td className="p-4 font-medium">£{transaction.saleAmount.toFixed(2)}</td>
                            <td className="p-4">
                              <div className="text-red-600">-£{transaction.commissionAmount.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">({transaction.commissionRate}%)</div>
                            </td>
                            <td className="p-4 font-medium text-green-600">
                              £{transaction.netEarnings.toFixed(2)}
                            </td>
                            <td className="p-4">
                              <Badge className={
                                transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {transaction.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                {transaction.stripeTransferId && (
                                  <Button size="sm" variant="outline">
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Earnings Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {data.monthlyData.map((month, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-green-500 rounded-t"
                            style={{
                              height: `${(month.netEarnings / Math.max(...data.monthlyData.map(d => d.netEarnings))) * 200}px`
                            }}
                          ></div>
                          <div className="text-xs text-gray-600 mt-2">{month.month}</div>
                          <div className="text-xs font-medium">£{month.netEarnings.toFixed(0)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Commission Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.monthlyData.slice(-3).map((month, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{month.month} 2025</div>
                            <div className="text-sm text-gray-600">{month.sales} sales</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">£{month.netEarnings.toFixed(2)}</div>
                            <div className="text-sm text-red-600">-£{month.commission.toFixed(2)} commission</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Commission Rates Tab */}
            <TabsContent value="rates">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Commission Rate Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(COMMISSION_RATES).map(([tier, info]) => (
                        <div key={tier} className={`p-4 rounded-lg border-2 ${
                          tier === data.overview.subscriptionTier ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                {info.label}
                                {tier === data.overview.subscriptionTier && (
                                  <Badge className="bg-blue-600 text-white">Current</Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {tier === 'free' && 'Basic marketplace access'}
                                {tier === 'pro' && 'Enhanced listings and priority support'}
                                {tier === 'business' && 'Premium storefront and bulk tools'}
                                {tier === 'pga-pro' && 'Lowest rates for verified professionals'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{info.rate}%</div>
                              <div className="text-sm text-gray-600">commission</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Savings Calculator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Your Current Rate: {currentTier?.rate}%</h4>
                        <div className="text-sm text-green-700">
                          On £1,000 in sales, you pay £{(1000 * (currentTier?.rate || 0) / 100).toFixed(2)} in commission
                        </div>
                      </div>

                      {data.overview.subscriptionTier !== 'pga-pro' && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">
                            {data.overview.subscriptionTier === 'free' ? 'Upgrade to Pro' : 'Upgrade to PGA Pro'}
                          </h4>
                          <div className="text-sm text-blue-700 mb-3">
                            {data.overview.subscriptionTier === 'free'
                              ? 'Save 2% on every sale with Pro membership'
                              : 'Save an additional 2% with PGA Pro verification'
                            }
                          </div>
                          <Button size="sm" asChild>
                            <Link href="/subscription">
                              Upgrade Now
                            </Link>
                          </Button>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        <Info className="w-4 h-4 inline mr-1" />
                        Commission rates are automatically applied based on your subscription tier.
                        Payouts are processed weekly to your connected bank account.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
