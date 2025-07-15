"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, ShoppingCart, Eye } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  title: string
  brand: string
  price: number
  originalPrice?: number
  condition: string
  image: string
  rating: number
  views: number
  seller: {
    name: string
    verified: boolean
  }
}

// Mock featured products data
const featuredProducts: Product[] = [
  {
    id: "1",
    title: "TaylorMade SIM2 Driver - 10.5° Regular Flex",
    brand: "TaylorMade",
    price: 240,
    originalPrice: 450,
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop",
    rating: 4.8,
    views: 127,
    seller: {
      name: "John Doe",
      verified: true
    }
  },
  {
    id: "2",
    title: "Callaway Apex Iron Set 4-PW",
    brand: "Callaway",
    price: 480,
    originalPrice: 899,
    condition: "Very Good",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop",
    rating: 4.9,
    views: 89,
    seller: {
      name: "Sarah Wilson",
      verified: true
    }
  },
  {
    id: "3",
    title: "Scotty Cameron Newport 2 Putter",
    brand: "Titleist",
    price: 360,
    originalPrice: 450,
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=300&fit=crop",
    rating: 5.0,
    views: 156,
    seller: {
      name: "Mike Johnson",
      verified: true
    }
  },
  {
    id: "4",
    title: "Ping G425 Fairway Wood 3W",
    brand: "Ping",
    price: 180,
    originalPrice: 320,
    condition: "Very Good",
    image: "https://images.unsplash.com/photo-1551888026-e670c70b9cb1?w=400&h=300&fit=crop",
    rating: 4.7,
    views: 98,
    seller: {
      name: "Emma Davis",
      verified: false
    }
  }
]

export function FeaturedProducts() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Featured Equipment</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover premium golf equipment from verified sellers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay badges */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-white">Featured</Badge>
                </div>

                <div className="absolute top-3 right-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-white/80 hover:bg-white text-gray-700"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100" asChild>
                      <Link href={`/products/${product.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="mb-2">
                  <Badge variant="outline" className="text-xs mb-2">
                    {product.condition}
                  </Badge>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">{product.brand}</p>
                </div>

                {/* Rating and views */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">
                      ({product.rating})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="w-3 h-3" />
                    {product.views}
                  </div>
                </div>

                {/* Seller info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">{product.seller.name}</span>
                    {product.seller.verified && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        ✓
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        £{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          £{product.originalPrice}
                        </span>
                      )}
                    </div>
                    {product.originalPrice && (
                      <div className="text-xs text-green-600 font-medium">
                        Save £{product.originalPrice - product.price}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link href="/products">
              View All Equipment
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
