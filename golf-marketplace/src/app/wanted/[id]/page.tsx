"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import {
  ArrowLeft,
  MessageCircle,
  PoundSterling,
  MapPin,
  Clock,
  AlertCircle,
  Star,
  Crown,
  Send,
  CheckCircle,
  Calendar,
  User,
  Shield,
  Eye,
  Edit
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
  updatedAt: string
  expiresAt?: string
  user: {
    id: string
    name: string
    image?: string
    location?: string
    rating?: number
    pgaVerified: boolean
    memberSince: string
    responseRate?: number
  }
  responses: WantedResponse[]
}

interface WantedResponse {
  id: string
  message: string
  offeredPrice?: number
  productImageUrl?: string
  contactInfo?: string
  createdAt: string
  responder: {
    id: string
    name: string
    image?: string
    location?: string
    rating?: number
    pgaVerified: boolean
    memberSince: string
  }
}

interface ResponseForm {
  message: string
  offeredPrice: string
  contactInfo: string
}

export default function WantedListingPage() {
  const { data: session } = useSession()
  const params = useParams()
  const listingId = params?.id as string

  const [listing, setListing] = useState<WantedListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseForm, setResponseForm] = useState<ResponseForm>({
    message: "",
    offeredPrice: "",
    contactInfo: ""
  })
  const [submittingResponse, setSubmittingResponse] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchListing = useCallback(async () => {
    try {
      const response = await fetch(`/api/wanted/${listingId}`)
      const data = await response.json()

      if (response.ok) {
        setListing(data)
      } else {
        setError(data.error || "Failed to load listing")
      }
    } catch (error) {
      setError("Failed to load listing")
    } finally {
      setLoading(false)
    }
  }, [listingId])

  useEffect(() => {
    if (listingId) {
      fetchListing()
    }
  }, [listingId, fetchListing])

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!responseForm.message.trim()) {
      setError("Message is required")
      return
    }

    setSubmittingResponse(true)
    setError("")

    try {
      const response = await fetch(`/api/wanted/${listingId}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: responseForm.message,
          offeredPrice: responseForm.offeredPrice ? parseFloat(responseForm.offeredPrice) : null,
          contactInfo: responseForm.contactInfo
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Your response has been sent successfully!")
        setShowResponseForm(false)
        setResponseForm({ message: "", offeredPrice: "", contactInfo: "" })
        // Refresh listing to show new response
        fetchListing()
      } else {
        setError(data.error || "Failed to send response")
      }
    } catch (error) {
      setError("Failed to send response")
    } finally {
      setSubmittingResponse(false)
    }
  }

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return "Budget not specified"
    if (min && max) return `£${min} - £${max}`
    if (min) return `£${min}+`
    if (max) return `Up to £${max}`
    return ""
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
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

  const isExpired = listing?.expiresAt && new Date(listing.expiresAt) < new Date()
  const isOwner = session?.user?.id === listing?.user.id
  const canRespond = session && !isOwner && listing?.status === "active" && !isExpired

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded mb-6"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Listing Not Found</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link href="/wanted">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Wanted Listings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!listing) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/wanted" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wanted Listings
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Alerts */}
              {isExpired && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    This wanted listing has expired and is no longer accepting responses.
                  </AlertDescription>
                </Alert>
              )}

              {listing.status !== "active" && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    This wanted listing is currently {listing.status}.
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Main Listing */}
              <Card>
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{listing.category}</Badge>
                      {listing.urgent && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                      <Badge
                        className={listing.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {listing.status}
                      </Badge>
                    </div>

                    {isOwner && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/wanted/${listing.id}/edit`}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {listing.brand && (
                      <div className="flex items-center gap-2">
                        <strong>Brand:</strong>
                        <span>{listing.brand}</span>
                      </div>
                    )}

                    {listing.condition && (
                      <div className="flex items-center gap-2">
                        <strong>Condition:</strong>
                        <span>{listing.condition}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <PoundSterling className="w-4 h-4 text-green-600" />
                      <strong>Budget:</strong>
                      <span className="text-green-600 font-medium">
                        {formatBudget(listing.budgetMin, listing.budgetMax)}
                      </span>
                    </div>

                    {listing.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <strong>Location:</strong>
                        <span>{listing.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="whitespace-pre-wrap">{listing.description}</p>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Posted {formatTimeAgo(listing.createdAt)}</span>
                    </div>
                    {listing.expiresAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Expires {formatDate(listing.expiresAt)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{listing.responses.length} responses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Form */}
              {canRespond && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Respond to this Request
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!showResponseForm ? (
                      <div className="text-center py-6">
                        <p className="text-gray-600 mb-4">
                          Do you have what {listing.user.name} is looking for?
                        </p>
                        <Button onClick={() => setShowResponseForm(true)}>
                          <Send className="w-4 h-4 mr-2" />
                          Send Response
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleResponseSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="message">Your Message *</Label>
                          <Textarea
                            id="message"
                            value={responseForm.message}
                            onChange={(e) => setResponseForm(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Describe what you have available, condition, price, etc."
                            rows={4}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="offeredPrice">Your Price (£)</Label>
                          <Input
                            id="offeredPrice"
                            type="number"
                            value={responseForm.offeredPrice}
                            onChange={(e) => setResponseForm(prev => ({ ...prev, offeredPrice: e.target.value }))}
                            placeholder="Enter your asking price"
                            min="0"
                            step="1"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="contactInfo">Contact Information</Label>
                          <Input
                            id="contactInfo"
                            value={responseForm.contactInfo}
                            onChange={(e) => setResponseForm(prev => ({ ...prev, contactInfo: e.target.value }))}
                            placeholder="Phone number, email, or preferred contact method"
                            className="mt-1"
                          />
                        </div>

                        {error && (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <AlertDescription className="text-red-700">
                              {error}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            disabled={submittingResponse}
                            className="flex-1"
                          >
                            {submittingResponse ? (
                              <>
                                <Send className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Response
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowResponseForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Responses (visible to listing owner) */}
              {isOwner && listing.responses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Responses ({listing.responses.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {listing.responses.map((response) => (
                      <div key={response.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {response.responder.name?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{response.responder.name}</span>
                                {response.responder.pgaVerified && (
                                  <Crown className="w-4 h-4 text-yellow-600" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                {response.responder.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span>{response.responder.rating.toFixed(1)}</span>
                                  </div>
                                )}
                                {response.responder.location && (
                                  <span>{response.responder.location}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(response.createdAt)}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-3">{response.message}</p>

                        {response.offeredPrice && (
                          <div className="flex items-center gap-2 mb-2">
                            <PoundSterling className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-600">
                              Offered Price: £{response.offeredPrice}
                            </span>
                          </div>
                        )}

                        {response.contactInfo && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-sm">
                              <strong>Contact:</strong> {response.contactInfo}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Posted By */}
              <Card>
                <CardHeader>
                  <CardTitle>Posted By</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium">
                        {listing.user.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{listing.user.name}</span>
                        {listing.user.pgaVerified && (
                          <Crown className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                      {listing.user.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-500">{listing.user.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {listing.user.rating && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{listing.user.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Member since:</span>
                      <span className="font-medium">{formatDate(listing.user.memberSince)}</span>
                    </div>

                    {listing.user.responseRate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Response rate:</span>
                        <span className="font-medium">{Math.round(listing.user.responseRate * 100)}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Listing Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Responses:</span>
                    <span className="font-medium">{listing.responses.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge
                      className={listing.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {listing.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Posted:</span>
                    <span className="font-medium">{formatTimeAgo(listing.createdAt)}</span>
                  </div>

                  {listing.expiresAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expires:</span>
                      <span className="font-medium">{formatDate(listing.expiresAt)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Safety Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Safety Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">
                    • Meet in public places for equipment viewing
                  </p>
                  <p className="text-sm text-gray-600">
                    • Verify equipment authenticity before purchase
                  </p>
                  <p className="text-sm text-gray-600">
                    • Use secure payment methods
                  </p>
                  <p className="text-sm text-gray-600">
                    • Trust your instincts about sellers
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
