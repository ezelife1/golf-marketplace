"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import {
  TrendingUp,
  DollarSign,
  Eye,
  ShoppingCart,
  Package,
  Users,
  Star,
  MessageCircle,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Crown,
  Banknote
} from "lucide-react"
import Link from "next/link"
import PayoutSetupDual from "@/components/payout-setup-dual"
import PayoutHistory from "@/components/payout-history"
import SellerPaymentHolds from "@/components/seller-payment-holds"
import UpcomingPayoutsWidget from "@/components/upcoming-payouts-widget"

interface SellerStats {
  totalRevenue: number
  monthlyRevenue: number
  totalSales: number
  activeListings: number
  totalViews: number
  conversionRate: number
  averageRating: number
  responseRate: number
  revenueGrowth: number
  salesGrowth: number
}

interface ListingData {
  id: string
  title: string
  category: string
  price: number
  condition: string
  status: "active" | "sold" | "draft" | "pending"
  views: number
  watchers: number
  createdAt: string
  image: string
  featured: boolean
  bumpCount: number
}

interface RevenueData {
  month: string
  revenue: number
  sales: number
  commission: number
}

// Mock data - in real app, this would come from your API
const mockStats: SellerStats = {
  totalRevenue: 12450,
  monthlyRevenue: 2380,
  totalSales: 47,
  activeListings: 12,
  totalViews: 8921,
  conversionRate: 3.2,
  averageRating: 4.8,
  responseRate: 94,
  revenueGrowth: 15.4,
  salesGrowth: 8.7
}

const mockListings: ListingData[] = [
  {
    id: "1",
    title: "TaylorMade SIM2 Driver - 10.5° Regular Flex",
    category: "Drivers",
    price: 240,
    condition: "Excellent",
    status: "active",
    views: 127,
    watchers: 8,
    createdAt: "2025-01-05",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=200&h=150&fit=crop",
    featured: true,
    bumpCount: 2
  },
  {
    id: "2",
    title: "Callaway Iron Set 4-PW",
    category: "Irons",
    price: 480,
    condition: "Very Good",
    status: "sold",
    views: 89,
    watchers: 12,
    createdAt: "2024-12-28",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=200&h=150&fit=crop",
    featured: false,
    bumpCount: 1
  },
  // Add more mock listings...
]

const mockRevenueData: RevenueData[] = [
  { month: "Aug", revenue: 1850, sales: 7, commission: 55.50 },
  { month: "Sep", revenue: 2100, sales: 9, commission: 63.00 },
  { month: "Oct", revenue: 1950, sales: 8, commission: 58.50 },
  { month: "Nov", revenue: 2450, sales: 11, commission: 73.50 },
  { month: "Dec", revenue: 2280, sales: 9, commission: 68.40 },
  { month: "Jan", revenue: 2380, sales: 10, commission: 71.40 }
]

