"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Star } from "lucide-react"

export function HeroBannerAd() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 relative shadow-sm">
      <Badge className="absolute top-2 right-2 bg-gray-100 text-gray-600 text-xs">
        SPONSORED
      </Badge>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold mb-1 text-gray-900">TaylorMade Spring Collection</h3>
          <p className="text-gray-600 text-sm mb-2">New Stealth 2 Series - Up to 25% Off</p>
          <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
            Shop Now
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">25% OFF</div>
          <div className="text-xs text-gray-500">Limited Time</div>
        </div>
      </div>
    </div>
  )
}

export function SidebarAd() {
  return (
    <Card className="border border-gray-200 bg-gray-50">
      <CardContent className="p-4">
        <Badge className="mb-2 bg-gray-100 text-gray-600 text-xs">
          FEATURED PARTNER
        </Badge>
        <h4 className="font-bold text-gray-900 mb-1">Callaway Golf</h4>
        <p className="text-sm text-gray-600 mb-3">
          Discover the new Paradym drivers with breakthrough technology
        </p>
        <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
          Learn More
        </Button>
      </CardContent>
    </Card>
  )
}

export function InlineBannerAd() {
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg my-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-gray-700">P</span>
          </div>
          <div>
            <Badge className="mb-1 bg-gray-100 text-gray-600 text-xs">
              PREMIUM SPONSOR
            </Badge>
            <h3 className="text-xl font-bold text-gray-900">PING Golf Equipment</h3>
            <p className="text-gray-600">Custom fitting available at 500+ locations</p>
          </div>
        </div>
        <div className="text-center">
          <Button className="bg-primary text-white hover:bg-primary/90 font-bold">
            Find a Fitter
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SectionSponsorAd() {
  return (
    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-gray-100 text-gray-600 text-xs">
            SECTION SPONSOR
          </Badge>
          <span className="text-lg font-semibold text-gray-900">Titleist Pro V1</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm text-gray-600">4.9/5 Rating</span>
          </div>
        </div>
        <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
          Shop Balls
        </Button>
      </div>
    </div>
  )
}

export function NewsletterSponsorAd() {
  return (
    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-4">
      <div className="flex items-center justify-between">
        <div>
          <Badge className="mb-1 bg-gray-100 text-gray-600 text-xs">
            NEWSLETTER SPONSOR
          </Badge>
          <h4 className="font-bold text-gray-900">Cobra Golf Drivers</h4>
          <p className="text-sm text-gray-600">Experience RADSPEED technology</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary">£299</div>
          <div className="text-xs text-gray-500">Was £399</div>
        </div>
      </div>
    </div>
  )
}

export function CategorySponsorBanner() {
  return (
    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Badge className="bg-gray-100 text-gray-600 text-xs">
          CATEGORY SPONSOR
        </Badge>
        <span className="font-semibold text-gray-900">Wilson Staff</span>
        <span className="text-sm text-gray-600">Official Partner</span>
      </div>
      <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
        View Range
      </Button>
    </div>
  )
}

export function FloatingAd() {
  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <Card className="border border-gray-200 bg-white shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-gray-100 text-gray-600 text-xs">
              SPONSORED
            </Badge>
            <button className="text-gray-400 hover:text-gray-600 text-lg leading-none">
              ×
            </button>
          </div>
          <h4 className="font-bold text-gray-900 mb-1">Mizuno Irons</h4>
          <p className="text-sm text-gray-600 mb-3">
            Precision forged for better players
          </p>
          <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white">
            Shop Mizuno
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function TopBannerAd() {
  return (
    <div className="bg-gray-100 border-b border-gray-200 py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge className="bg-primary text-white text-xs font-bold">
            FEATURED BRAND
          </Badge>
          <span className="text-sm text-gray-700">
            <strong>Cleveland Golf:</strong> New RTX ZipCore Wedges - Tour Proven Performance
          </span>
        </div>
        <Button size="sm" className="bg-primary text-white hover:bg-primary/90 font-bold">
          Shop Wedges
        </Button>
      </div>
    </div>
  )
}
