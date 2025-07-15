"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { useCart } from "@/contexts/cart-context"
import {
  Heart,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  Bell,
  BellOff,
  Trash2,
  ShoppingCart,
  MessageCircle,
  Share2,
  Grid,
  List,
  Star,
  MapPin,
  Calendar,
  AlertCircle,
  Check
} from "lucide-react"
import Link from "next/link"

interface WishlistItem {
  id: string
  product: {
    id: string
    title: string
    brand: string
    condition: string
    currentPrice: number
    originalPrice?: number
    image: string
    seller: {
      id: string
      name: string
      location: string
      verified: boolean
      rating: number
    }
    available: boolean
    featured: boolean
  }
  addedAt: string
  notifications: {
    priceAlerts: boolean
    availabilityAlerts: boolean
    targetPrice?: number
  }
  priceHistory: {
    price: number
    date: string
  }[]
}

// Mock data - in real app, this would come from your API
const mockWishlistItems: WishlistItem[] = [
  {
    id: "1",
    product: {
      id: "prod1",
      title: "TaylorMade SIM2 Driver - 10.5° Regular Flex",
      brand: "TaylorMade",
      condition: "Excellent",
      currentPrice: 220,
      originalPrice: 240,
      image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop",
      seller: {
        id: "seller1",
        name: "John D.",
        location: "Surrey, UK",
        verified: true,
        rating: 4.8
      },
      available: true,
      featured: true
    },
    addedAt: "2025-01-10T10:30:00Z",
    notifications: {
      priceAlerts: true,
      availabilityAlerts: true,
      targetPrice: 200
    },
    priceHistory: [
      { price: 240, date: "2025-01-01" },
      { price: 230, date: "2025-01-05" },
      { price: 220, date: "2025-01-10" }
    ]
  },
  {
    id: "2",
    product: {
      id: "prod2",
      title: "Callaway Apex Iron Set 4-PW",
      brand: "Callaway",
      condition: "Very Good",
      currentPrice: 480,
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop",
      seller: {
        id: "seller2",
        name: "Sarah W.",
        location: "London, UK",
        verified: true,
        rating: 4.9
      },
      available: true,
      featured: false
    },
    addedAt: "2025-01-08T15:45:00Z",
    notifications: {
      priceAlerts: false,
      availabilityAlerts: true
    },
    priceHistory: [
      { price: 480, date: "2025-01-08" }
    ]
  },
  {
    id: "3",
    product: {
      id: "prod3",
      title: "Scotty Cameron Newport 2 Putter",
      brand: "Titleist",
      condition: "Excellent",
      currentPrice: 360,
      image: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=300&fit=crop",
      seller: {
        id: "seller3",
        name: "Mike J.",
        location: "Manchester, UK",
        verified: true,
        rating: 4.7
      },
      available: false,
      featured: false
    },
    addedAt: "2025-01-05T09:20:00Z",
    notifications: {
      priceAlerts: false,
      availabilityAlerts: true
    },
    priceHistory: [
      { price: 380, date: "2025-01-01" },
      { price: 360, date: "2025-01-03" }
    ]
  }
]

