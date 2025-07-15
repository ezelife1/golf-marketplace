"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import {
  Crown,
  Star,
  Search,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Zap,
  Calendar,
  Award,
  Shield,
  TrendingUp,
  Package,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  PoundSterling,
  MapPin,
  Clock,
  Sparkles
} from "lucide-react"
import Link from "next/link"

interface ProMarketplaceItem {
  id: string
  category: string
  priority: number
  isProExclusive: boolean
  earlyAccess: boolean
  proPrice?: number
  product: {
    id: string
    title: string
    description: string
    brand?: string
    condition: string
    price: number
    originalPrice?: number
    primaryImage?: string
    location?: string
    createdAt: string
    seller: {
      id: string
      name: string
      pgaVerified: boolean
      rating?: number
      businessBranding?: {
        businessName?: string
        logoUrl?: string
      }
    }
    category: {
      name: string
      slug: string
    }
    stats: {
      views: number
      favorites: number
      reviews: number
    }
  }
}

interface MarketplaceStats {
  totalItems: number
  earlyAccessItems: number
  demoItems: number
  newReleases: number
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "demo", label: "Demo Equipment" },
  { value: "new_release", label: "New Releases" },
  { value: "professional_only", label: "Pro Exclusive" }
]

const BRANDS = [
  "TaylorMade", "Callaway", "Titleist", "PING", "Mizuno", "Cobra", "Wilson",
  "Srixon", "Bridgestone", "Cleveland", "Scotty Cameron", "Odyssey"
]

