"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import {
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  Heart,
  Package,
  DollarSign,
  TrendingUp,
  Award,
  Shield,
  Eye,
  Settings,
  Flag,
  MoreHorizontal
} from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  name: string
  image?: string
  location: string
  bio: string
  verified: boolean
  pgaVerified: boolean
  subscription: string
  memberSince: string
  rating: number
  reviewCount: number
  responseRate: number
  stats: {
    totalSales: number
    totalPurchases: number
    totalRevenue: number
    activeListings: number
    totalViews: number
  }
}

interface Transaction {
  id: string
  type: "sale" | "purchase"
  product: {
    id: string
    title: string
    image: string
    price: number
  }
  otherParty: {
    id: string
    name: string
    verified: boolean
  }
  date: string
  status: "completed" | "pending" | "cancelled"
}

interface Review {
  id: string
  rating: number
  comment: string
  reviewer: {
    id: string
    name: string
    image?: string
    verified: boolean
  }
  product?: {
    id: string
    title: string
  }
  date: string
}

// Mock data - in real app, this would come from your API
const mockProfile: UserProfile = {
  id: "user123",
  name: "John Doe",
  image: undefined,
  location: "Surrey, UK",
  bio: "Passionate golfer for over 20 years. Always looking for quality equipment to improve my game. Happy to help fellow golfers find great gear!",
  verified: true,
  pgaVerified: false,
  subscription: "pro",
  memberSince: "2023-03-15",
  rating: 4.8,
  reviewCount: 45,
  responseRate: 94.5,
  stats: {
    totalSales: 23,
    totalPurchases: 12,
    totalRevenue: 4250,
    activeListings: 8,
    totalViews: 2341
  }
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "sale",
    product: {
      id: "prod1",
      title: "TaylorMade SIM2 Driver",
      image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=200&h=150&fit=crop",
      price: 240
    },
    otherParty: {
      id: "buyer1",
      name: "Mike Johnson",
      verified: true
    },
    date: "2025-01-10T10:30:00Z",
    status: "completed"
  },
  {
    id: "2",
    type: "purchase",
    product: {
      id: "prod2",
      title: "Callaway Apex Iron Set",
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=200&h=150&fit=crop",
      price: 480
    },
    otherParty: {
      id: "seller1",
      name: "Sarah Wilson",
      verified: true
    },
    date: "2025-01-08T15:45:00Z",
    status: "completed"
  }
]

const mockReviews: Review[] = [
  {
    id: "1",
    rating: 5,
    comment: "Excellent seller! The driver was exactly as described and arrived quickly. Great communication throughout.",
    reviewer: {
      id: "buyer1",
      name: "Mike Johnson",
      verified: true
    },
    product: {
      id: "prod1",
      title: "TaylorMade SIM2 Driver"
    },
    date: "2025-01-10T11:00:00Z"
  },
  {
    id: "2",
    rating: 4,
    comment: "Good condition clubs, fast shipping. Would buy from again.",
    reviewer: {
      id: "buyer2",
      name: "Alex Rodriguez",
      verified: false
    },
    date: "2025-01-05T14:20:00Z"
  }
]

export default function UserProfilePage() {
  const params = useParams()
  const id = params?.id as string
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile>(mockProfile)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [loading, setLoading] = useState(true)

  const isOwnProfile = session?.user?.id === id

  useEffect(() => {
    // Simulate loading profile data
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [id])

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
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
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
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
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.image} />
                  <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    {profile.verified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {profile.pgaVerified && (
                      <Badge className="bg-yellow-500 text-white">
                        <Award className="w-3 h-3 mr-1" />
                        PGA Pro
                      </Badge>
                    )}
                    <Badge className="bg-primary text-white capitalize">
                      {profile.subscription}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {new Date(profile.memberSince).getFullYear()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(Math.round(profile.rating))}
                      <span className="ml-1">{profile.rating} ({profile.reviewCount} reviews)</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 max-w-2xl">{profile.bio}</p>

                  <div className="flex gap-3">
                    {isOwnProfile ? (
                      <Button asChild>
                        <Link href="/profile/edit">
                          <Settings className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                        <Button variant="outline">
                          <Heart className="w-4 h-4 mr-2" />
                          Follow
                        </Button>
                      </>
                    )}
                    <Button variant="outline">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:w-64">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.stats.totalSales}</div>
                  <div className="text-sm text-blue-800">Total Sales</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">£{profile.stats.totalRevenue}</div>
                  <div className="text-sm text-green-800">Revenue</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{profile.stats.activeListings}</div>
                  <div className="text-sm text-purple-800">Active Listings</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{profile.responseRate}%</div>
                  <div className="text-sm text-orange-800">Response Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content Tabs */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={transaction.product.image}
                        alt={transaction.product.title}
                        className="w-16 h-16 object-cover rounded"
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={transaction.type === 'sale' ? 'default' : 'secondary'}
                            className={transaction.type === 'sale' ? 'bg-green-500' : 'bg-blue-500'}
                          >
                            {transaction.type === 'sale' ? 'Sold' : 'Purchased'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              transaction.status === 'completed' ? 'text-green-600 border-green-600' :
                              transaction.status === 'pending' ? 'text-yellow-600 border-yellow-600' :
                              'text-red-600 border-red-600'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </div>

                        <h4 className="font-semibold">{transaction.product.title}</h4>
                        <p className="text-sm text-gray-600">
                          {transaction.type === 'sale' ? 'Sold to' : 'Purchased from'} {transaction.otherParty.name}
                          {transaction.otherParty.verified && (
                            <span className="text-green-600 ml-1">✓</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold">£{transaction.product.price}</div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/products/${transaction.product.id}`}>
                            View Item
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {transactions.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                    <p className="text-gray-500">
                      {isOwnProfile
                        ? "Start buying or selling to see your activity here"
                        : "This user hasn't had any recent activity"
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Active Listings ({profile.stats.activeListings})</span>
                  {isOwnProfile && (
                    <Button size="sm" asChild>
                      <Link href="/sell/new">Add New Listing</Link>
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active listings</h3>
                  <p className="text-gray-500">
                    {isOwnProfile
                      ? "Create your first listing to start selling"
                      : "This user doesn't have any active listings"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({profile.reviewCount})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.reviewer.image} />
                          <AvatarFallback>{review.reviewer.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{review.reviewer.name}</span>
                            {review.reviewer.verified && (
                              <Badge variant="outline" className="text-xs">Verified</Badge>
                            )}
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>

                          {review.product && (
                            <p className="text-sm text-gray-600 mb-2">
                              Review for: {review.product.title}
                            </p>
                          )}

                          <p className="text-gray-700">{review.comment}</p>
                        </div>

                        <Button variant="ghost" size="sm">
                          <Flag className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {reviews.length === 0 && (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                      <p className="text-gray-500">
                        {isOwnProfile
                          ? "Complete transactions to receive reviews"
                          : "This user hasn't received any reviews yet"
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Response Rate</span>
                    <span className="font-bold">{profile.responseRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Rating</span>
                    <span className="font-bold">{profile.rating}/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Reviews</span>
                    <span className="font-bold">{profile.reviewCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Profile Views</span>
                    <span className="font-bold">{profile.stats.totalViews}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Sales</span>
                    <span className="font-bold">{profile.stats.totalSales}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Purchases</span>
                    <span className="font-bold">{profile.stats.totalPurchases}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Revenue Generated</span>
                    <span className="font-bold">£{profile.stats.totalRevenue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Listings</span>
                    <span className="font-bold">{profile.stats.activeListings}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