export default function WishlistPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { addItem } = useCart()

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(mockWishlistItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('added_date')
  const [filterBy, setFilterBy] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/wishlist")
      return
    }

    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [session, router])

  const handleRemoveItem = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId))
    setSelectedItems(prev => prev.filter(id => id !== itemId))
  }

  const handleAddToCart = (item: WishlistItem) => {
    if (!item.product.available) return

    addItem({
      id: item.product.id,
      title: item.product.title,
      brand: item.product.brand,
      price: item.product.currentPrice,
      image: item.product.image,
      condition: item.product.condition,
      category: "Golf Equipment", // In real app, get from product
      sellerId: item.product.seller.id,
      sellerName: item.product.seller.name
    })
  }

  const handleNotificationToggle = (itemId: string, type: 'priceAlerts' | 'availabilityAlerts') => {
    setWishlistItems(prev => prev.map(item =>
      item.id === itemId
        ? {
            ...item,
            notifications: {
              ...item.notifications,
              [type]: !item.notifications[type]
            }
          }
        : item
    ))
  }

  const handleSetTargetPrice = (itemId: string, targetPrice: number) => {
    setWishlistItems(prev => prev.map(item =>
      item.id === itemId
        ? {
            ...item,
            notifications: {
              ...item.notifications,
              targetPrice,
              priceAlerts: true
            }
          }
        : item
    ))
  }

  const handleSelectItem = (itemId: string, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, itemId])
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItems(filteredItems.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleBulkRemove = () => {
    setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.id)))
    setSelectedItems([])
  }

  const handleBulkAddToCart = () => {
    selectedItems.forEach(itemId => {
      const item = wishlistItems.find(item => item.id === itemId)
      if (item && item.product.available) {
        handleAddToCart(item)
      }
    })
  }

  // Filter and sort items
  let filteredItems = wishlistItems.filter(item => {
    if (searchQuery && !item.product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.product.brand.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    switch (filterBy) {
      case 'available':
        return item.product.available
      case 'unavailable':
        return !item.product.available
      case 'price_drops':
        return item.priceHistory.length > 1 &&
               item.priceHistory[item.priceHistory.length - 1].price < item.priceHistory[0].price
      case 'target_price':
        return item.notifications.targetPrice &&
               item.product.currentPrice <= item.notifications.targetPrice
      default:
        return true
    }
  })

  // Sort items
  switch (sortBy) {
    case 'price_low':
      filteredItems.sort((a, b) => a.product.currentPrice - b.product.currentPrice)
      break
    case 'price_high':
      filteredItems.sort((a, b) => b.product.currentPrice - a.product.currentPrice)
      break
    case 'added_date':
      filteredItems.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      break
    case 'title':
      filteredItems.sort((a, b) => a.product.title.localeCompare(b.product.title))
      break
  }

  const getPriceChange = (item: WishlistItem) => {
    if (item.priceHistory.length < 2) return null

    const latest = item.priceHistory[item.priceHistory.length - 1].price
    const previous = item.priceHistory[item.priceHistory.length - 2].price
    const change = latest - previous
    const percentage = ((change / previous) * 100).toFixed(1)

    return { change, percentage, isDecrease: change < 0 }
  }

  if (!session) {
    return null // Redirecting
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
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
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-gray-600">{wishlistItems.length} items saved • Track prices and get notified</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search your wishlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Sold/Unavailable</SelectItem>
                <SelectItem value="price_drops">Recent Price Drops</SelectItem>
                <SelectItem value="target_price">At Target Price</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="added_date">Recently Added</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
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

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{selectedItems.length} items selected</span>
                  <Button variant="outline" size="sm" onClick={handleBulkAddToCart}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkRemove}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])}>
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wishlist Items */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {wishlistItems.length === 0 ? "Your wishlist is empty" : "No items match your filters"}
              </h3>
              <p className="text-gray-600 mb-6">
                {wishlistItems.length === 0
                  ? "Save items you're interested in and we'll notify you of price changes!"
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center gap-3 mb-4">
              <Checkbox
                checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-primary"
              />
              <span className="text-sm font-medium">Select All</span>
            </div>

            <div className={viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {filteredItems.map((item) => {
                const priceChange = getPriceChange(item)
                const isSelected = selectedItems.includes(item.id)

                return (
                  <Card key={item.id} className={`group hover:shadow-lg transition-all duration-300 ${
                    !item.product.available ? 'opacity-75' : ''
                  } ${viewMode === 'list' ? 'flex' : ''}`}>
                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className={`object-cover ${
                          viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
                        } ${!item.product.available ? 'grayscale' : ''}`}
                      />

                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                          className="bg-white/80 data-[state=checked]:bg-primary"
                        />
                        {item.product.featured && (
                          <Badge className="bg-primary text-white">Featured</Badge>
                        )}
                        {!item.product.available && (
                          <Badge variant="destructive">Sold</Badge>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                      </div>

                      {priceChange && (
                        <div className="absolute bottom-3 left-3">
                          <Badge
                            className={priceChange.isDecrease ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                          >
                            {priceChange.isDecrease ? (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            )}
                            {priceChange.percentage}%
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className={`${viewMode === 'list' ? 'flex-1' : ''} p-4`}>
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.product.condition}
                        </Badge>
                      </div>

                      <h3 className="font-semibold mb-1 line-clamp-2">{item.product.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.product.brand}</p>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-lg font-bold text-primary">£{item.product.currentPrice}</span>
                          {item.product.originalPrice && item.product.originalPrice !== item.product.currentPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">£{item.product.originalPrice}</span>
                          )}
                        </div>
                        {item.notifications.targetPrice && (
                          <div className="text-xs text-gray-500">
                            Target: £{item.notifications.targetPrice}
                            {item.product.currentPrice <= item.notifications.targetPrice && (
                              <Check className="w-3 h-3 text-green-500 inline ml-1" />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{item.product.seller.location}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{item.product.seller.rating}</span>
                        </div>
                        {item.product.seller.verified && (
                          <Badge variant="outline" className="text-xs">✓</Badge>
                        )}
                      </div>

                      {/* Notification Settings */}
                      <div className="flex items-center gap-2 mb-3 text-xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotificationToggle(item.id, 'priceAlerts')}
                          className={`p-1 h-6 ${item.notifications.priceAlerts ? 'text-blue-600' : 'text-gray-400'}`}
                        >
                          {item.notifications.priceAlerts ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                        </Button>
                        <span className="text-gray-500">Price alerts</span>
                      </div>

                      <div className="flex gap-2">
                        {item.product.available ? (
                          <>
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleAddToCart(item)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Add to Cart
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/products/${item.product.id}`}>
                                View
                              </Link>
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" className="flex-1" disabled>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            No Longer Available
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
