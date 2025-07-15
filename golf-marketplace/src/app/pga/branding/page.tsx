"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Navigation } from "@/components/navigation"
import {
  ArrowLeft,
  Crown,
  Upload,
  Palette,
  Globe,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Eye,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react"
import Link from "next/link"

interface BusinessBranding {
  userId: string
  businessName: string
  tagline?: string
  description?: string
  website?: string
  logoUrl?: string
  bannerUrl?: string
  brandColors: {
    primary: string
    secondary: string
    accent: string
  }
  phone?: string
  email?: string
  address?: any
  socialLinks: {
    facebook: string
    instagram: string
    twitter: string
    linkedin: string
    youtube: string
  }
  showContactInfo: boolean
  showSocialLinks: boolean
  customDomain?: string
}

const DEFAULT_COLORS = {
  primary: "#16a085",
  secondary: "#2c3e50",
  accent: "#f39c12"
}

export default function BusinessBrandingPage() {
  const { data: session, status } = useSession()
  const [branding, setBranding] = useState<BusinessBranding | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")

  useEffect(() => {
    if (session?.user?.id) {
      fetchBranding()
    }
  }, [session])

  const fetchBranding = async () => {
    try {
      const response = await fetch("/api/pga/branding")
      const data = await response.json()

      if (response.ok) {
        setBranding(data.branding)
      } else {
        setError(data.error || "Failed to fetch branding")
      }
    } catch (error) {
      setError("Failed to fetch branding")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!branding) return

    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/pga/branding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(branding)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Business branding saved successfully!")
        setBranding(data.branding)
      } else {
        setError(data.error || "Failed to save branding")
      }
    } catch (error) {
      setError("Failed to save branding")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset your branding to defaults? This cannot be undone.")) {
      return
    }

    try {
      const response = await fetch("/api/pga/branding", {
        method: "DELETE"
      })

      if (response.ok) {
        setSuccess("Branding reset to defaults!")
        fetchBranding()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to reset branding")
      }
    } catch (error) {
      setError("Failed to reset branding")
    }
  }

  const handleImageUpload = async (file: File, type: "logo" | "banner"): Promise<string> => {
    // In a real app, you would upload to a file storage service
    // For now, we'll simulate the upload and return a mock URL
    await new Promise(resolve => setTimeout(resolve, 1500))
    return `https://storage.clubup.com/branding/${Date.now()}_${file.name}`
  }

  const updateBranding = (updates: Partial<BusinessBranding>) => {
    setBranding(prev => prev ? { ...prev, ...updates } : null)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-6xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
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
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">PGA Pro Access Required</h2>
              <p className="text-gray-600 mb-4">
                Please sign in with your PGA Professional account to customize your branding.
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

  if (!branding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Loading Error</h2>
              <p className="text-gray-600 mb-4">{error || "Failed to load branding data"}</p>
              <Button onClick={fetchBranding}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/pga/dashboard" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to PGA Dashboard
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <Palette className="w-8 h-8 text-primary" />
                  Business Branding
                </h1>
                <p className="text-xl text-gray-600">
                  Customize your professional storefront and branding
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="text-red-600 hover:text-red-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
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

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Customization Panel */}
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="domain">Domain</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          value={branding.businessName}
                          onChange={(e) => updateBranding({ businessName: e.target.value })}
                          placeholder="Golf Pro Academy"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                          id="tagline"
                          value={branding.tagline || ""}
                          onChange={(e) => updateBranding({ tagline: e.target.value })}
                          placeholder="Elevating Your Golf Game"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={branding.description || ""}
                          onChange={(e) => updateBranding({ description: e.target.value })}
                          placeholder="Professional golf instruction and equipment sales..."
                          rows={3}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={branding.website || ""}
                          onChange={(e) => updateBranding({ website: e.target.value })}
                          placeholder="https://yourgolfacademy.com"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Design Tab */}
                <TabsContent value="design" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Brand Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Logo Upload */}
                      <div>
                        <Label>Business Logo</Label>
                        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          {branding.logoUrl ? (
                            <div className="space-y-3">
                              <img
                                src={branding.logoUrl}
                                alt="Logo"
                                className="max-h-20 mx-auto"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBranding({ logoUrl: "" })}
                              >
                                Remove Logo
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm text-gray-600 mb-3">Upload your business logo</p>
                              <Button size="sm" variant="outline">
                                <Upload className="w-4 h-4 mr-2" />
                                Choose File
                              </Button>
                              <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Banner Upload */}
                      <div>
                        <Label>Header Banner</Label>
                        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          {branding.bannerUrl ? (
                            <div className="space-y-3">
                              <img
                                src={branding.bannerUrl}
                                alt="Banner"
                                className="max-h-32 mx-auto rounded"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBranding({ bannerUrl: "" })}
                              >
                                Remove Banner
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm text-gray-600 mb-3">Upload a header banner</p>
                              <Button size="sm" variant="outline">
                                <Upload className="w-4 h-4 mr-2" />
                                Choose File
                              </Button>
                              <p className="text-xs text-gray-500 mt-2">PNG, JPG 1200x400px recommended</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Brand Colors</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="primaryColor">Primary Color</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="color"
                              id="primaryColor"
                              value={branding.brandColors.primary}
                              onChange={(e) => updateBranding({
                                brandColors: { ...branding.brandColors, primary: e.target.value }
                              })}
                              className="w-10 h-10 rounded border"
                            />
                            <Input
                              value={branding.brandColors.primary}
                              onChange={(e) => updateBranding({
                                brandColors: { ...branding.brandColors, primary: e.target.value }
                              })}
                              placeholder="#16a085"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="secondaryColor">Secondary Color</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="color"
                              id="secondaryColor"
                              value={branding.brandColors.secondary}
                              onChange={(e) => updateBranding({
                                brandColors: { ...branding.brandColors, secondary: e.target.value }
                              })}
                              className="w-10 h-10 rounded border"
                            />
                            <Input
                              value={branding.brandColors.secondary}
                              onChange={(e) => updateBranding({
                                brandColors: { ...branding.brandColors, secondary: e.target.value }
                              })}
                              placeholder="#2c3e50"
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="accentColor">Accent Color</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="color"
                              id="accentColor"
                              value={branding.brandColors.accent}
                              onChange={(e) => updateBranding({
                                brandColors: { ...branding.brandColors, accent: e.target.value }
                              })}
                              className="w-10 h-10 rounded border"
                            />
                            <Input
                              value={branding.brandColors.accent}
                              onChange={(e) => updateBranding({
                                brandColors: { ...branding.brandColors, accent: e.target.value }
                              })}
                              placeholder="#f39c12"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateBranding({ brandColors: DEFAULT_COLORS })}
                      >
                        Reset to Default Colors
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={branding.phone || ""}
                            onChange={(e) => updateBranding({ phone: e.target.value })}
                            placeholder="+44 123 456 7890"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">Business Email</Label>
                          <Input
                            id="email"
                            value={branding.email || ""}
                            onChange={(e) => updateBranding({ email: e.target.value })}
                            placeholder="info@yourgolfacademy.com"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div>
                          <Label>Show Contact Information</Label>
                          <p className="text-sm text-gray-600">Display contact info on your public profile</p>
                        </div>
                        <Switch
                          checked={branding.showContactInfo}
                          onCheckedChange={(checked: boolean) => updateBranding({ showContactInfo: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Social Media Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Facebook className="w-5 h-5 text-blue-600" />
                          <Input
                            value={branding.socialLinks.facebook}
                            onChange={(e) => updateBranding({
                              socialLinks: { ...branding.socialLinks, facebook: e.target.value }
                            })}
                            placeholder="https://facebook.com/yourgolfacademy"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <Instagram className="w-5 h-5 text-pink-600" />
                          <Input
                            value={branding.socialLinks.instagram}
                            onChange={(e) => updateBranding({
                              socialLinks: { ...branding.socialLinks, instagram: e.target.value }
                            })}
                            placeholder="https://instagram.com/yourgolfacademy"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <Twitter className="w-5 h-5 text-blue-400" />
                          <Input
                            value={branding.socialLinks.twitter}
                            onChange={(e) => updateBranding({
                              socialLinks: { ...branding.socialLinks, twitter: e.target.value }
                            })}
                            placeholder="https://twitter.com/yourgolfacademy"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <Linkedin className="w-5 h-5 text-blue-700" />
                          <Input
                            value={branding.socialLinks.linkedin}
                            onChange={(e) => updateBranding({
                              socialLinks: { ...branding.socialLinks, linkedin: e.target.value }
                            })}
                            placeholder="https://linkedin.com/company/yourgolfacademy"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <Youtube className="w-5 h-5 text-red-600" />
                          <Input
                            value={branding.socialLinks.youtube}
                            onChange={(e) => updateBranding({
                              socialLinks: { ...branding.socialLinks, youtube: e.target.value }
                            })}
                            placeholder="https://youtube.com/yourgolfacademy"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t">
                        <div>
                          <Label>Show Social Media Links</Label>
                          <p className="text-sm text-gray-600">Display social links on your public profile</p>
                        </div>
                        <Switch
                          checked={branding.showSocialLinks}
                          onCheckedChange={(checked: boolean) => updateBranding({ showSocialLinks: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Domain Tab */}
                <TabsContent value="domain" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Custom Domain
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="customDomain">Custom Domain</Label>
                        <Input
                          id="customDomain"
                          value={branding.customDomain || ""}
                          onChange={(e) => updateBranding({ customDomain: e.target.value })}
                          placeholder="yourgolfacademy.com"
                          className="mt-1"
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          Set up a custom domain for your professional storefront
                        </p>
                      </div>

                      <Alert>
                        <Globe className="w-4 h-4" />
                        <AlertDescription>
                          After setting up your custom domain, you'll need to configure DNS settings with your domain provider. Contact support for assistance.
                        </AlertDescription>
                      </Alert>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Default URL</h4>
                        <p className="text-blue-800 text-sm">
                          clubup.com/pro/{session.user?.name?.toLowerCase().replace(/\s+/g, '-')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Live Preview
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={previewDevice === "desktop" ? "default" : "outline"}
                        onClick={() => setPreviewDevice("desktop")}
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={previewDevice === "tablet" ? "default" : "outline"}
                        onClick={() => setPreviewDevice("tablet")}
                      >
                        <Tablet className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={previewDevice === "mobile" ? "default" : "outline"}
                        onClick={() => setPreviewDevice("mobile")}
                      >
                        <Smartphone className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`border rounded-lg overflow-hidden ${
                    previewDevice === "desktop" ? "w-full" :
                    previewDevice === "tablet" ? "w-3/4 mx-auto" :
                    "w-1/2 mx-auto"
                  }`}>
                    {/* Preview Header */}
                    <div
                      className="p-6 text-white relative"
                      style={{
                        backgroundColor: branding.brandColors.primary,
                        backgroundImage: branding.bannerUrl ? `url(${branding.bannerUrl})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {branding.bannerUrl && (
                        <div className="absolute inset-0 bg-black/40"></div>
                      )}
                      <div className="relative">
                        <div className="flex items-center gap-4 mb-4">
                          {branding.logoUrl ? (
                            <img
                              src={branding.logoUrl}
                              alt="Logo"
                              className="h-12 w-auto"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <Crown className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <h2 className="text-xl font-bold">{branding.businessName || "Your Business Name"}</h2>
                            {branding.tagline && (
                              <p className="text-white/90">{branding.tagline}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Content */}
                    <div className="p-6 bg-white">
                      {branding.description && (
                        <p className="text-gray-600 mb-4">{branding.description}</p>
                      )}

                      <div className="space-y-3">
                        {branding.showContactInfo && (
                          <div className="space-y-2">
                            {branding.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span>{branding.phone}</span>
                              </div>
                            )}
                            {branding.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span>{branding.email}</span>
                              </div>
                            )}
                            {branding.website && (
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-gray-500" />
                                <span className="text-blue-600">{branding.website}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {branding.showSocialLinks && (
                          <div className="flex items-center gap-3 pt-3 border-t">
                            {branding.socialLinks.facebook && (
                              <Facebook className="w-5 h-5 text-blue-600" />
                            )}
                            {branding.socialLinks.instagram && (
                              <Instagram className="w-5 h-5 text-pink-600" />
                            )}
                            {branding.socialLinks.twitter && (
                              <Twitter className="w-5 h-5 text-blue-400" />
                            )}
                            {branding.socialLinks.linkedin && (
                              <Linkedin className="w-5 h-5 text-blue-700" />
                            )}
                            {branding.socialLinks.youtube && (
                              <Youtube className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Sample Products */}
                      <div className="mt-6 pt-6 border-t">
                        <h3 className="font-semibold mb-3">Featured Equipment</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="border rounded p-3">
                            <div className="w-full h-20 bg-gray-100 rounded mb-2"></div>
                            <p className="text-sm font-medium">Sample Product</p>
                            <p className="text-xs text-gray-600">£250</p>
                          </div>
                          <div className="border rounded p-3">
                            <div className="w-full h-20 bg-gray-100 rounded mb-2"></div>
                            <p className="text-sm font-medium">Sample Product</p>
                            <p className="text-xs text-gray-600">£450</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Branding Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Professional storefront appearance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Custom domain support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Social media integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Increased customer trust</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Brand consistency across all listings</span>
                    </div>
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
