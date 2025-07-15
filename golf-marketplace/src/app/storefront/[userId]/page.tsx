"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Heart,
  Share2,
  Crown,
  Verified,
  Award,
  TrendingUp,
  Users,
  Package,
  Calendar,
  ExternalLink,
  Instagram,
  Facebook,
  Twitter,
  Linkedin
} from "lucide-react"
import Link from "next/link"

interface BusinessBranding {
  logoUrl?: string
  bannerUrl?: string
  brandColors: {
    primary: string
    secondary: string
    accent: string
  }
  businessName: string
  tagline?: string
  description?: string
  website?: string
  phone?: string
  email?: string
  address?: {
    street: string
    city: string
    postcode: string
    country: string
  }
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  showContactInfo: boolean
  showSocialLinks: boolean
}

interface StorefrontUser {
  id: string
  name: string
  email: string
  image?: string
  verified: boolean
  pgaVerified: boolean
  subscription: string
  rating: number
  reviewCount: number
  responseRate: number
  memberSince: string
  location: string
  businessBranding?: BusinessBranding
  stats: {
    totalSales: number
    activeListings: number
    totalRevenue: number
    customerSatisfaction: number
  }
}

interface Product {
  id: string
  title: string
  brand: string
  condition: string
  price: number
  originalPrice?: number
  image: string
  featured: boolean
  views: number
  createdAt: string
}

// Mock data for premium storefront
const mockUser: StorefrontUser = {
  id: "business-user-1",
  name: "Premium Golf Pro Shop",
  email: "info@premiumgolfpro.com",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  verified: true,
  pgaVerified: true,
  subscription: "business",
  rating: 4.9,
  reviewCount: 127,
  responseRate: 98,
  memberSince: "2023-03-15",
  location: "Surrey, UK",
  businessBranding: {
    logoUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&h=400&fit=crop",
    brandColors: {
      primary: "#16a085",
      secondary: "#2c3e50",
      accent: "#f39c12"
    },
    businessName: "Premium Golf Pro Shop",
    tagline: "Your Premier Golf Equipment Destination",
    description: "Established in 2020, Premium Golf Pro Shop has been serving golfers across Surrey with the finest selection of golf equipment. We specialize in premium clubs, professional fitting services, and personalized golf solutions for players of all skill levels.",
    website: "https://premiumgolfpro.com",
    phone: "+44 1234 567890",
    email: "info@premiumgolfpro.com",
    address: {
      street: "123 Golf Course Road",
      city: "Surrey",
      postcode: "GU1 2AB",
      country: "United Kingdom"
    },
    socialLinks: {
      facebook: "https://facebook.com/premiumgolfpro",
      instagram: "https://instagram.com/premiumgolfpro",
      twitter: "https://twitter.com/premiumgolfpro",
      linkedin: "https://linkedin.com/company/premiumgolfpro"
    },
    showContactInfo: true,
    showSocialLinks: true
  },
  stats: {
    totalSales: 156,
    activeListings: 24,
    totalRevenue: 45780,
    customerSatisfaction: 98
  }
}

const mockProducts: Product[] = [
  {
    id: "1",
    title: "TaylorMade SIM2 Driver - Professional Fit",
    brand: "TaylorMade",
    condition: "Excellent",
    price: 240,
    originalPrice: 450,
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop",
    featured: true,
    views: 127,
    createdAt: "2025-01-10T10:30:00Z"
  },
  {
    id: "2",
    title: "Callaway Apex Pro Iron Set 4-PW",
    brand: "Callaway",
    condition: "Like New",
    price: 680,
    originalPrice: 1299,
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop",
    featured: true,
    views: 89,
    createdAt: "2025-01-08T15:45:00Z"
  },
  {
    id: "3",
    title: "Scotty Cameron Newport 2 Putter",
    brand: "Titleist",
    condition: "Excellent",
    price: 360,
    originalPrice: 450,
    image: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=300&fit=crop",
    featured: false,
    views: 156,
    createdAt: "2025-01-05T09:20:00Z"
  }
]

