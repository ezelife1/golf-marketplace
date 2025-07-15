"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  MessageCircle,
  Shield,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Zap,
  MapPin,
  Calendar,
  Award,
  Eye,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useCart } from "@/contexts/cart-context"
import { BuyButton } from "@/components/buy-button"
import { ShippingCalculator } from "@/components/shipping-calculator"
import Link from "next/link"

interface ProductData {
  id: string
  title: string
  brand: string
  model: string
  category: string
  condition: string
  price: number
  originalPrice?: number
  description: string
  specifications: any
  images: string[]
  seller: {
    id: string
    name: string
    rating: number
    reviewCount: number
    location: string
    memberSince: string
    verified: boolean
    subscription: string
    pgaVerified?: boolean
  }
  views: number
  watchers: number
  createdAt: string
  isFeatured: boolean
  authenticatedBy?: string
  reviews?: Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    user: {
      name: string
      verified: boolean
    }
  }>
  shipping?: {
    included?: boolean
    dimensions?: {
      length: number
      width: number
      height: number
      weight: number
    }
    postcode?: string
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: session } = useSession()
  const router = useRouter()
  const { addItem, openCart } = useCart()

  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Fetch product data from API
  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/products/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found')
          } else {
            setError('Failed to load product')
          }
          return
        }

        const data = await response.json()
        setProduct(data.product)

      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Something went wrong while loading the product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      id: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      image: product.images[0] || 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=200&h=150&fit=crop',
      condition: product.condition,
      category: product.category,
      sellerId: product.seller.id,
      sellerName: product.seller.name
    })

    openCart()
  }

  const handleContactSeller = () => {
    router.push(`/messages/new?seller=${product?.seller.id}&product=${product?.id}`)
  }

  const nextImage = () => {
    if (product && currentImageIndex < product.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xl">Loading product details...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error || 'Product not found'}
              </AlertDescription>
            </Alert>
            <div className="text-center mt-6">
              <Button asChild>
                <Link href="/search">Browse Other Products</Link>
              </Button>
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
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <Link href={`/categories/${product.category.toLowerCase()}`} className="hover:text-primary">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <img
                src={product.images[currentImageIndex] || 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop'}
                alt={product.title}
                className="w-full h-96 object-cover rounded-lg"
              />

              {product.isFeatured && (
                <Badge className="absolute top-4 left-4 bg-primary text-white">
                  Featured
                </Badge>
              )}

              {product.authenticatedBy && (
                <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  Authenticated
                </Badge>
              )}

              {/* Navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                    disabled={currentImageIndex === product.images.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-sm">
                {currentImageIndex + 1} / {Math.max(product.images.length, 1)}
              </div>
            </div>

            {/* Thumbnail gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`
                      relative h-20 rounded-md overflow-hidden border-2 transition-colors
                      ${index === currentImageIndex ? 'border-primary' : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Shipping */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.condition}</Badge>
                <Badge variant="outline">{product.category}</Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="w-4 h-4 mr-1" />
                  {product.views} views
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">(Based on similar items)</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold text-primary">£{product.price}</div>
                {product.originalPrice && (
                  <div className="text-lg text-gray-500 line-through">£{product.originalPrice}</div>
                )}
                {product.originalPrice && (
                  <Badge className="bg-green-100 text-green-800">
                    Save £{product.originalPrice - product.price}
                  </Badge>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed">
                {product.description.split('\n')[0]}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Direct Buy Now Button */}
              <BuyButton
                productId={product.id}
                price={product.price}
                title={product.title}
                sellerId={product.seller.id}
                requiresShipping={!product.shipping?.included && Boolean(product.shipping?.dimensions)}
                sellerPostcode={product.shipping?.postcode}
                dimensions={product.shipping?.dimensions}
              />

              <div className="flex gap-3">
                <Button size="lg" variant="outline" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={isWishlisted ? "text-red-500 border-red-500" : ""}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <Button variant="outline" size="lg" className="w-full" onClick={handleContactSeller}>
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Seller
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Shield className="w-6 h-6 text-green-600 mb-1" />
                  <span className="text-sm font-medium">Authenticated</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck className="w-6 h-6 text-green-600 mb-1" />
                  <span className="text-sm font-medium">Secure Shipping</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw className="w-6 h-6 text-green-600 mb-1" />
                  <span className="text-sm font-medium">14-Day Returns</span>
                </div>
              </div>
            </div>

            {/* Shipping Calculator */}
            {product.shipping?.dimensions && product.shipping?.postcode && (
              <ShippingCalculator
                productId={product.id}
                sellerPostcode={product.shipping.postcode}
                dimensions={product.shipping.dimensions}
                value={product.price}
                category={product.category}
                freeShipping={product.shipping.included}
              />
            )}

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="font-semibold">{product.seller.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{product.seller.name}</span>
                      {product.seller.verified && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge className="bg-primary text-white capitalize">
                        {product.seller.subscription}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(product.seller.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-1">{product.seller.rating} ({product.seller.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {product.seller.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Member since {product.seller.memberSince}
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href={`/sellers/${product.seller.id}`}>View Seller Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-3">Product Description</h3>
                  <div className="whitespace-pre-wrap text-gray-700">
                    {product.description}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-gray-700">{value as string}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="shipping" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
                    <div className="space-y-2 text-gray-700">
                      <p>• Shipping costs calculated in real-time based on your location</p>
                      <p>• Royal Mail, DPD, and collection options available</p>
                      <p>• Tracked services include full delivery confirmation</p>
                      <p>• All items fully insured during transit</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Returns Policy</h3>
                    <div className="space-y-2 text-gray-700">
                      <p>• 14-day return window from delivery date</p>
                      <p>• Items must be in original condition</p>
                      <p>• Return shipping costs covered by ClubUp</p>
                      <p>• Refunds processed within 5-7 business days</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="p-6">
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{review.user.name}</span>
                          {review.user.verified && (
                            <Badge variant="outline" className="text-xs">Verified</Badge>
                          )}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to review this product after purchase.</p>
                    <Button variant="outline">Write a Review</Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
