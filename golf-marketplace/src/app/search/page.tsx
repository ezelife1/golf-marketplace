"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import {
  Search,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  MapPin,
  Star,
  Heart,
  MessageCircle,
  ChevronDown,
  X,
  Zap,
  Crown,
  TrendingUp,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

interface SearchFilters {
  query: string
  category: string
  condition: string[]
  brand: string[]
  priceRange: [number, number]
  location: string
  verified: boolean
  featured: boolean
  sortBy: string
}

interface Product {
  id: string
  title: string
  brand: string
  condition: string
  price: number
  originalPrice?: number
  image: string
  seller: {
    name: string
    location: string
    verified: boolean
    rating: number
    hasPriority: boolean
    subscriptionTier: string
    pgaVerified: boolean
  }
  featured: boolean
  authenticatedBy?: string
  views: number
  createdAt: string
  priorityScore?: number
}

// Mock data - in real app, this would come from your API
const mockProducts: Product[] = [
  {
    id: "1",
    title: "TaylorMade SIM2 Driver - 10.5° Regular Flex",
    brand: "TaylorMade",
    condition: "Excellent",
    price: 240,
    originalPrice: 450,
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop",
    seller: {
      name: "John D.",
      location: "Surrey, UK",
      verified: true,
      rating: 4.8,
      hasPriority: true,
      subscriptionTier: "Pro+",
      pgaVerified: false
    },
    featured: true,
    authenticatedBy: "ClubUp Expert",
    views: 127,
    createdAt: "2025-01-10T10:30:00Z",
    priorityScore: 95
  },
  {
    id: "2",
    title: "Callaway Apex Iron Set 4-PW",
    brand: "Callaway",
    condition: "Very Good",
    price: 480,
    originalPrice: 899,
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop",
    seller: {
      name: "Sarah W.",
      location: "London, UK",
      verified: true,
      rating: 4.9,
      hasPriority: false,
      subscriptionTier: "Free",
      pgaVerified: false
    },
    featured: false,
    views: 89,
    createdAt: "2025-01-08T15:45:00Z",
    priorityScore: 60
  },
  {
    id: "3",
    title: "Scotty Cameron Newport 2 Putter",
    brand: "Titleist",
    condition: "Excellent",
    price: 360,
    originalPrice: 450,
    image: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=300&fit=crop",
    seller: {
      name: "Mike J.",
      location: "Manchester, UK",
      verified: true,
      rating: 4.7,
      hasPriority: true,
      subscriptionTier: "Pro+",
      pgaVerified: true
    },
    featured: true,
    authenticatedBy: "ClubUp Expert",
    views: 156,
    createdAt: "2025-01-05T09:20:00Z",
    priorityScore: 99
  },
  {
    id: "4",
    title: "Ping G425 Max Driver",
    brand: "Ping",
    condition: "Like New",
    price: 320,
    originalPrice: 520,
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop",
    seller: {
      name: "Alex R.",
      location: "Birmingham, UK",
      verified: false,
      rating: 4.5,
      hasPriority: false,
      subscriptionTier: "Free",
      pgaVerified: false
    },
    featured: false,
    views: 67,
    createdAt: "2025-01-03T14:10:00Z",
    priorityScore: 40
  }
]

const categories = [
  "All Categories", "Drivers", "Fairway Woods", "Hybrids", "Irons",
  "Wedges", "Putters", "Golf Bags", "Apparel", "Accessories"
]

const conditions = ["Like New", "Excellent", "Very Good", "Good", "Fair"]

const brands = [
  "TaylorMade", "Callaway", "Titleist", "Ping", "Mizuno", "Cobra",
  "Wilson", "Cleveland", "Srixon", "Odyssey", "Sun Mountain"
]

