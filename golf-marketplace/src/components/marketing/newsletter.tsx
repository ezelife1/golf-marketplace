"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  CheckCircle,
  Gift,
  TrendingDown,
  Star,
  Bell,
  X,
  ArrowRight
} from "lucide-react"

interface NewsletterSignupProps {
  variant?: 'inline' | 'popup' | 'sidebar' | 'footer'
  incentive?: {
    type: 'discount' | 'freebie' | 'early_access'
    value: string
    description: string
  }
  className?: string
}

interface EmailPreferences {
  newsletters: boolean
  priceAlerts: boolean
  newListings: boolean
  promotions: boolean
  marketingEmails: boolean
}

export function NewsletterSignup({
  variant = 'inline',
  incentive,
  className = ""
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [preferences, setPreferences] = useState<EmailPreferences>({
    newsletters: true,
    priceAlerts: false,
    newListings: false,
    promotions: true,
    marketingEmails: false
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    try {
      // In real app, call your email service API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      console.log('Newsletter subscription:', { email, preferences })
      setIsSubmitted(true)
    } catch (error) {
      console.error('Newsletter signup failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreference = (key: keyof EmailPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (isSubmitted) {
    return (
      <Card className={`bg-green-50 border-green-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Welcome to the ClubUp Community!
          </h3>
          <p className="text-green-700 text-sm mb-4">
            Check your email for a confirmation link and your welcome offer.
          </p>
          {incentive && (
            <Badge className="bg-green-600 text-white">
              {incentive.value} {incentive.description}
            </Badge>
          )}
        </CardContent>
      </Card>
    )
  }

  if (variant === 'popup') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => {/* Handle close */}}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="text-center">
              {incentive && (
                <div className="mb-4">
                  <Badge className="bg-primary text-white text-lg px-4 py-2">
                    {incentive.value} OFF
                  </Badge>
                </div>
              )}
              <CardTitle className="text-xl">Join the Golf Community</CardTitle>
              <p className="text-gray-600 mt-2">
                Get exclusive deals, equipment alerts, and golf tips delivered to your inbox
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-center"
              />

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletters"
                    checked={preferences.newsletters}
                    onCheckedChange={(checked) => updatePreference('newsletters', checked as boolean)}
                  />
                  <label htmlFor="newsletters" className="text-sm">
                    Weekly newsletter with featured equipment
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="priceAlerts"
                    checked={preferences.priceAlerts}
                    onCheckedChange={(checked) => updatePreference('priceAlerts', checked as boolean)}
                  />
                  <label htmlFor="priceAlerts" className="text-sm">
                    Price drop alerts on watched items
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="promotions"
                    checked={preferences.promotions}
                    onCheckedChange={(checked) => updatePreference('promotions', checked as boolean)}
                  />
                  <label htmlFor="promotions" className="text-sm">
                    Exclusive offers and promotions
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Subscribing..." : "Join ClubUp Community"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <Card className={`bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Stay Updated</h3>
          </div>

          {incentive && (
            <div className="bg-blue-600 text-white rounded-lg p-2 mb-3 text-center">
              <p className="text-sm font-medium">{incentive.value}</p>
              <p className="text-xs">{incentive.description}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-sm"
            />
            <Button
              type="submit"
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "..." : "Subscribe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={className}>
        <h3 className="font-semibold text-white mb-4">Newsletter</h3>
        <p className="text-gray-300 text-sm mb-4">
          Get weekly equipment picks, exclusive deals, and golf tips.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "..." : "Subscribe"}
          </Button>
        </form>

        {incentive && (
          <p className="text-xs text-yellow-300 mt-2">
            New subscribers get {incentive.value} off their first purchase!
          </p>
        )}
      </div>
    )
  }

  // Inline variant (default)
  return (
    <Card className={`bg-gradient-to-r from-primary/10 to-blue-50 border-primary/20 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-primary" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-primary mb-2">
              Join 50,000+ Golf Enthusiasts
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Get weekly equipment picks, exclusive deals, and tips to improve your game.
            </p>

            {incentive && (
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-4 h-4 text-green-600" />
                <Badge className="bg-green-100 text-green-800">
                  {incentive.value} {incentive.description}
                </Badge>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "..." : "Subscribe"}
              </Button>
            </form>

            <p className="text-xs text-gray-500 mt-2">
              Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function EmailCampaignPreview({
  campaign
}: {
  campaign: {
    subject: string
    preview: string
    content: any
    cta: { text: string; url: string }
  }
}) {
  return (
    <div className="max-w-2xl mx-auto bg-white border rounded-lg overflow-hidden">
      {/* Email Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <p className="font-semibold">ClubUp Golf</p>
            <p className="text-sm text-gray-600">hello@clubup.golf</p>
          </div>
        </div>
        <h2 className="font-semibold mt-3">{campaign.subject}</h2>
        <p className="text-sm text-gray-600">{campaign.preview}</p>
      </div>

      {/* Email Content */}
      <div className="p-6">
        {campaign.content}

        {/* CTA */}
        <div className="text-center mt-8">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            {campaign.cta.text}
          </Button>
        </div>
      </div>

      {/* Email Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            You're receiving this because you subscribed to ClubUp updates.
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <button className="text-xs text-gray-500 hover:text-gray-700">
              Update Preferences
            </button>
            <button className="text-xs text-gray-500 hover:text-gray-700">
              Unsubscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Social proof component for newsletter
export function NewsletterSocialProof() {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <div className="text-center">
        <div className="text-lg font-bold text-primary">50K+</div>
        <div className="text-xs text-gray-600">Subscribers</div>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <div className="text-xs text-gray-600">4.8/5 Rating</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">£2.5M</div>
        <div className="text-xs text-gray-600">Saved by Members</div>
      </div>
    </div>
  )
}
