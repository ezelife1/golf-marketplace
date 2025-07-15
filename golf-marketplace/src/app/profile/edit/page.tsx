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
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Bell,
  Shield,
  Camera,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  location: string
  website: string
  preferences: {
    emailNotifications: boolean
    pushNotifications: boolean
    marketingEmails: boolean
    priceAlerts: boolean
    messageNotifications: boolean
  }
}

export default function ProfileEditPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: session?.user?.email || "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      priceAlerts: true,
      messageNotifications: true
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // In real app, update user profile via API
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        setTimeout(() => {
          router.push("/profile")
        }, 2000)
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updatePreferences = (field: keyof ProfileFormData['preferences'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }))
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Please sign in to edit your profile.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Link href="/auth/signin">
                <Button>Sign In</Button>
              </Link>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/profile">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Link>
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Edit Profile</h1>
                <p className="text-gray-600">Update your personal information and preferences</p>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <Alert className={`mb-6 ${
              message.type === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription className={
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+44 7123 456789"
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => updateFormData('bio', e.target.value)}
                    placeholder="Tell us about yourself, your golf experience, and what you're looking for..."
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location & Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location & Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateFormData('location', e.target.value)}
                      placeholder="London, UK"
                      className="pl-10 mt-1"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Helps with local pickup and shipping estimates
                  </p>
                </div>

                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => updateFormData('website', e.target.value)}
                      placeholder="https://your-website.com"
                      className="pl-10 mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailNotifications"
                    checked={formData.preferences.emailNotifications}
                    onCheckedChange={(checked) => updatePreferences('emailNotifications', checked as boolean)}
                  />
                  <Label htmlFor="emailNotifications" className="flex-1">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-gray-600">Receive important updates and account notifications</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="messageNotifications"
                    checked={formData.preferences.messageNotifications}
                    onCheckedChange={(checked) => updatePreferences('messageNotifications', checked as boolean)}
                  />
                  <Label htmlFor="messageNotifications" className="flex-1">
                    <div>
                      <div className="font-medium">Message Notifications</div>
                      <div className="text-sm text-gray-600">Get notified when you receive new messages</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="priceAlerts"
                    checked={formData.preferences.priceAlerts}
                    onCheckedChange={(checked) => updatePreferences('priceAlerts', checked as boolean)}
                  />
                  <Label htmlFor="priceAlerts" className="flex-1">
                    <div>
                      <div className="font-medium">Price Alerts</div>
                      <div className="text-sm text-gray-600">Notify me when items on my wishlist drop in price</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketingEmails"
                    checked={formData.preferences.marketingEmails}
                    onCheckedChange={(checked) => updatePreferences('marketingEmails', checked as boolean)}
                  />
                  <Label htmlFor="marketingEmails" className="flex-1">
                    <div>
                      <div className="font-medium">Marketing Emails</div>
                      <div className="text-sm text-gray-600">Receive newsletters, deals, and promotional offers</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pushNotifications"
                    checked={formData.preferences.pushNotifications}
                    onCheckedChange={(checked) => updatePreferences('pushNotifications', checked as boolean)}
                  />
                  <Label htmlFor="pushNotifications" className="flex-1">
                    <div>
                      <div className="font-medium">Push Notifications</div>
                      <div className="text-sm text-gray-600">Receive instant notifications on your device</div>
                    </div>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Verification Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Email Verified
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Phone Pending
                        </Badge>
                        <Button size="sm" variant="link" className="p-0 h-auto">
                          Verify Now
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Membership</h4>
                    <div className="space-y-2">
                      <Badge className="bg-green-100 text-green-800">
                        Pro Member
                      </Badge>
                      <p className="text-sm text-gray-600">
                        3% commission • Enhanced listings • Priority support
                      </p>
                      <Link href="/dashboard/subscription">
                        <Button size="sm" variant="link" className="p-0 h-auto">
                          Manage Subscription
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Link href="/profile">
                <Button variant="outline">Cancel</Button>
              </Link>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-2">Privacy & Security</h3>
            <p className="text-blue-700 text-sm mb-4">
              Your personal information is protected and will only be used to improve your ClubUp experience.
              We never share your data with third parties without your consent.
            </p>
            <div className="flex gap-4 text-sm">
              <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-blue-600 hover:text-blue-800">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
