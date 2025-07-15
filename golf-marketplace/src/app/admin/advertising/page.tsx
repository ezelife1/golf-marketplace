"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import {
  TrendingUp,
  Eye,
  MousePointer,
  DollarSign,
  Calendar,
  Target,
  BarChart3,
  Users,
  Globe,
  Mail,
  Image,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

interface Advertisement {
  id: string
  title: string
  company: string
  adType: "banner" | "sponsored_listing" | "category_sponsor" | "newsletter" | "event"
  placement: string[]
  status: "active" | "paused" | "scheduled" | "ended"
  budget: number
  spent: number
  impressions: number
  clicks: number
  ctr: number
  startDate: string
  endDate: string
  targetAudience: {
    demographics: string[]
    interests: string[]
    location: string[]
  }
  creative: {
    headline: string
    description: string
    imageUrl: string
    ctaText: string
    landingUrl: string
  }
}

interface AdStats {
  totalRevenue: number
  activeAds: number
  totalImpressions: number
  averageCTR: number
  topPerformers: Advertisement[]
}

// Mock data - in real app, this would come from your API
const mockAds: Advertisement[] = [
  {
    id: "1",
    title: "TaylorMade Summer Campaign",
    company: "TaylorMade Golf",
    adType: "banner",
    placement: ["homepage", "product_pages", "search_results"],
    status: "active",
    budget: 5000,
    spent: 3240,
    impressions: 125000,
    clicks: 1890,
    ctr: 1.51,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    targetAudience: {
      demographics: ["Male 25-55", "High Income"],
      interests: ["Golf Equipment", "Drivers", "Premium Brands"],
      location: ["UK", "Ireland"]
    },
    creative: {
      headline: "New SIM2 Driver - Revolutionary Performance",
      description: "Experience the future of golf with our latest technology",
      imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=300&fit=crop",
      ctaText: "Shop TaylorMade",
      landingUrl: "https://taylormade.com/uk"
    }
  },
  {
    id: "2",
    title: "Callaway Iron Promotion",
    company: "Callaway Golf",
    adType: "sponsored_listing",
    placement: ["search_results", "category_irons"],
    status: "active",
    budget: 2500,
    spent: 1850,
    impressions: 45000,
    clicks: 892,
    ctr: 1.98,
    startDate: "2025-01-10",
    endDate: "2025-02-10",
    targetAudience: {
      demographics: ["All Golfers"],
      interests: ["Irons", "Mid-Range Pricing"],
      location: ["UK"]
    },
    creative: {
      headline: "Apex Irons - Tour Performance",
      description: "Feel the difference with forged precision",
      imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=300&fit=crop",
      ctaText: "Learn More",
      landingUrl: "https://callaway.com/uk"
    }
  }
]

const mockStats: AdStats = {
  totalRevenue: 18450,
  activeAds: 8,
  totalImpressions: 890000,
  averageCTR: 1.73,
  topPerformers: mockAds.slice(0, 3)
}

const adTypes = [
  { value: "banner", label: "Banner Advertisement", price: "£2-8 per 1000 impressions" },
  { value: "sponsored_listing", label: "Sponsored Product Listing", price: "£15-50 per day" },
  { value: "category_sponsor", label: "Category Sponsorship", price: "£200-800 per month" },
  { value: "newsletter", label: "Newsletter Advertisement", price: "£100-400 per send" },
  { value: "event", label: "Event Sponsorship", price: "£500-2000 per event" }
]

const placements = [
  "homepage", "search_results", "product_pages", "category_pages",
  "user_profiles", "checkout", "newsletter", "mobile_app"
]

