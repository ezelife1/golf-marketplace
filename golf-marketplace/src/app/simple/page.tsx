import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-xl font-bold">ClubUp</span>
            </div>
            <div className="space-x-4">
              <Button variant="outline">Sign In</Button>
              <Button>Sign Up</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Elevate Your <span className="text-yellow-300">Golf Game</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            The premier marketplace for premium golf equipment. Buy, sell, and discover exceptional gear.
          </p>
          <div className="space-x-4">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Start Shopping
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Sell Equipment
            </Button>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Membership</h2>
            <p className="text-xl text-gray-600">
              Start with a FREE trial • Cancel anytime
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Free</CardTitle>
                <div className="text-3xl font-bold">£0</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    5% commission
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Basic listings
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-green-500">
              <div className="bg-green-500 text-white text-center py-2 text-sm font-medium">
                Most Popular
              </div>
              <CardHeader className="text-center">
                <CardTitle>Pro</CardTitle>
                <div className="text-3xl font-bold text-green-600">£7</div>
                <div className="text-sm text-gray-500">/month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    3% commission
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Enhanced listings
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Priority support
                  </li>
                </ul>
                <Button className="w-full mt-6">
                  Start FREE Trial
                </Button>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Business</CardTitle>
                <div className="text-3xl font-bold">£22</div>
                <div className="text-sm text-gray-500">/month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    3% commission
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Premium storefront
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Business analytics
                  </li>
                </ul>
                <Button className="w-full mt-6">
                  Start FREE Trial
                </Button>
              </CardContent>
            </Card>

            {/* PGA Pro Plan */}
            <Card className="border-2 border-yellow-500">
              <div className="bg-yellow-500 text-white text-center py-2 text-sm font-medium">
                PGA Professional
              </div>
              <CardHeader className="text-center">
                <CardTitle>PGA Pro</CardTitle>
                <div className="text-3xl font-bold text-yellow-600">£45</div>
                <div className="text-sm text-gray-500">/month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    1% commission
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    PGA Pro badge
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Exclusive access
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600">
                  Start 2-Month FREE Trial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of golfers buying and selling premium equipment
          </p>
          <div className="space-x-4">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Browse Equipment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              List Your Gear
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-bold">ClubUp</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 ClubUp. The premier golf equipment marketplace.
          </p>
        </div>
      </footer>
    </div>
  )
}
