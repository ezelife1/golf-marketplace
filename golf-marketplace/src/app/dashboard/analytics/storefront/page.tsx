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
  ArrowLeft,
  TrendingUp,
  Users,
  Eye,
  Globe,
  MousePointer,
  Clock,
  Star,
  MessageCircle,
  Heart,
  Share2,
  Crown,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  RefreshCw,
  Download,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

interface StorefrontAnalytics {
  overview: {
    totalVisitors: number
    uniqueVisitors: number
    pageViews: number
    averageSessionDuration: string
    bounceRate: number
    conversionRate: number
    contactRate: number
    socialClicks: number
  }
  traffic: {
    sources: Array<{
      source: string
      visitors: number
      percentage: number
    }>
    devices: Array<{
      device: string
      visitors: number
      percentage: number
    }>
    locations: Array<{
      location: string
      visitors: number
      percentage: number
    }>
  }
  engagement: {
    timeOnPage: Array<{
      date: string
      averageTime: number
    }>
    popularProducts: Array<{
      id: string
      title: string
      views: number
      clicks: number
      inquiries: number
    }>
    contactMethods: Array<{
      method: string
      uses: number
      percentage: number
    }>
  }
  conversion: {
    funnelData: Array<{
      step: string
      visitors: number
      dropOffRate: number
    }>
    inquiryConversion: Array<{
      date: string
      inquiries: number
      conversions: number
      rate: number
    }>
  }
}

// Mock analytics data
const mockAnalytics: StorefrontAnalytics = {
  overview: {
    totalVisitors: 2847,
    uniqueVisitors: 2234,
    pageViews: 4521,
    averageSessionDuration: "3m 42s",
    bounceRate: 34.2,
    conversionRate: 8.7,
    contactRate: 12.3,
    socialClicks: 156
  },
  traffic: {
    sources: [
      { source: "Direct", visitors: 1289, percentage: 45.3 },
      { source: "Google Search", visitors: 876, percentage: 30.8 },
      { source: "Social Media", visitors: 423, percentage: 14.9 },
      { source: "Referrals", visitors: 259, percentage: 9.1 }
    ],
    devices: [
      { device: "Desktop", visitors: 1708, percentage: 60.0 },
      { device: "Mobile", visitors: 968, percentage: 34.0 },
      { device: "Tablet", visitors: 171, percentage: 6.0 }
    ],
    locations: [
      { location: "London", visitors: 654, percentage: 23.0 },
      { location: "Birmingham", visitors: 398, percentage: 14.0 },
      { location: "Manchester", visitors: 342, percentage: 12.0 },
      { location: "Surrey", visitors: 285, percentage: 10.0 },
      { location: "Other", visitors: 1168, percentage: 41.0 }
    ]
  },
  engagement: {
    timeOnPage: [
      { date: "2025-01-07", averageTime: 198 },
      { date: "2025-01-08", averageTime: 234 },
      { date: "2025-01-09", averageTime: 187 },
      { date: "2025-01-10", averageTime: 267 },
      { date: "2025-01-11", averageTime: 298 },
      { date: "2025-01-12", averageTime: 245 },
      { date: "2025-01-13", averageTime: 222 }
    ],
    popularProducts: [
      { id: "1", title: "TaylorMade SIM2 Driver", views: 234, clicks: 89, inquiries: 12 },
      { id: "2", title: "Callaway Apex Iron Set", views: 189, clicks: 67, inquiries: 8 },
      { id: "3", title: "Scotty Cameron Putter", views: 156, clicks: 45, inquiries: 15 },
      { id: "4", title: "Ping G425 Driver", views: 134, clicks: 38, inquiries: 6 }
    ],
    contactMethods: [
      { method: "Contact Form", uses: 67, percentage: 54.5 },
      { method: "Phone", uses: 32, percentage: 26.0 },
      { method: "Email", uses: 18, percentage: 14.6 },
      { method: "Social Media", uses: 6, percentage: 4.9 }
    ]
  },
  conversion: {
    funnelData: [
      { step: "Storefront View", visitors: 2847, dropOffRate: 0 },
      { step: "Product View", visitors: 1876, dropOffRate: 34.1 },
      { step: "Contact Interest", visitors: 456, dropOffRate: 75.7 },
      { step: "Inquiry Sent", visitors: 247, dropOffRate: 45.8 },
      { step: "Sale Completed", visitors: 89, dropOffRate: 64.0 }
    ],
    inquiryConversion: [
      { date: "2025-01-07", inquiries: 34, conversions: 12, rate: 35.3 },
      { date: "2025-01-08", inquiries: 28, conversions: 9, rate: 32.1 },
      { date: "2025-01-09", inquiries: 42, conversions: 18, rate: 42.9 },
      { date: "2025-01-10", inquiries: 36, conversions: 11, rate: 30.6 },
      { date: "2025-01-11", inquiries: 39, conversions: 15, rate: 38.5 },
      { date: "2025-01-12", inquiries: 31, conversions: 13, rate: 41.9 },
      { date: "2025-01-13", inquiries: 37, conversions: 11, rate: 29.7 }
    ]
  }
}

