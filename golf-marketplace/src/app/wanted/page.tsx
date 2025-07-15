"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import {
  Search,
  Plus,
  MapPin,
  Clock,
  MessageCircle,
  PoundSterling,
  AlertCircle,
  Filter,
  SortAsc,
  Eye,
  Star,
  Verified,
  Crown
} from "lucide-react"
import Link from "next/link"

interface WantedListing {
  id: string
  title: string
  description: string
  category: string
  brand?: string
  condition?: string
  budgetMin?: number
  budgetMax?: number
  location?: string
  urgent: boolean
  status: string
  createdAt: string
  expiresAt?: string
  responseCount: number
  user: {
    id: string
    name: string
    image?: string
    location?: string
    rating?: number
    pgaVerified: boolean
    memberSince: string
  }
}

interface Filters {
  category: string
  location: string
  sortBy: string
  budgetMin: string
  budgetMax: string
}

const CATEGORIES = [
  "Drivers",
  "Irons",
  "Putters",
  "Wedges",
  "Hybrids",
  "Golf Bags",
  "Apparel",
  "Accessories",
  "Training Aids",
  "Vintage/Collectibles"
]

const CONDITIONS = [
  "New",
  "Like New",
  "Very Good",
  "Good",
  "Fair",
  "Any Condition"
]

export default function WantedPage() {
  const { data: session } = useSession()
  const [wantedListings, setWantedListings] = useState<WantedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    location: "",
    sortBy: "recent",
    budgetMin: "",
    budgetMax: ""
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchWantedListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        ...(filters.category !== "all" && { category: filters.category }),
        ...(filters.location && { location: filters.location }),
        ...(filters.sortBy && { sortBy: filters.sortBy })
      })

      const response = await fetch(`/api/wanted?${params}`)
      const data = await response.json()

      if (response.ok) {
        setWantedListings(data.wantedListings)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error("Error fetching wanted listings:", error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filters])

  useEffect(() => {
    fetchWantedListings()
  }, [currentPage, filters, fetchWantedListings])

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return "Budget not specified"
    if (min && max) return `£${min} - £${max}`
    if (min) return `£${min}+`
    if (max) return `Up to £${max}`
    return ""
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just posted"
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  const filteredListings = wantedListings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Wanted Listings</h1>
            <p className="text-xl text-gray-600">
              Browse requests from golfers looking for specific equipment
            </p>
          </div>

          {session && (
            <Link href="/wanted/new">
              <Button size="lg" className="px-8">
                <Plus className="w-5 h-5 mr-2" />
                Post Wanted Listing
              </Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{wantedListings.length}</div>
              <div className="text-sm text-gray-600">Active Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {wantedListings.reduce((sum, listing) => sum + listing.responseCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Responses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {wantedListings.filter(l => l.urgent).length}
              </div>
              <div className="text-sm text-gray-600">Urgent Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">
                £{Math.round(wantedListings.reduce((sum, l) => sum + (l.budgetMax || l.budgetMin || 0), 0))}
              </div>
              <div className="text-sm text-gray-600">Total Budget</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search wanted listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={filters.category} onValueChange={(value) =>
                setFilters(prev => ({ ...prev, category: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />

              {/* Sort */}
              <Select value={filters.sortBy} onValueChange={(value) =>
                setFilters(prev => ({ ...prev, sortBy: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="urgent">Urgent First</SelectItem>
                  <SelectItem value="budget-high">Highest Budget</SelectItem>
                  <SelectItem value="budget-low">Lowest Budget</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    category: "all",
                    location: "",
                    sortBy: "recent",
                    budgetMin: "",
                    budgetMax: ""
                  })
                  setSearchQuery("")
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wanted Listings Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No wanted listings found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters, or be the first to post a wanted listing.
              </p>
              {session && (
                <Link href="/wanted/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Wanted Listing
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{listing.category}</Badge>
                      {listing.urgent && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(listing.createdAt)}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {listing.description}
                  </p>

                  {/* Budget */}
                  <div className="flex items-center gap-2 mb-3">
                    <PoundSterling className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-600">
                      {formatBudget(listing.budgetMin, listing.budgetMax)}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {listing.user.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{listing.user.name}</span>
                          {listing.user.pgaVerified && (
                            <Crown className="w-3 h-3 text-yellow-600" />
                          )}
                        </div>
                        {listing.user.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{listing.user.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {listing.user.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs">{listing.user.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{listing.responseCount} responses</span>
                      </div>
                      {listing.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{listing.location}</span>
                        </div>
                      )}
                    </div>

                    <Link href={`/wanted/${listing.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>

              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-10"
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