export default function SellerDashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<SellerStats>(mockStats)
  const [listings, setListings] = useState<ListingData[]>(mockListings)
  const [revenueData, setRevenueData] = useState<RevenueData[]>(mockRevenueData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API calls
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
              <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
              <p className="text-gray-600 mb-4">Please sign in to access your seller dashboard.</p>
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
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
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
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session.user?.name || "Seller"}</p>
            </div>
            <Button asChild>
              <Link href="/sell/new">
                <Plus className="w-4 h-4 mr-2" />
                New Listing
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">£{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{stats.revenueGrowth}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold">{stats.totalSales}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{stats.salesGrowth}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold">{stats.activeListings}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.totalViews.toLocaleString()} total views
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.averageRating}/5 avg rating
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="holds">Held Payments</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Upcoming Payouts Widget */}
            <UpcomingPayoutsWidget />

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: "sale", item: "TaylorMade Driver", amount: 240, time: "2 hours ago" },
                      { type: "view", item: "Callaway Iron Set", amount: null, time: "5 hours ago" },
                      { type: "message", item: "Question about Putter", amount: null, time: "1 day ago" },
                      { type: "listing", item: "New Golf Bag listed", amount: null, time: "2 days ago" }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === "sale" ? "bg-green-100 text-green-600" :
                            activity.type === "view" ? "bg-blue-100 text-blue-600" :
                            activity.type === "message" ? "bg-yellow-100 text-yellow-600" :
                            "bg-purple-100 text-purple-600"
                          }`}>
                            {activity.type === "sale" && <DollarSign className="w-4 h-4" />}
                            {activity.type === "view" && <Eye className="w-4 h-4" />}
                            {activity.type === "message" && <MessageCircle className="w-4 h-4" />}
                            {activity.type === "listing" && <Package className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{activity.item}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                        {activity.amount && (
                          <Badge variant="outline" className="text-green-600">
                            +£{activity.amount}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" asChild>
                    <Link href="/sell/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Listing
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/featured">
                      <Zap className="w-4 h-4 mr-2" />
                      Boost Listings
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/messages">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      View Messages
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/subscription">
                      <Star className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    const tabsTrigger = document.querySelector('[value="payouts"]') as HTMLElement
                    tabsTrigger?.click()
                  }}>
                    <Banknote className="w-4 h-4 mr-2" />
                    Setup Payouts
                  </Button>

                  {/* Business+ Features */}
                  {session?.user?.subscription && ['business', 'pga-pro'].includes(session.user.subscription) && (
                    <>
                      <hr className="my-2" />
                      <div className="text-xs font-medium text-gray-500 mb-2">PREMIUM FEATURES</div>

                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href={`/storefront/${session.user.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Storefront
                        </Link>
                      </Button>

                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/dashboard/analytics/storefront">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Storefront Analytics
                        </Link>
                      </Button>

                      {session.user.subscription === 'pga-pro' && (
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link href="/pga/branding">
                            <Crown className="w-4 h-4 mr-2" />
                            Custom Branding
                          </Link>
                        </Button>
                      )}

                      <hr className="my-2" />
                      <div className="text-xs font-medium text-gray-500 mb-2">BULK TOOLS</div>

                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/dashboard/bulk/upload">
                          <Package className="w-4 h-4 mr-2" />
                          Bulk Upload
                        </Link>
                      </Button>

                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/dashboard/bulk/manage">
                          <Edit className="w-4 h-4 mr-2" />
                          Mass Edit
                        </Link>
                      </Button>

                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/dashboard/bulk/operations">
                          <Target className="w-4 h-4 mr-2" />
                          Batch Operations
                        </Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.responseRate}%</div>
                    <div className="text-sm text-gray-600">Response Rate</div>
                    <div className="text-xs text-gray-500 mt-1">Reply within 24h</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.averageRating}</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                    <div className="flex justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(stats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                    <div className="text-xs text-gray-500 mt-1">Views to sales</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Listings</CardTitle>
                  <Button asChild>
                    <Link href="/sell/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Listing
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{listing.title}</h3>
                          {listing.featured && (
                            <Badge className="bg-yellow-500 text-white">Featured</Badge>
                          )}
                          <Badge variant="outline" className={
                            listing.status === "active" ? "text-green-600 border-green-600" :
                            listing.status === "sold" ? "text-blue-600 border-blue-600" :
                            listing.status === "draft" ? "text-gray-600 border-gray-600" :
                            "text-yellow-600 border-yellow-600"
                          }>
                            {listing.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{listing.category}</span>
                          <span>•</span>
                          <span>{listing.condition}</span>
                          <span>•</span>
                          <span>{listing.views} views</span>
                          <span>•</span>
                          <span>{listing.watchers} watching</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold">£{listing.price}</div>
                        <div className="text-xs text-gray-500">
                          Listed {new Date(listing.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/products/${listing.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Held Payments Tab */}
          <TabsContent value="holds" className="space-y-6">
            <SellerPaymentHolds />
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PayoutHistory />
              </div>
              <div>
                <PayoutSetupDual />
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Views & Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Views</span>
                      <span className="font-bold">{stats.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Unique Visitors</span>
                      <span className="font-bold">{Math.round(stats.totalViews * 0.7).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Time on Listing</span>
                      <span className="font-bold">2m 34s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Bounce Rate</span>
                      <span className="font-bold">34%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {listings.slice(0, 4).map((listing, index) => (
                      <div key={listing.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{listing.title}</p>
                          <p className="text-xs text-gray-500">{listing.views} views</p>
                        </div>
                        <Badge variant="outline">
                          £{listing.price}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {revenueData.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-primary rounded-t"
                          style={{ height: `${(data.revenue / Math.max(...revenueData.map(d => d.revenue))) * 200}px` }}
                        ></div>
                        <div className="text-xs text-gray-600 mt-2">{data.month}</div>
                        <div className="text-xs font-medium">£{data.revenue}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Gross Revenue</span>
                    <span className="font-bold">£{stats.totalRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fees</span>
                    <span className="text-red-600">-£{(stats.totalRevenue * (session?.user?.subscription === "pro" ? 0.03 : 0.05)).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Processing</span>
                    <span className="text-red-600">-£{(stats.totalRevenue * 0.029).toFixed(0)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Net Revenue</span>
                      <span className="text-green-600">
                        £{(stats.totalRevenue * (session?.user?.subscription === "pro" ? 0.941 : 0.921)).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