export default function PGAMarketplacePage() {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<ProMarketplaceItem[]>([])
  const [stats, setStats] = useState<MarketplaceStats>({
    totalItems: 0,
    earlyAccessItems: 0,
    demoItems: 0,
    newReleases: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedBrand, setSelectedBrand] = useState("all")
  const [earlyAccessOnly, setEarlyAccessOnly] = useState(false)
  const [sortBy, setSortBy] = useState("priority")
  const [error, setError] = useState("")

  const fetchMarketplaceItems = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(selectedBrand !== "all" && { brand: selectedBrand }),
        ...(earlyAccessOnly && { earlyAccess: "true" })
      })

      const response = await fetch(`/api/pga/marketplace?${params}`)
      const data = await response.json()

      if (response.ok) {
        setItems(data.items)
        setStats(data.stats)
      } else {
        setError(data.error || "Failed to fetch marketplace items")
      }
    } catch (error) {
      setError("Failed to fetch marketplace items")
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedBrand, earlyAccessOnly])

  useEffect(() => {
    if (session?.user?.id) {
      fetchMarketplaceItems()
    }
  }, [session, fetchMarketplaceItems])

  const filteredItems = items.filter(item =>
    item.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatPrice = (item: ProMarketplaceItem) => {
    const hasProPrice = item.proPrice && item.proPrice < item.product.price

    return (
      <div className="flex flex-col items-end">
        {hasProPrice && (
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-600" />
            <span className="text-lg font-bold text-yellow-600">
              £{item.proPrice}
            </span>
          </div>
        )}
        <div className={`flex items-center gap-2 ${hasProPrice ? 'text-sm text-gray-500 line-through' : 'text-lg font-bold'}`}>
          <span>£{item.product.price}</span>
        </div>
        {item.product.originalPrice && item.product.originalPrice > item.product.price && (
          <span className="text-xs text-gray-400 line-through">
            RRP £{item.product.originalPrice}
          </span>
        )}
      </div>
    )
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "demo":
        return <Badge className="bg-blue-100 text-blue-800">
          <Package className="w-3 h-3 mr-1" />
          Demo Equipment
        </Badge>
      case "new_release":
        return <Badge className="bg-green-100 text-green-800">
          <Sparkles className="w-3 h-3 mr-1" />
          New Release
        </Badge>
      case "professional_only":
        return <Badge className="bg-purple-100 text-purple-800">
          <Crown className="w-3 h-3 mr-1" />
          Pro Exclusive
        </Badge>
      default:
        return null
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-6xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
                Please sign in with your PGA Professional account to access the exclusive marketplace.
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
                  <Crown className="w-8 h-8 text-yellow-600" />
                  PGA Pro Marketplace
                </h1>
                <p className="text-xl text-gray-600">
                  Exclusive equipment access for PGA Professionals
                </p>
              </div>

              <div className="text-right">
                <Badge className="bg-yellow-100 text-yellow-800 mb-2">
                  <Crown className="w-4 h-4 mr-1" />
                  PGA Professional Access
                </Badge>
                <p className="text-sm text-gray-600">
                  Your exclusive professional marketplace
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <div className="text-sm text-gray-600">Total Pro Items</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.earlyAccessItems}</div>
                <div className="text-sm text-gray-600">Early Access</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.demoItems}</div>
                <div className="text-sm text-gray-600">Demo Equipment</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Sparkles className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.newReleases}</div>
                <div className="text-sm text-gray-600">New Releases</div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-6 gap-4">
                {/* Search */}
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search exclusive equipment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Brand Filter */}
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {BRANDS.map(brand => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Early Access Toggle */}
                <Button
                  variant={earlyAccessOnly ? "default" : "outline"}
                  onClick={() => setEarlyAccessOnly(!earlyAccessOnly)}
                  className="flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Early Access
                </Button>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSelectedBrand("all")
                    setEarlyAccessOnly(false)
                  }}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Marketplace Items */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-32 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No exclusive items found</h3>
                <p className="text-gray-600 mb-6">
                  No items match your current search and filter criteria.
                </p>
                <Button onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setSelectedBrand("all")
                  setEarlyAccessOnly(false)
                }}>
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative">
                    {/* Product Image */}
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center">
                      {item.product.primaryImage ? (
                        <img
                          src={item.product.primaryImage}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 font-medium">{item.product.category.name}</p>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 space-y-2">
                        {getCategoryBadge(item.category)}
                        {item.earlyAccess && (
                          <Badge className="bg-orange-100 text-orange-800 block">
                            <Zap className="w-3 h-3 mr-1" />
                            Early Access
                          </Badge>
                        )}
                        {item.proPrice && (
                          <Badge className="bg-yellow-100 text-yellow-800 block">
                            <Crown className="w-3 h-3 mr-1" />
                            Pro Price
                          </Badge>
                        )}
                      </div>

                      {/* Seller Badge */}
                      <div className="absolute top-3 right-3">
                        {item.product.seller.pgaVerified && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            PGA Pro
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Title & Brand */}
                      <div className="mb-3">
                        <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                          {item.product.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          {item.product.brand && (
                            <Badge variant="outline" className="text-xs">
                              {item.product.brand}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {item.product.condition}
                          </Badge>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        {formatPrice(item)}
                      </div>

                      {/* Seller Info */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {item.product.seller.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium truncate">
                              {item.product.seller.businessBranding?.businessName || item.product.seller.name}
                            </span>
                            {item.product.seller.pgaVerified && (
                              <Crown className="w-3 h-3 text-yellow-600" />
                            )}
                          </div>
                          {item.product.seller.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs">{item.product.seller.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{item.product.stats.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{item.product.stats.favorites}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{item.product.stats.reviews}</span>
                          </div>
                        </div>
                        {item.product.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{item.product.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/products/${item.product.id}`} className="flex-1">
                          <Button className="w-full" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          <Heart className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Posted Time */}
                      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Added {new Date(item.product.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Benefits Info */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                PGA Pro Marketplace Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Early Access</h4>
                  <p className="text-sm text-gray-600">Get first access to new equipment releases</p>
                </div>

                <div className="text-center">
                  <PoundSterling className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Pro Pricing</h4>
                  <p className="text-sm text-gray-600">Exclusive discounted pricing for professionals</p>
                </div>

                <div className="text-center">
                  <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Demo Equipment</h4>
                  <p className="text-sm text-gray-600">Access to demo equipment and testing programs</p>
                </div>

                <div className="text-center">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Pro Network</h4>
                  <p className="text-sm text-gray-600">Connect directly with other golf professionals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
