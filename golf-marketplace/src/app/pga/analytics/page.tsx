"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PoundSterling,
  Users,
  Package,
  BookOpen,
  GraduationCap,
  Eye,
  Heart,
  Star,
  Calendar,
  Crown,
  AlertCircle,
  Download,
  RefreshCw,
  Target,
  Award,
  Activity
} from "lucide-react"
import Link from "next/link"

interface AnalyticsData {
  summary: {
    totalRevenue: number
    netRevenue: number
    totalCommission: number
    activeListings: number
    soldItems: number
    totalViews: number
    totalFavorites: number
    totalLessons: number
    completedLessons: number
    totalStudents: number
    lessonRevenue: number
    totalDiscounts: number
    totalDiscountUsage: number
    totalStudentSavings: number
    uniqueCustomers: number
    studentCustomers: number
  }
  chartData: Array<{
    period: string
    revenue: number
    lessons: number
    discountUsage: number
    date: string
  }>
  topProducts: Array<{
    id: string
    title: string
    price: number
    category: string
    views: number
    favorites: number
    sales: number
    score: number
  }>
  recentActivity: Array<{
    id: string
    type: string
    customer: string
    amount: number
    date: string
    isStudent: boolean
  }>
}

const PERIOD_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 3 months" },
  { value: "365", label: "Last year" }
]

