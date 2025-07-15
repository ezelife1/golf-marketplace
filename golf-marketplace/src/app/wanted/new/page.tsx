"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import {
  ArrowLeft,
  Save,
  AlertCircle,
  PoundSterling,
  MapPin,
  Calendar,
  CheckCircle,
  HelpCircle,
  Lightbulb
} from "lucide-react"
import Link from "next/link"

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

const POPULAR_BRANDS = [
  "TaylorMade", "Callaway", "Titleist", "PING", "Mizuno", "Cobra", "Wilson",
  "Srixon", "Bridgestone", "Cleveland", "Scotty Cameron", "Odyssey", "Nike"
]

interface WantedFormData {
  title: string
  description: string
  category: string
  brand: string
  condition: string
  budgetMin: string
  budgetMax: string
  location: string
  urgent: boolean
  expiresIn: number
}

export default function NewWantedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState<WantedFormData>({
    title: "",
    description: "",
    category: "",
    brand: "",
    condition: "",
    budgetMin: "",
    budgetMax: "",
    location: "",
    urgent: false,
    expiresIn: 30
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (field: keyof WantedFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length < 10) {
      newErrors.title = "Title must be at least 10 characters"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (formData.budgetMin && formData.budgetMax) {
      const min = parseFloat(formData.budgetMin)
      const max = parseFloat(formData.budgetMax)
      if (min > max) {
        newErrors.budgetMax = "Maximum budget must be higher than minimum budget"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/wanted", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/wanted/${data.id}`)
      } else {
        setErrors({ submit: data.error || "Failed to create wanted listing" })
      }
    } catch (error) {
      setErrors({ submit: "Something went wrong. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse max-w-2xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-gray-600 mb-4">
                You need to sign in to post a wanted listing.
              </p>
              <Link href="/auth/signin">
                <Button>Sign In</Button>
              </Link>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/wanted" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wanted Listings
            </Link>

            <h1 className="text-4xl font-bold mb-2">Post a Wanted Listing</h1>
            <p className="text-xl text-gray-600">
              Let sellers know what golf equipment you're looking for
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>What are you looking for?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => updateFormData('title', e.target.value)}
                        placeholder="e.g., Looking for TaylorMade SIM2 Driver 10.5°"
                        className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Be specific about what you're looking for - {formData.title.length}/100 characters
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        placeholder="Describe exactly what you're looking for, preferred condition, specific requirements, etc."
                        rows={4}
                        className={`mt-1 ${errors.description ? 'border-red-500' : ''}`}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Provide details to help sellers understand your needs - {formData.description.length}/500 characters
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                          <SelectTrigger className={`mt-1 ${errors.category ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && (
                          <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="brand">Preferred Brand</Label>
                        <Select value={formData.brand} onValueChange={(value) => updateFormData('brand', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Any brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any Brand</SelectItem>
                            {POPULAR_BRANDS.map(brand => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="condition">Acceptable Condition</Label>
                      <Select value={formData.condition} onValueChange={(value) => updateFormData('condition', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Any condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITIONS.map(condition => (
                            <SelectItem key={condition} value={condition}>
                              {condition}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Budget */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PoundSterling className="w-5 h-5" />
                      Budget Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budgetMin">Minimum Budget (£)</Label>
                        <Input
                          id="budgetMin"
                          type="number"
                          value={formData.budgetMin}
                          onChange={(e) => updateFormData('budgetMin', e.target.value)}
                          placeholder="0"
                          min="0"
                          step="1"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="budgetMax">Maximum Budget (£)</Label>
                        <Input
                          id="budgetMax"
                          type="number"
                          value={formData.budgetMax}
                          onChange={(e) => updateFormData('budgetMax', e.target.value)}
                          placeholder="1000"
                          min="0"
                          step="1"
                          className={`mt-1 ${errors.budgetMax ? 'border-red-500' : ''}`}
                        />
                        {errors.budgetMax && (
                          <p className="text-red-500 text-sm mt-1">{errors.budgetMax}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Setting a budget range helps sellers understand your price expectations
                    </p>
                  </CardContent>
                </Card>

                {/* Location & Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Location & Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="location">Preferred Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => updateFormData('location', e.target.value)}
                          placeholder="e.g., London, UK or willing to collect nationwide"
                          className="pl-10 mt-1"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Specify if you prefer local collection or are willing to pay for shipping
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="urgent"
                        checked={formData.urgent}
                        onCheckedChange={(checked) => updateFormData('urgent', checked as boolean)}
                      />
                      <Label htmlFor="urgent" className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Mark as urgent
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="expiresIn">Listing Duration</Label>
                      <Select
                        value={formData.expiresIn.toString()}
                        onValueChange={(value) => updateFormData('expiresIn', parseInt(value))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit */}
                {errors.submit && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {errors.submit}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Post Wanted Listing
                      </>
                    )}
                  </Button>

                  <Link href="/wanted">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Tips for Better Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Be specific about model, specifications, and condition preferences</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Set a realistic budget range to attract serious sellers</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Include your location or shipping preferences</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Respond promptly to seller messages</p>
                  </div>
                </CardContent>
              </Card>

              {/* Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                    Good Example
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">
                      "Looking for Titleist T200 Irons 5-PW"
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      "Seeking Titleist T200 irons in steel shafts, regular flex. Looking for 5-iron through pitching wedge. Condition should be very good or better. Happy to pay for shipping within the UK."
                    </p>
                    <Badge variant="outline" className="text-xs">Budget: £400-600</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* How it Works */}
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-sm">Post your wanted listing</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-sm">Sellers browse and respond</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-sm">Review offers and negotiate</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <p className="text-sm">Complete the purchase</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