export default function StorefrontPage() {
  const params = useParams()
  const userId = params.userId as string
  const [user, setUser] = useState<StorefrontUser | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState("products")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStorefrontData = async () => {
      try {
        const response = await fetch(`/api/storefront/${userId}`)
        const data = await response.json()

        if (response.ok) {
          setUser(data.user)
          setProducts(data.products)
        } else {
          console.error('Failed to fetch storefront data:', data.error)
          // Fall back to mock data for demo
          setUser(mockUser)
          setProducts(mockProducts)
        }
      } catch (error) {
        console.error('Error fetching storefront data:', error)
        // Fall back to mock data for demo
        setUser(mockUser)
        setProducts(mockProducts)
      } finally {
        setLoading(false)
      }
    }

    fetchStorefrontData()
  }, [userId])

  const isPremiumStorefront = user?.subscription && ['business', 'pga-pro'].includes(user.subscription)
  const branding = user?.businessBranding
  const customColors = branding?.brandColors

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Storefront Not Found</h2>
              <p className="text-gray-600 mb-4">This seller profile doesn't exist or is not available.</p>
              <Button asChild>
                <Link href="/search">Browse Equipment</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Custom Banner */}
      <div
        className="relative h-64 bg-gradient-to-r from-gray-600 to-gray-800 overflow-hidden"
        style={{
          background: isPremiumStorefront && branding?.bannerUrl
            ? `url(${branding.bannerUrl}) center/cover`
            : customColors
            ? `linear-gradient(135deg, ${customColors.primary}, ${customColors.secondary})`
            : undefined
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex items-center gap-6 text-white">
            <div className="relative">
              {isPremiumStorefront && branding?.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.businessName}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-gray-600">
                      {user.name.charAt(0)}
                    </span>
                  )}
                </div>
              )}
              {isPremiumStorefront && (
                <Badge className="absolute -bottom-2 -right-2 bg-yellow-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Business+
                </Badge>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isPremiumStorefront && branding?.businessName ? branding.businessName : user.name}
              </h1>
              {isPremiumStorefront && branding?.tagline && (
                <p className="text-xl text-gray-200 mb-2">{branding.tagline}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{user.rating} ({user.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.verified && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Verified className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {user.pgaVerified && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Award className="w-3 h-3 mr-1" />
                      PGA Pro
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({user.reviewCount})</TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-6">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.featured && (
                            <Badge
                              className="text-white"
                              style={{ backgroundColor: customColors?.accent || '#f39c12' }}
                            >
                              Featured
                            </Badge>
                          )}
                          <Badge className="bg-green-500 text-white text-xs">
                            {product.condition}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                        {product.originalPrice && (
                          <div className="absolute bottom-3 left-3">
                            <Badge className="bg-green-500 text-white">
                              Save £{product.originalPrice - product.price}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1 line-clamp-2">{product.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{product.brand}</p>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span
                              className="text-lg font-bold"
                              style={{ color: customColors?.primary || '#16a085' }}
                            >
                              £{product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                £{product.originalPrice}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{product.views} views</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            style={{
                              backgroundColor: customColors?.primary || '#16a085',
                              color: 'white'
                            }}
                            asChild
                          >
                            <Link href={`/products/${product.id}`}>
                              View Details
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No products available</h3>
                    <p className="text-gray-600">This seller hasn't listed any products yet.</p>
                  </div>
                )}
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    {isPremiumStorefront && branding?.description ? (
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {branding.description}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">About {user.name}</h3>
                        <p className="text-gray-600 mb-4">
                          Member since {formatDate(user.memberSince)}
                        </p>
                        <div className="flex justify-center gap-4 text-sm text-gray-500">
                          <span>{user.responseRate}% response rate</span>
                          <span>•</span>
                          <span>{user.stats.totalSales} sales completed</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
                      <p className="text-gray-600 mb-4">
                        {user.rating}/5 stars from {user.reviewCount} reviews
                      </p>
                      <p className="text-sm text-gray-500">Reviews will be displayed here.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Business Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Business Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sales</span>
                  <span className="font-semibold">{user.stats.totalSales}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Listings</span>
                  <span className="font-semibold">{user.stats.activeListings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className="font-semibold">{user.stats.customerSatisfaction}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-semibold">{user.responseRate}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {isPremiumStorefront && branding?.showContactInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {branding.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <a
                        href={branding.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {branding.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a href={`tel:${branding.phone}`} className="text-blue-600 hover:underline">
                        {branding.phone}
                      </a>
                    </div>
                  )}
                  {branding.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a href={`mailto:${branding.email}`} className="text-blue-600 hover:underline">
                        {branding.email}
                      </a>
                    </div>
                  )}
                  {branding.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="text-sm">
                        <div>{branding.address.street}</div>
                        <div>{branding.address.city}, {branding.address.postcode}</div>
                        <div>{branding.address.country}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {isPremiumStorefront && branding?.showSocialLinks && branding.socialLinks && (
              <Card>
                <CardHeader>
                  <CardTitle>Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {branding.socialLinks.facebook && (
                      <a
                        href={branding.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {branding.socialLinks.instagram && (
                      <a
                        href={branding.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {branding.socialLinks.twitter && (
                      <a
                        href={branding.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {branding.socialLinks.linkedin && (
                      <a
                        href={branding.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button className="w-full" asChild>
                  <Link href={`/messages?user=${user.id}`}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Seller
                  </Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Storefront
                </Button>
              </CardContent>
            </Card>

            {/* Member Since */}
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Member since</p>
                <p className="font-semibold">{formatDate(user.memberSince)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
