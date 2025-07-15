import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import {
  Search,
  Home,
  ArrowLeft,
  MessageCircle,
  Trophy,
  Users,
  Camera
} from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Graphic */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-green-600 mb-4">404</div>
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold mb-4">Oops! This page is out of bounds</h1>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for has gone missing, just like a golf ball in the rough.
            Let's get you back on the fairway!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/">
              <Button size="lg" className="px-8">
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>

            <Link href="/search">
              <Button size="lg" variant="outline" className="px-8">
                <Search className="w-5 h-5 mr-2" />
                Browse Equipment
              </Button>
            </Link>
          </div>

          {/* Helpful Links */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Popular Destinations</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/search" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Search className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Search Equipment</div>
                    <div className="text-sm text-gray-600">Find golf gear</div>
                  </div>
                </Link>

                <Link href="/sell/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Sell Equipment</div>
                    <div className="text-sm text-gray-600">List your gear</div>
                  </div>
                </Link>

                <Link href="/featured" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <div className="text-left">
                    <div className="font-medium">Featured Listings</div>
                    <div className="text-sm text-gray-600">Premium equipment</div>
                  </div>
                </Link>

                <Link href="/auth/signup" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">Join ClubUp</div>
                    <div className="text-sm text-gray-600">Start your trial</div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Still can't find what you're looking for?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Our support team is here to help you navigate ClubUp
            </p>
            <Link href="/contact">
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