export default function AdvertisingDashboard() {
  const { data: session } = useSession()
  const [ads, setAds] = useState<Advertisement[]>(mockAds)
  const [stats, setStats] = useState<AdStats>(mockStats)
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = (adId: string, newStatus: Advertisement['status']) => {
    setAds(prev => prev.map(ad =>
      ad.id === adId ? { ...ad, status: newStatus } : ad
    ))
  }

  const handleDeleteAd = (adId: string) => {
    setAds(prev => prev.filter(ad => ad.id !== adId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Advertising Dashboard</h1>
              <p className="text-gray-600">Manage golf business advertisements and partnerships</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Advertisement
            </Button>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ad Revenue</p>
                  <p className="text-2xl font-bold text-green-600">£{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +23% this month
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
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold">{stats.activeAds}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    6 scheduled to start
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                  <p className="text-2xl font-bold">{(stats.totalImpressions / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500 mt-1">
                    This month
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average CTR</p>
                  <p className="text-2xl font-bold">{stats.averageCTR}%</p>
                  <p className="text-xs text-green-600 mt-1">
                    Above industry average
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <MousePointer className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="inventory">Ad Inventory</TabsTrigger>
            <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
          </TabsList>

          {/* Active Campaigns */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <div key={ad.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{ad.title}</h3>
                            <Badge
                              variant={
                                ad.status === 'active' ? 'default' :
                                ad.status === 'paused' ? 'secondary' :
                                ad.status === 'scheduled' ? 'outline' :
                                'destructive'
                              }
                            >
                              {ad.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {ad.adType.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{ad.company}</p>
                          <p className="text-sm text-gray-500">{ad.creative.headline}</p>
                        </div>

                        <div className="flex gap-2">
                          {ad.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(ad.id, 'paused')}
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(ad.id, 'active')}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAd(ad.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">£{ad.spent}</div>
                          <div className="text-xs text-gray-500">Spent / £{ad.budget}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{ad.impressions.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Impressions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{ad.clicks.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{ad.ctr}%</div>
                          <div className="text-xs text-gray-500">CTR</div>
                        </div>
                      </div>

                      {/* Campaign Preview */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={ad.creative.imageUrl}
                            alt={ad.creative.headline}
                            className="w-20 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{ad.creative.headline}</h4>
                            <p className="text-xs text-gray-600">{ad.creative.description}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            {ad.creative.ctaText}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                        <span>Placements: {ad.placement.join(', ')}</span>
                        <span>•</span>
                        <span>Runs: {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <BarChart3 className="w-8 h-8 mr-2" />
                    Revenue chart would go here
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Ads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topPerformers.map((ad, index) => (
                      <div key={ad.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{ad.title}</p>
                          <p className="text-xs text-gray-500">{ad.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{ad.ctr}%</p>
                          <p className="text-xs text-gray-500">CTR</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ad Inventory */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Ad Placements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adTypes.map((type) => (
                    <div key={type.value} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold mb-2">{type.label}</h3>
                      <p className="text-sm text-gray-600 mb-3">{type.price}</p>
                      <div className="space-y-2 text-xs text-gray-500">
                        {type.value === 'banner' && (
                          <>
                            <div>• Homepage banner (top fold)</div>
                            <div>• Search results sidebar</div>
                            <div>• Product page footer</div>
                          </>
                        )}
                        {type.value === 'sponsored_listing' && (
                          <>
                            <div>• Featured in search results</div>
                            <div>• Category page highlights</div>
                            <div>• Related products section</div>
                          </>
                        )}
                        {type.value === 'category_sponsor' && (
                          <>
                            <div>• Category page branding</div>
                            <div>• Filter section sponsorship</div>
                            <div>• Exclusive positioning</div>
                          </>
                        )}
                      </div>
                      <Button size="sm" className="w-full mt-3">
                        Reserve Placement
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partnerships */}
          <TabsContent value="partnerships" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Partnerships</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Partner with Golf Brands</h3>
                  <p className="text-gray-500 mb-6">
                    Exclusive partnership opportunities with premium golf equipment manufacturers
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Exclusive Access</h4>
                      <p className="text-sm text-gray-600">Partner brands get priority placement and exclusive features</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Custom Integration</h4>
                      <p className="text-sm text-gray-600">Branded experiences and custom landing pages</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Performance Analytics</h4>
                      <p className="text-sm text-gray-600">Detailed reporting and ROI tracking</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
