"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ExternalLink } from "lucide-react"

interface BannerAdProps {
  placement: "homepage" | "search_results" | "product_page" | "sidebar"
  size: "small" | "medium" | "large" | "leaderboard"
  className?: string
}

interface AdData {
  id: string
  title: string
  company: string
  headline: string
  description: string
  imageUrl: string
  ctaText: string
  landingUrl: string
  sponsored: boolean
}

// Mock ad data - in real app, this would come from your API based on placement and targeting
const getAdForPlacement = (placement: string, size: string): AdData | null => {
  const ads: AdData[] = [
    {
      id: "1",
      title: "TaylorMade SIM2 Campaign",
      company: "TaylorMade Golf",
      headline: "Revolutionary SIM2 Driver Technology",
      description: "Experience maximum distance and forgiveness with our latest innovation",
      imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=300&fit=crop",
      ctaText: "Shop TaylorMade",
      landingUrl: "https://taylormade.com",
      sponsored: true
    },
    {
      id: "2",
      title: "Callaway Apex Promotion",
      company: "Callaway Golf",
      headline: "Precision Forged Apex Irons",
      description: "Feel the difference with tour-level performance and workability",
      imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=300&fit=crop",
      ctaText: "Learn More",
      landingUrl: "https://callaway.com",
      sponsored: true
    },
    {
      id: "3",
      title: "Golf Galaxy Equipment Sale",
      company: "Golf Galaxy",
      headline: "Winter Equipment Clearance",
      description: "Save up to 40% on premium golf equipment from top brands",
      imageUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&h=300&fit=crop",
      ctaText: "Shop Sale",
      landingUrl: "https://golfgalaxy.com",
      sponsored: true
    }
  ]

  // Simple rotation - in real app, this would be more sophisticated targeting
  const adIndex = Math.floor(Math.random() * ads.length)
  return ads[adIndex]
}

const getSizeClasses = (size: string) => {
  switch (size) {
    case "small":
      return "h-24 w-full max-w-sm"
    case "medium":
      return "h-32 w-full max-w-md"
    case "large":
      return "h-48 w-full max-w-lg"
    case "leaderboard":
      return "h-24 w-full max-w-4xl"
    default:
      return "h-32 w-full max-w-md"
  }
}

export function BannerAd({ placement, size, className = "" }: BannerAdProps) {
  const [ad, setAd] = useState<AdData | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false)

  useEffect(() => {
    // Load ad based on placement and user targeting
    const adData = getAdForPlacement(placement, size)
    setAd(adData)
  }, [placement, size])

  useEffect(() => {
    // Track impression when ad becomes visible
    if (ad && !hasTrackedImpression && isVisible) {
      // In real app, send impression tracking to analytics
      console.log(`Ad impression tracked: ${ad.id} at ${placement}`)
      setHasTrackedImpression(true)
    }
  }, [ad, hasTrackedImpression, isVisible, placement])

  const handleAdClick = () => {
    if (!ad) return

    // Track click event
    console.log(`Ad clicked: ${ad.id} at ${placement}`)

    // Open in new tab
    window.open(ad.landingUrl, '_blank', 'noopener,noreferrer')
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!ad || !isVisible) {
    return null
  }

  const sizeClasses = getSizeClasses(size)

  if (size === "leaderboard") {
    return (
      <Card className={`relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-yellow-400 ${sizeClasses} ${className}`}>
        <div className="flex h-full">
          <div className="w-32 flex-shrink-0">
            <img
              src={ad.imageUrl}
              alt={ad.headline}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 p-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                  Sponsored
                </Badge>
                <span className="text-xs text-gray-500">{ad.company}</span>
              </div>
              <h3 className="font-semibold text-sm mb-1">{ad.headline}</h3>
              <p className="text-xs text-gray-600 line-clamp-1">{ad.description}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button size="sm" onClick={handleAdClick} className="bg-primary hover:bg-primary/90">
                {ad.ctaText}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${sizeClasses} ${className}`}>
      <div className="absolute top-2 left-2 z-10">
        <Badge variant="outline" className="text-xs bg-white/90 text-yellow-700 border-yellow-300">
          Sponsored
        </Badge>
      </div>
      <div className="absolute top-2 right-2 z-10">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleClose}
          className="text-white bg-black/20 hover:bg-black/40 w-6 h-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="relative h-full" onClick={handleAdClick}>
        <img
          src={ad.imageUrl}
          alt={ad.headline}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">{ad.headline}</h3>
              <p className="text-xs opacity-90 line-clamp-2">{ad.description}</p>
            </div>
            <Button size="sm" variant="secondary" className="ml-3">
              {ad.ctaText}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function SponsoredListingAd({
  product,
  placement
}: {
  product: any
  placement: string
}) {
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false)

  useEffect(() => {
    if (!hasTrackedImpression) {
      console.log(`Sponsored listing impression: ${product.id} at ${placement}`)
      setHasTrackedImpression(true)
    }
  }, [hasTrackedImpression, product.id, placement])

  const handleClick = () => {
    console.log(`Sponsored listing clicked: ${product.id} at ${placement}`)
  }

  return (
    <div className="relative" onClick={handleClick}>
      <div className="absolute top-2 left-2 z-10">
        <Badge className="text-xs bg-blue-500 text-white">
          Sponsored
        </Badge>
      </div>
      {/* This would wrap around existing product card component */}
      <div className="border-2 border-blue-200 rounded-lg">
        {/* Product card content */}
      </div>
    </div>
  )
}

export function CategorySponsorBanner({
  category,
  sponsor
}: {
  category: string
  sponsor: { name: string; logo: string; url: string }
}) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={sponsor.logo}
            alt={sponsor.name}
            className="w-12 h-12 object-contain rounded"
          />
          <div>
            <p className="text-sm text-gray-600">This {category} section is sponsored by</p>
            <p className="font-semibold text-blue-800">{sponsor.name}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(sponsor.url, '_blank')}
        >
          Visit Store
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </Card>
  )
}

// Newsletter ad component
export function NewsletterAd({ ad }: { ad: AdData }) {
  return (
    <Card className="my-6 border-l-4 border-l-green-400">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
            Partner Spotlight
          </Badge>
          <span className="text-xs text-gray-500">{ad.company}</span>
        </div>
        <h3 className="font-semibold mb-2">{ad.headline}</h3>
        <p className="text-sm text-gray-600 mb-3">{ad.description}</p>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => window.open(ad.landingUrl, '_blank')}
        >
          {ad.ctaText}
        </Button>
      </div>
    </Card>
  )
}