export default function StorefrontAnalyticsPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<StorefrontAnalytics>(mockAnalytics)
  const [dateRange, setDateRange] = useState("7d")
  const [loading, setLoading] = useState(true)

  // Check if user has access to advanced analytics
  const hasAccess = session?.user?.subscription &&
    ['business', 'pga-pro'].includes(session.user.subscription)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-gray-600 mb-4">Please sign in to access storefront analytics.</p>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Business+ Access Required</h2>
              <p className="text-gray-600 mb-4">
                Advanced storefront analytics are available for Business and PGA Pro subscribers.
              </p>
              <Button asChild>
                <Link href="/subscription">Upgrade Now</Link>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard/seller" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  Storefront Analytics
                </h1>
                <p className="text-xl text-gray-600">
                  Detailed insights into your premium storefront performance
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>

                <Button asChild>
                  <Link href={`/storefront/${session.user?.id}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Storefront
                  </Link>
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
                    <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                    <p className="text-2xl font-bold">{analytics.overview.totalVisitors.toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12.5% vs last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Page Views</p>
                    <p className="text-2xl font-bold">{analytics.overview.pageViews.toLocaleString()}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8.2% vs last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contact Rate</p>
                    <p className="text-2xl font-bold">{analytics.overview.contactRate}%</p>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +2.1% vs last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                    <p className="text-2xl font-bold">{analytics.overview.averageSessionDuration}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +15.3% vs last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="traffic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="conversion">Conversion</TabsTrigger>
              <TabsTrigger value="products">Popular Products</TabsTrigger>
            </TabsList>

            {/* Traffic Sources Tab */}
            <TabsContent value="traffic" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Traffic Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.traffic.sources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{source.source}</span>
                              <span className="text-sm text-gray-600">{source.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${source.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="ml-4 text-sm font-medium">{source.visitors}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Device Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.traffic.devices.map((device, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{device.device}</span>
                              <span className="text-sm text-gray-600">{device.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${device.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="ml-4 text-sm font-medium">{device.visitors}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.traffic.locations.map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{location.location}</span>
                              <span className="text-sm text-gray-600">{location.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${location.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="ml-4 text-sm font-medium">{location.visitors}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Time on Page Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {analytics.engagement.timeOnPage.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-blue-500 rounded-t"
                            style={{
                              height: `${(data.averageTime / Math.max(...analytics.engagement.timeOnPage.map(d => d.averageTime))) * 200}px`
                            }}
                          ></div>
                          <div className="text-xs text-gray-600 mt-2">{new Date(data.date).toLocaleDateString('en-GB', { weekday: 'short' })}</div>
                          <div className="text-xs font-medium">{formatDuration(data.averageTime)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.engagement.contactMethods.map((method, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{method.method}</span>
                              <span className="text-sm text-gray-600">{method.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{ width: `${method.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="ml-4 text-sm font-medium">{method.uses}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Conversion Tab */}
            <TabsContent value="conversion" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.conversion.funnelData.map((step, index) => (
                        <div key={index} className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{step.step}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{step.visitors}</span>
                              {index > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  -{step.dropOffRate}%
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded h-3">
                            <div
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded"
                              style={{
                                width: `${(step.visitors / analytics.conversion.funnelData[0].visitors) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Inquiry Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-1">
                      {analytics.conversion.inquiryConversion.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-green-500 rounded-t"
                            style={{
                              height: `${(data.rate / Math.max(...analytics.conversion.inquiryConversion.map(d => d.rate))) * 180}px`
                            }}
                          ></div>
                          <div className="text-xs text-gray-600 mt-2">{new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric' })}</div>
                          <div className="text-xs font-medium">{data.rate}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Popular Products Tab */}
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-4 font-medium">Product</th>
                          <th className="text-left p-4 font-medium">Views</th>
                          <th className="text-left p-4 font-medium">Clicks</th>
                          <th className="text-left p-4 font-medium">Inquiries</th>
                          <th className="text-left p-4 font-medium">Conversion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.engagement.popularProducts.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="font-medium">{product.title}</div>
                            </td>
                            <td className="p-4">{product.views}</td>
                            <td className="p-4">{product.clicks}</td>
                            <td className="p-4">{product.inquiries}</td>
                            <td className="p-4">
                              <Badge className="bg-green-100 text-green-800">
                                {((product.inquiries / product.views) * 100).toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
