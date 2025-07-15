"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import {
  Crown,
  Award,
  TrendingUp,
  Package,
  BookOpen,
  GraduationCap,
  Palette,
  BarChart3,
  Users,
  Network,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  PoundSterling,
  Target,
  Zap,
  Shield,
  Calendar,
  MessageCircle,
  Settings
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalRevenue: number
  activeListings: number
  totalStudents: number
  totalLessons: number
  totalConnections: number
  totalReferrals: number
  recentActivity: Array<{
    type: string
    description: string
    date: string
  }>
}

export default function PGADashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardStats()
    }
  }, [session])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/pga/dashboard")
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      } else {
        setError(data.error || "Failed to fetch dashboard data")
      }
    } catch (error) {
      setError("Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const QuickStatCard = ({ title, value, icon: Icon, change, color = "text-gray-900" }: {
    title: string
    value: string | number
    icon: any
    change?: string
    color?: string
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {change && (
              <p className="text-xs text-green-600 mt-1">{change}</p>
            )}
          </div>
          <div className="p-3 rounded-full bg-gray-100">
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const FeatureCard = ({ title, description, icon: Icon, href, badge }: {
    title: string
    description: string
    icon: any
    href: string
    badge?: string
  }) => (
    <Card className="hover:shadow-lg transition-shadow group">
      <Link href={href}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            {badge && (
              <Badge className="bg-green-100 text-green-800">{badge}</Badge>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          <div className="flex items-center text-primary group-hover:text-primary/80">
            <span className="text-sm font-medium">Access</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Link>
    </Card>
  )

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-6xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
                Please sign in with your PGA Professional account to access the dashboard.
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <Crown className="w-8 h-8 text-yellow-600" />
                  PGA Professional Dashboard
                </h1>
                <p className="text-xl text-gray-600">
                  Welcome back! Manage your professional golf business.
                </p>
              </div>

              <div className="text-right">
                <Badge className="bg-yellow-100 text-yellow-800 mb-2">
                  <Crown className="w-4 h-4 mr-1" />
                  PGA Verified Professional
                </Badge>
                <p className="text-sm text-gray-600">
                  Access to all professional features
                </p>
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

          {/* Quick Stats */}
          {loading ? (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <QuickStatCard
                title="Total Revenue"
                value={`£${stats.totalRevenue.toLocaleString()}`}
                icon={PoundSterling}
                color="text-green-600"
                change="+12% this month"
              />
              <QuickStatCard
                title="Active Listings"
                value={stats.activeListings}
                icon={Package}
                change="+3 new this week"
              />
              <QuickStatCard
                title="Students Taught"
                value={stats.totalStudents}
                icon={GraduationCap}
                color="text-blue-600"
                change="+5 this month"
              />
              <QuickStatCard
                title="Professional Network"
                value={stats.totalConnections}
                icon={Network}
                color="text-purple-600"
                change="+2 new connections"
              />
            </div>
          ) : null}

          {/* Main Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <FeatureCard
              title="Professional Marketplace"
              description="Access exclusive equipment, early releases, and pro-only deals"
              icon={Crown}
              href="/pga/marketplace"
              badge="Exclusive"
            />

            <FeatureCard
              title="Professional Networking"
              description="Connect with fellow PGA Professionals and build your network"
              icon={Network}
              href="/pga/networking"
              badge="New!"
            />

            <FeatureCard
              title="Lesson Management"
              description="Schedule lessons, manage students, and track progress"
              icon={BookOpen}
              href="/pga/lessons"
            />

            <FeatureCard
              title="Student Discounts"
              description="Create and manage student discount codes"
              icon={GraduationCap}
              href="/pga/student-discounts"
            />

            <FeatureCard
              title="Business Analytics"
              description="Comprehensive insights and performance tracking"
              icon={BarChart3}
              href="/pga/analytics"
            />

            <FeatureCard
              title="Business Branding"
              description="Customize your professional storefront and branding"
              icon={Palette}
              href="/pga/branding"
            />
          </div>

          {/* Recent Activity & Benefits */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentActivity.length ? (
                  <div className="space-y-4">
                    {stats.recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 py-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No recent activity</p>
                    <p className="text-sm text-gray-500">Start using the platform to see your activity here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PGA Pro Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  PGA Pro Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">1% commission rate (vs 5% standard)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Exclusive marketplace access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Professional networking directory</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Student discount management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Lesson booking integration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Business analytics dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Custom branding & white-label tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Priority customer support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <Link href="/sell/new">
                  <Button className="w-full" variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    List Equipment
                  </Button>
                </Link>
                <Link href="/pga/lessons">
                  <Button className="w-full" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Lesson
                  </Button>
                </Link>
                <Link href="/pga/student-discounts">
                  <Button className="w-full" variant="outline">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Create Discount
                  </Button>
                </Link>
                <Link href="/pga/networking">
                  <Button className="w-full" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Find Professionals
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