export default function PGAAnalyticsPage() {
  const { data: session, status } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [error, setError] = useState("")

  const fetchAnalytics = useCallback(async (period = "30") => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pga/analytics?period=${period}`)
      const data = await response.json()

      if (response.ok) {
        setAnalytics(data)
      } else {
        setError(data.error || "Failed to fetch analytics")
      }
    } catch (error) {
      setError("Failed to fetch analytics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchAnalytics(selectedPeriod)
    }
  }, [session, selectedPeriod, fetchAnalytics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return "0%"
    return `${Math.round((value / total) * 100)}%`
  }

  const StatCard = ({ title, value, icon: Icon, change, color = "text-gray-900" }: {
    title: string
    value: string | number
    icon: any
    change?: { value: number; positive: boolean }
    color?: string
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {change && (
              <div className={`flex items-center mt-1 text-sm ${
                change.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.positive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(change.value)}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-gray-100`}>
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-6xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">PGA Pro Access Required</h2>
              <p className="text-gray-600 mb-4">
                Please sign in with your PGA Professional account to view analytics.
              </p>
              <Link href="/auth/signin">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/pga/dashboard" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to PGA Dashboard
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  Business Analytics
                </h1>
                <p className="text-xl text-gray-600">
                  Comprehensive insights into your professional golf business
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => fetchAnalytics(selectedPeriod)}
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>

                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : analytics ? (
            <>
              {/* Key Metrics */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(analytics.summary.totalRevenue)}
                  icon={PoundSterling}
                  color="text-green-600"
                />
                <StatCard
                  title="Net Revenue"
                  value={formatCurrency(analytics.summary.netRevenue)}
                  icon={TrendingUp}
                  color="text-green-600"
                />
                <StatCard
                  title="Active Listings"
                  value={analytics.summary.activeListings}
                  icon={Package}
                />
                <StatCard
                  title="Items Sold"
                  value={analytics.summary.soldItems}
                  icon={Target}
                />
              </div>

              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Views"
                  value={analytics.summary.totalViews.toLocaleString()}
                  icon={Eye}
                />
                <StatCard
                  title="Favorites"
                  value={analytics.summary.totalFavorites}
                  icon={Heart}
                />
                <StatCard
                  title="Lessons Taught"
                  value={analytics.summary.totalLessons}
                  icon={BookOpen}
                />
                <StatCard
                  title="Students Taught"
                  value={analytics.summary.totalStudents}
                  icon={GraduationCap}
                />
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="lessons">Lessons</TabsTrigger>
                  <TabsTrigger value="customers">Customers</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analytics.chartData.map((data, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{data.period}</span>
                              <span className="font-medium">{formatCurrency(data.revenue)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Performance Indicators */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Commission Paid</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(analytics.summary.totalCommission)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Lesson Revenue</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(analytics.summary.lessonRevenue)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Student Savings</span>
                          <span className="font-medium text-blue-600">
                            {formatCurrency(analytics.summary.totalStudentSavings)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Conversion Rate</span>
                          <span className="font-medium">
                            {formatPercentage(analytics.summary.soldItems, analytics.summary.activeListings)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <PoundSterling className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  Sale to {activity.customer}
                                  {activity.isStudent && (
                                    <Badge className="ml-2 bg-blue-100 text-blue-800">
                                      <GraduationCap className="w-3 h-3 mr-1" />
                                      Student
                                    </Badge>
                                  )}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(activity.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className="font-medium text-green-600">
                              {formatCurrency(activity.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products" className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{analytics.summary.activeListings}</div>
                        <div className="text-sm text-gray-600">Active Listings</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6 text-center">
                        <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{analytics.summary.soldItems}</div>
                        <div className="text-sm text-gray-600">Items Sold</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6 text-center">
                        <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{analytics.summary.totalViews.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Views</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.topProducts.map((product, index) => (
                          <div key={product.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm">
                                #{index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{product.title}</p>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <span>{product.category}</span>
                                  <span>•</span>
                                  <span>{formatCurrency(product.price)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{product.views}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  <span>{product.favorites}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  <span>{product.sales}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Lessons Tab */}
                <TabsContent value="lessons" className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-6 mb-6">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{analytics.summary.totalLessons}</div>
                        <div className="text-sm text-gray-600">Total Lessons</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6 text-center">
                        <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{analytics.summary.completedLessons}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6 text-center">
                        <GraduationCap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{analytics.summary.totalStudents}</div>
                        <div className="text-sm text-gray-600">Students Taught</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6 text-center">
                        <PoundSterling className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{formatCurrency(analytics.summary.lessonRevenue)}</div>
                        <div className="text-sm text-gray-600">Lesson Revenue</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Lesson Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Completion Rate</span>
                          <span className="font-medium">
                            {formatPercentage(analytics.summary.completedLessons, analytics.summary.totalLessons)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Average Revenue per Lesson</span>
                          <span className="font-medium">
                            {analytics.summary.totalLessons > 0
                              ? formatCurrency(analytics.summary.lessonRevenue / analytics.summary.totalLessons)
                              : formatCurrency(0)
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Students per Lesson</span>
                          <span className="font-medium">
                            {analytics.summary.totalLessons > 0
                              ? (analytics.summary.totalStudents / analytics.summary.totalLessons).toFixed(1)
                              : "0"
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Customers Tab */}
                <TabsContent value="customers" className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{analytics.summary.uniqueCustomers}</div>
                        <div className="text-sm text-gray-600">Unique Customers</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6 text-center">
                        <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{analytics.summary.studentCustomers}</div>
                        <div className="text-sm text-gray-600">Student Customers</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6 text-center">
                        <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{analytics.summary.totalDiscountUsage}</div>
                        <div className="text-sm text-gray-600">Discount Uses</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Student Discount Impact</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Active Discounts</span>
                          <span className="font-medium">{analytics.summary.totalDiscounts}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Usage</span>
                          <span className="font-medium">{analytics.summary.totalDiscountUsage}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Student Savings</span>
                          <span className="font-medium text-blue-600">
                            {formatCurrency(analytics.summary.totalStudentSavings)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Student Customer Rate</span>
                          <span className="font-medium">
                            {formatPercentage(analytics.summary.studentCustomers, analytics.summary.uniqueCustomers)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Customer Insights</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Average Order Value</span>
                          <span className="font-medium">
                            {analytics.summary.uniqueCustomers > 0
                              ? formatCurrency(analytics.summary.totalRevenue / analytics.summary.uniqueCustomers)
                              : formatCurrency(0)
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Revenue per Customer</span>
                          <span className="font-medium">
                            {analytics.summary.uniqueCustomers > 0
                              ? formatCurrency(analytics.summary.netRevenue / analytics.summary.uniqueCustomers)
                              : formatCurrency(0)
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Items per Customer</span>
                          <span className="font-medium">
                            {analytics.summary.uniqueCustomers > 0
                              ? (analytics.summary.soldItems / analytics.summary.uniqueCustomers).toFixed(1)
                              : "0"
                            }
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Analytics Data</h3>
                <p className="text-gray-600 mb-6">
                  Start selling equipment and teaching lessons to see your analytics data.
                </p>
                <Button asChild>
                  <Link href="/sell/new">Create Your First Listing</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
