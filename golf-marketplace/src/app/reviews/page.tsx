"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import {
  Star,
  Filter,
  Search,
  Calendar,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  User,
  Package
} from "lucide-react"
import Link from "next/link"

interface Review {
  id: string
  rating: number
  comment: string
  reviewType: "product" | "seller"
  createdAt: string
  author: {
    id: string
    name: string
    image?: string
    verified: boolean
  }
  target?: {
    id: string
    name: string
    image?: string
  }
  product?: {
    id: string
    title: string
    image: string
    price: number
  }
  helpful: number
  notHelpful: number
  verified: boolean
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingBreakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

// Mock data - in real app, this would come from your API
const mockReviews: Review[] = [
  {
    id: "1",
    rating: 5,
    comment: "Excellent seller! The driver was exactly as described and arrived quickly. Great communication throughout the process.",
    reviewType: "seller",
    createdAt: "2025-01-10T10:30:00Z",
    author: {
      id: "buyer1",
      name: "Mike Johnson",
      verified: true
    },
    target: {
      id: "seller1",
      name: "John Doe"
    },
    product: {
      id: "prod1",
      title: "TaylorMade SIM2 Driver",
      image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=200&h=150&fit=crop",
      price: 240
    },
    helpful: 12,
    notHelpful: 1,
    verified: true
  },
  {
    id: "2",
    rating: 4,
    comment: "Great condition iron set! Only minor wear as described. Would recommend this seller to others.",
    reviewType: "product",
    createdAt: "2025-01-08T15:45:00Z",
    author: {
      id: "buyer2",
      name: "Sarah Wilson",
      verified: true
    },
    product: {
      id: "prod2",
      title: "Callaway Apex Iron Set",
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=200&h=150&fit=crop",
      price: 480
    },
    helpful: 8,
    notHelpful: 0,
    verified: true
  },
  {
    id: "3",
    rating: 3,
    comment: "Product was okay but took longer to arrive than expected. Communication could have been better.",
    reviewType: "seller",
    createdAt: "2025-01-05T09:20:00Z",
    author: {
      id: "buyer3",
      name: "Alex Rodriguez",
      verified: false
    },
    target: {
      id: "seller2",
      name: "Mike Johnson"
    },
    helpful: 3,
    notHelpful: 2,
    verified: false
  }
]

const mockStats: ReviewStats = {
  averageRating: 4.3,
  totalReviews: 127,
  ratingBreakdown: {
    5: 68,
    4: 32,
    3: 18,
    2: 7,
    1: 2
  }
}

export default function ReviewsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [stats, setStats] = useState<ReviewStats>(mockStats)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<"all" | "product" | "seller">("all")
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handleHelpfulVote = async (reviewId: string, helpful: boolean) => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId
        ? {
            ...review,
            helpful: helpful ? review.helpful + 1 : review.helpful,
            notHelpful: !helpful ? review.notHelpful + 1 : review.notHelpful
          }
        : review
    ))
  }

  const filteredReviews = reviews.filter(review => {
    if (selectedType !== "all" && review.reviewType !== selectedType) return false
    if (selectedRating !== null && review.rating !== selectedRating) return false
    if (searchQuery && !review.comment.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !review.author.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const starSize = size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
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
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="lg:col-span-3 h-96 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold mb-2">Reviews & Ratings</h1>
          <p className="text-gray-600">Community feedback from buyers and sellers</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Stats & Filters */}
          <div className="space-y-6">
            {/* Overall Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary mb-2">{stats.averageRating}</div>
                  {renderStars(Math.round(stats.averageRating), "lg")}
                  <p className="text-sm text-gray-600 mt-2">{stats.totalReviews} reviews</p>
                </div>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-4">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${(stats.ratingBreakdown[rating as keyof typeof stats.ratingBreakdown] / stats.totalReviews) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {stats.ratingBreakdown[rating as keyof typeof stats.ratingBreakdown]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Review Type</label>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All Reviews" },
                      { value: "product", label: "Product Reviews" },
                      { value: "seller", label: "Seller Reviews" }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value as any)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedType === type.value
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedRating(null)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedRating === null
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      All Ratings
                    </button>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(rating)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                          selectedRating === rating
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {renderStars(rating, "sm")}
                        <span>& up</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedType("all")
                    setSelectedRating(null)
                    setSearchQuery("")
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Actions */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                    <p className="text-gray-500">
                      Try adjusting your search criteria or filters to find more reviews.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredReviews.map((review) => (
                  <Card key={review.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={review.author.image} />
                          <AvatarFallback>{review.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{review.author.name}</span>
                                {review.author.verified && (
                                  <Badge variant="outline" className="text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                                {review.verified && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                    Verified Purchase
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {renderStars(review.rating)}
                                <Badge variant="outline" className="text-xs">
                                  {review.reviewType === "product" ? "Product" : "Seller"} Review
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Product/Target Info */}
                          {review.product && (
                            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                              <img
                                src={review.product.image}
                                alt={review.product.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{review.product.title}</h4>
                                <p className="text-sm text-gray-600">£{review.product.price}</p>
                              </div>
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}

                          {review.target && (
                            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={review.target.image} />
                                <AvatarFallback>{review.target.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{review.target.name}</h4>
                                <p className="text-sm text-gray-600">Seller</p>
                              </div>
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                          )}

                          {/* Review Content */}
                          <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700">{review.comment}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleHelpfulVote(review.id, true)}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>Helpful ({review.helpful})</span>
                              </button>
                              <button
                                onClick={() => handleHelpfulVote(review.id, false)}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                              >
                                <ThumbsDown className="w-4 h-4" />
                                <span>Not Helpful ({review.notHelpful})</span>
                              </button>
                            </div>
                            <Button variant="ghost" size="sm" className="text-gray-500">
                              <Flag className="w-4 h-4 mr-1" />
                              Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Load More */}
            {filteredReviews.length > 0 && (
              <div className="text-center">
                <Button variant="outline" size="lg">
                  Load More Reviews
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
