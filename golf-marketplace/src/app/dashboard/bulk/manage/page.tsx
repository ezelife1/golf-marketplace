"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Package,
  Crown,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Plus,
  Minus
} from "lucide-react"
import Link from "next/link"

interface ProductListing {
  id: string
  title: string
  category: string
  brand: string
  condition: string
  price: number
  originalPrice?: number
  description: string
  status: 'active' | 'draft' | 'sold' | 'pending'
  featured: boolean
  createdAt: string
  views: number
  selected?: boolean
}

// Mock data for demonstration
const mockListings: ProductListing[] = [
  {
    id: "1",
    title: "TaylorMade SIM2 Driver - 10.5° Regular Flex",
    category: "drivers",
    brand: "TaylorMade",
    condition: "Excellent",
    price: 240,
    originalPrice: 450,
    description: "Premium driver in excellent condition",
    status: "active",
    featured: false,
    createdAt: "2025-01-10T10:30:00Z",
    views: 127
  },
  {
    id: "2",
    title: "Callaway Apex Iron Set 4-PW",
    category: "irons",
    brand: "Callaway",
    condition: "Very Good",
    price: 480,
    originalPrice: 899,
    description: "Professional iron set with minimal wear",
    status: "active",
    featured: true,
    createdAt: "2025-01-08T15:45:00Z",
    views: 89
  },
  {
    id: "3",
    title: "Scotty Cameron Newport 2 Putter",
    category: "putters",
    brand: "Titleist",
    condition: "Like New",
    price: 360,
    originalPrice: 450,
    description: "Legendary putter with original headcover",
    status: "draft",
    featured: false,
    createdAt: "2025-01-05T09:20:00Z",
    views: 156
  }
]

interface MassEditForm {
  price?: string
  originalPrice?: string
  condition?: string
  status?: string
  featured?: boolean
  priceAdjustment?: {
    type: 'percentage' | 'fixed'
    value: number
    operation: 'increase' | 'decrease'
  }
}