const sortOptions = [
  { value: "priority", label: "Priority (Pro+ First)" },
  { value: "relevance", label: "Best Match" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "views", label: "Most Viewed" },
  { value: "rating", label: "Highest Rated" }
]

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Default sortBy changed to 'priority'
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || 'All Categories',
    condition: [],
    brand: [],
    priceRange: [0, 1000],
    location: '',
    verified: false,
    featured: false,
    sortBy: 'priority' // Changed default to priority
  })

  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Apply filters to products
    let filtered = mockProducts.filter(product => {
      if (filters.query && !product.title.toLowerCase().includes(filters.query.toLowerCase()) &&
          !product.brand.toLowerCase().includes(filters.query.toLowerCase())) {
        return false
      }

      if (filters.category !== 'All Categories') {
        // In real app, you'd check product.category
        return true
      }

      if (filters.condition.length > 0 && !filters.condition.includes(product.condition)) {
        return false
      }

      if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) {
        return false
      }

      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false
      }

      if (filters.verified && !product.seller.verified) {
        return false
      }

      if (filters.featured && !product.featured) {
        return false
      }

      return true
    })

    // Apply sorting
    switch (filters.sortBy) {
      case 'priority':
        filtered.sort((a, b) => {
          // Pro+ first, then by priorityScore descending, then by newest
          if (a.seller.subscriptionTier === "Pro+" && b.seller.subscriptionTier !== "Pro+") return -1
          if (a.seller.subscriptionTier !== "Pro+" && b.seller.subscriptionTier === "Pro+") return 1
          if ((b.priorityScore || 0) !== (a.priorityScore || 0)) {
            return (b.priorityScore || 0) - (a.priorityScore || 0)
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        break
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'views':
        filtered.sort((a, b) => b.views - a.views)
        break
      case 'rating':
        filtered.sort((a, b) => b.seller.rating - a.seller.rating)
        break
      default:
        // Keep original order for relevance
        break
    }

    setProducts(filtered)
  }, [filters])

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = (key: 'condition' | 'brand', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'All Categories',
      condition: [],
      brand: [],
      priceRange: [0, 1000],
      location: '',
      verified: false,
      featured: false,
      sortBy: 'priority'
    })
  }

  const activeFilterCount =
    (filters.category !== 'All Categories' ? 1 : 0) +
    filters.condition.length +
    filters.brand.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.verified ? 1 : 0) +
    (filters.featured ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search golf equipment..."
                  value={filters.query}
                  onChange={(e) => updateFilter('query', e.target.value)}
                  className="pl-12 pr-4 h-14 text-lg border-2 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger className="w-48 h-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-14 px-6"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-primary text-white">{activeFilterCount}</Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.category !== 'All Categories' && (
                <Badge variant="secondary" className="px-3 py-1">
                  {filters.category}
                  <button
                    onClick={() => updateFilter('category', 'All Categories')}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.condition.map(condition => (
                <Badge key={condition} variant="secondary" className="px-3 py-1">
                  {condition}
                  <button
                    onClick={() => toggleArrayFilter('condition', condition)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.brand.map(brand => (
                <Badge key={brand} variant="secondary" className="px-3 py-1">
                  {brand}
                  <button
                    onClick={() => toggleArrayFilter('brand', brand)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                <Badge variant="secondary" className="px-3 py-1">
                  £{filters.priceRange[0]} - £{filters.priceRange[1]}
                  <button
                    onClick={() => updateFilter('priceRange', [0, 1000])}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.verified && (
                <Badge variant="secondary" className="px-3 py-1">
                  Verified Sellers
                  <button
                    onClick={() => updateFilter('verified', false)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.featured && (
                <Badge variant="secondary" className="px-3 py-1">
                  Featured Only
                  <button
                    onClick={() => updateFilter('featured', false)}
                    className="ml-2 hover:text-red-5000"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-6`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Filters</span>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => updateFilter('priceRange', value)}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>£{filters.priceRange[0]}</span>
                      <span>£{filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <h4 className="font-medium mb-3">Condition</h4>
                  <div className="space-y-2">
                    {conditions.map(condition => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={`condition-${condition}`}
                          checked={filters.condition.includes(condition)}
                          onCheckedChange={() => toggleArrayFilter('condition', condition)}
                        />
                        <label
                          htmlFor={`condition-${condition}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {condition}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <h4 className="font-medium mb-3">Brand</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map(brand => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={filters.brand.includes(brand)}
                          onCheckedChange={() => toggleArrayFilter('brand', brand)}
                        />
                        <label
                          htmlFor={`brand-${brand}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="font-medium mb-3">Location</h4>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="City, postcode, or region"
                      value={filters.location}
                      onChange={(e) => updateFilter('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Special Filters */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={filters.verified}
                      onCheckedChange={(checked) => updateFilter('verified', checked)}
                    />
                    <label htmlFor="verified" className="text-sm font-medium">
                      Verified sellers only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={filters.featured}
                      onCheckedChange={(checked) => updateFilter('featured', checked)}
                    />
                    <label htmlFor="featured" className="text-sm font-medium">
                      Featured listings only
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{products.length} results</h2>
                {filters.query && (
                  <p className="text-gray-600">for "{filters.query}"</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Priority System Explanation */}
            <div className="mb-4">
              <Card>
                <CardContent className="py-3 px-4 text-sm text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>
                    <strong>Priority sorting:</strong> Pro+ sellers and listings with higher priority scores are shown first by default.
                    Priority is determined by seller subscription, listing quality, and recency.
                    <span className="ml-1 text-gray-500">(You can change the sort order above.)</span>
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* Product Grid/List */}
            {products.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or filters to find more products.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {products.map((product) => (
                  <Card key={product.id} className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}>
                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                      <img
                        src={product.image}
                        alt={product.title}
                        className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                          viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
                        }`}
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.featured && (
                          <Badge className="bg-primary text-white">Featured</Badge>
                        )}
                        {product.authenticatedBy && (
                          <Badge className="bg-green-500 text-white text-xs">Authenticated</Badge>
                        )}
                        {product.seller.subscriptionTier === "Pro+" && (
                          <Badge className="flex items-center gap-1 bg-yellow-400 text-black text-xs font-semibold">
                            <Crown className="w-3 h-3 mr-0.5" /> Pro+
                          </Badge>
                        )}
                        {product.seller.hasPriority && (
                          <Badge className="flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold">
                            <TrendingUp className="w-3 h-3 mr-0.5" /> Priority
                          </Badge>
                        )}
                        {product.seller.pgaVerified && (
                          <Badge className="flex items-center gap-1 bg-indigo-600 text-white text-xs font-semibold">
                            <CheckCircle className="w-3 h-3 mr-0.5" /> PGA Verified
                          </Badge>
                        )}
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

                    <CardContent className={`${viewMode === 'list' ? 'flex-1' : ''} p-4`}>
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs">
                          {product.condition}
                        </Badge>
                      </div>

                      <h3 className="font-semibold mb-1 line-clamp-2">{product.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product.brand}</p>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-lg font-bold text-primary">£{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">£{product.originalPrice}</span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{product.views} views</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{product.seller.location}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{product.seller.rating}</span>
                        </div>
                        {product.seller.verified && (
                          <Badge variant="outline" className="text-xs">✓</Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" asChild>
                          <Link href={`/products/${product.id}`}>View Details</Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Load More */}
            {products.length > 0 && (
              <div className="text-center">
                <Button variant="outline" size="lg">
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