export default function MassEditPage() {
  const { data: session } = useSession()
  const [listings, setListings] = useState<ProductListing[]>(mockListings)
  const [selectedListings, setSelectedListings] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [massEditForm, setMassEditForm] = useState<MassEditForm>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Check if user has access to bulk tools
  const hasAccess = session?.user?.subscription &&
    ['business', 'pga-pro'].includes(session.user.subscription)

  // Filter listings based on search and filters
  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchQuery ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.brand.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "all" || listing.status === filterStatus
    const matchesCategory = filterCategory === "all" || listing.category === filterCategory

    return matchesSearch && matchesStatus && matchesCategory
  })

  // Handle individual listing selection
  const toggleListingSelection = (listingId: string) => {
    setSelectedListings(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    )
  }

  // Select all filtered listings
  const selectAllFiltered = () => {
    const filteredIds = filteredListings.map(l => l.id)
    setSelectedListings(filteredIds)
  }

  // Clear all selections
  const clearSelection = () => {
    setSelectedListings([])
  }

  // Apply mass edit changes
  const applyMassEdit = async () => {
    if (selectedListings.length === 0) {
      setError("Please select at least one listing to edit")
      return
    }

    if (Object.keys(massEditForm).length === 0) {
      setError("Please specify at least one change to apply")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Apply changes to selected listings
      setListings(prev => prev.map(listing => {
        if (selectedListings.includes(listing.id)) {
          const updates: Partial<ProductListing> = {}

          // Apply price changes
          if (massEditForm.price) {
            updates.price = parseFloat(massEditForm.price)
          }

          if (massEditForm.originalPrice) {
            updates.originalPrice = parseFloat(massEditForm.originalPrice)
          }

          // Apply price adjustments
          if (massEditForm.priceAdjustment) {
            const { type, value, operation } = massEditForm.priceAdjustment
            let newPrice = listing.price

            if (type === 'percentage') {
              const adjustment = (listing.price * value) / 100
              newPrice = operation === 'increase'
                ? listing.price + adjustment
                : listing.price - adjustment
            } else {
              newPrice = operation === 'increase'
                ? listing.price + value
                : listing.price - value
            }

            updates.price = Math.max(0, Math.round(newPrice * 100) / 100)
          }

          // Apply other updates
          if (massEditForm.condition) {
            updates.condition = massEditForm.condition
          }

          if (massEditForm.status) {
            updates.status = massEditForm.status as ProductListing['status']
          }

          if (massEditForm.featured !== undefined) {
            updates.featured = massEditForm.featured
          }

          return { ...listing, ...updates }
        }
        return listing
      }))

      setSuccess(`Successfully updated ${selectedListings.length} listings`)
      setSelectedListings([])
      setMassEditForm({})
    } catch (err) {
      setError("Failed to update listings")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-gray-600 mb-4">Please sign in to access mass edit tools.</p>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Business+ Access Required</h2>
              <p className="text-gray-600 mb-4">
                Mass edit tools are available for Business and PGA Pro subscribers.
              </p>
              <Button asChild>
                <Link href="/subscription">Upgrade Now</Link>
              </Button>
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard/seller" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <Edit className="w-8 h-8 text-primary" />
                  Mass Edit
                </h1>
                <p className="text-xl text-gray-600">
                  Edit multiple listings at once
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Business+
                </Badge>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Listings List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Listings ({filteredListings.length})</CardTitle>
                    <div className="flex items-center gap-2">
                      {selectedListings.length > 0 && (
                        <Badge className="bg-blue-100 text-blue-800">
                          {selectedListings.length} selected
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectedListings.length === filteredListings.length ? clearSelection : selectAllFiltered}
                      >
                        {selectedListings.length === filteredListings.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex gap-4 mt-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search listings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="drivers">Drivers</SelectItem>
                        <SelectItem value="irons">Irons</SelectItem>
                        <SelectItem value="putters">Putters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredListings.map((listing) => (
                      <div
                        key={listing.id}
                        className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                          selectedListings.includes(listing.id) ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={selectedListings.includes(listing.id)}
                            onCheckedChange={() => toggleListingSelection(listing.id)}
                          />

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm">{listing.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {listing.status}
                              </Badge>
                              {listing.featured && (
                                <Badge className="bg-yellow-500 text-white text-xs">Featured</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>{listing.brand}</span>
                              <span>•</span>
                              <span>{listing.condition}</span>
                              <span>•</span>
                              <span>{listing.views} views</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold">£{listing.price}</div>
                            {listing.originalPrice && (
                              <div className="text-xs text-gray-500 line-through">£{listing.originalPrice}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mass Edit Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Mass Edit Panel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedListings.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Select listings to edit</p>
                    </div>
                  )}

                  {selectedListings.length > 0 && (
                    <>
                      <div className="text-sm text-gray-600">
                        Editing <strong>{selectedListings.length}</strong> listing{selectedListings.length !== 1 ? 's' : ''}
                      </div>

                      <Tabs defaultValue="pricing" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="pricing">Pricing</TabsTrigger>
                          <TabsTrigger value="details">Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pricing" className="space-y-4">
                          {/* Direct Price Change */}
                          <div>
                            <Label htmlFor="price">Set Price (£)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={massEditForm.price || ''}
                              onChange={(e) => setMassEditForm(prev => ({
                                ...prev,
                                price: e.target.value
                              }))}
                              placeholder="Enter new price"
                              step="0.01"
                            />
                          </div>

                          <div>
                            <Label htmlFor="originalPrice">Set Original Price (£)</Label>
                            <Input
                              id="originalPrice"
                              type="number"
                              value={massEditForm.originalPrice || ''}
                              onChange={(e) => setMassEditForm(prev => ({
                                ...prev,
                                originalPrice: e.target.value
                              }))}
                              placeholder="Enter original price"
                              step="0.01"
                            />
                          </div>

                          {/* Price Adjustment */}
                          <div className="border-t pt-4">
                            <Label>Price Adjustment</Label>
                            <div className="space-y-3 mt-2">
                              <div className="flex gap-2">
                                <Select
                                  value={massEditForm.priceAdjustment?.operation || ''}
                                  onValueChange={(value) => setMassEditForm(prev => ({
                                    ...prev,
                                    priceAdjustment: {
                                      ...prev.priceAdjustment,
                                      operation: value as 'increase' | 'decrease',
                                      type: prev.priceAdjustment?.type || 'percentage',
                                      value: prev.priceAdjustment?.value || 0
                                    }
                                  }))}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Operation" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="increase">Increase</SelectItem>
                                    <SelectItem value="decrease">Decrease</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={massEditForm.priceAdjustment?.type || ''}
                                  onValueChange={(value) => setMassEditForm(prev => ({
                                    ...prev,
                                    priceAdjustment: {
                                      ...prev.priceAdjustment,
                                      type: value as 'percentage' | 'fixed',
                                      operation: prev.priceAdjustment?.operation || 'increase',
                                      value: prev.priceAdjustment?.value || 0
                                    }
                                  }))}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="percentage">%</SelectItem>
                                    <SelectItem value="fixed">£</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <Input
                                type="number"
                                value={massEditForm.priceAdjustment?.value || ''}
                                onChange={(e) => setMassEditForm(prev => ({
                                  ...prev,
                                  priceAdjustment: {
                                    ...prev.priceAdjustment,
                                    value: parseFloat(e.target.value) || 0,
                                    operation: prev.priceAdjustment?.operation || 'increase',
                                    type: prev.priceAdjustment?.type || 'percentage'
                                  }
                                }))}
                                placeholder="Enter value"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="details" className="space-y-4">
                          <div>
                            <Label htmlFor="condition">Condition</Label>
                            <Select
                              value={massEditForm.condition || ''}
                              onValueChange={(value) => setMassEditForm(prev => ({
                                ...prev,
                                condition: value
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No change</SelectItem>
                                <SelectItem value="Like New">Like New</SelectItem>
                                <SelectItem value="Excellent">Excellent</SelectItem>
                                <SelectItem value="Very Good">Very Good</SelectItem>
                                <SelectItem value="Good">Good</SelectItem>
                                <SelectItem value="Fair">Fair</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={massEditForm.status || ''}
                              onValueChange={(value) => setMassEditForm(prev => ({
                                ...prev,
                                status: value
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No change</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Featured Status</Label>
                            <div className="flex items-center space-x-2 mt-2">
                              <Checkbox
                                id="featured"
                                checked={massEditForm.featured === true}
                                onCheckedChange={(checked) => setMassEditForm(prev => ({
                                  ...prev,
                                  featured: checked === true
                                }))}
                              />
                              <Label htmlFor="featured" className="text-sm">
                                Make all selected listings featured
                              </Label>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Apply Changes Button */}
                      <Button
                        onClick={applyMassEdit}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Applying Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Apply Changes
                          </>
                        )}
                      </Button>

                      {/* Clear Form */}
                      <Button
                        onClick={() => setMassEditForm({})}
                        variant="outline"
                        className="w-full"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear Form
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
