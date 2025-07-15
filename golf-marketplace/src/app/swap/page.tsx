import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ArrowRightLeft, Star, Heart, MessageCircle, TrendingUp, Shield, Clock, Crown } from "lucide-react"
import Link from "next/link"

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden luxury-gradient text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Equipment <span className="gold-accent">Swap</span> Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Trade your golf equipment with other Pro+ members. Upgrade your game
              without the full cost of buying new.
            </p>
            <Badge className="bg-primary text-white px-4 py-2 text-lg mb-6">
              <Crown className="w-5 h-5 mr-2" />
              Pro+ Members Only
            </Badge>
          </div>
        </div>
      </section>

      {/* How Swapping Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How Equipment Swapping Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and fair equipment exchanges between verified Pro+ members
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold mb-2">List Your Equipment</h3>
                <p className="text-gray-600 text-sm">Post items you want to trade with detailed photos and condition reports</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-semibold mb-2">Browse & Match</h3>
                <p className="text-gray-600 text-sm">Find equipment you want and propose trades with other members</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">Negotiate & Agree</h3>
                <p className="text-gray-600 text-sm">Use our secure messaging to negotiate terms and value differences</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">4</span>
                </div>
                <h3 className="font-semibold mb-2">Secure Exchange</h3>
                <p className="text-gray-600 text-sm">ClubUp facilitates the exchange with authentication and shipping</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Swap Fees */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Swap Service Fees</h2>
            <p className="text-xl text-gray-600">Transparent pricing for secure equipment exchanges</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Swap */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Basic Swap</CardTitle>
                <CardDescription>Standard equipment exchange</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-primary">£15</span>
                  <span className="text-gray-500">/exchange</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Authentication verification</li>
                  <li>• Secure messaging platform</li>
                  <li>• Basic condition assessment</li>
                  <li>• Standard shipping coordination</li>
                  <li>• 30-day exchange protection</li>
                </ul>
                <Button className="w-full mt-6">Start Basic Swap</Button>
              </CardContent>
            </Card>

            {/* Premium Swap */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <ArrowRightLeft className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Premium Swap</CardTitle>
                <CardDescription>Enhanced exchange with pro services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-primary">£27</span>
                  <span className="text-gray-500">/exchange</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Professional authentication</li>
                  <li>• Detailed condition reports</li>
                  <li>• Value assessment & matching</li>
                  <li>• White-glove shipping service</li>
                  <li>• 60-day exchange protection</li>
                  <li>• Priority customer support</li>
                </ul>
                <Button className="w-full mt-6 bg-primary hover:bg-primary/90">Start Premium Swap</Button>
              </CardContent>
            </Card>

            {/* Concierge Swap */}
            <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="text-center">
                <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Concierge Swap</CardTitle>
                <CardDescription>Full-service white-glove exchange</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-primary">£51</span>
                  <span className="text-gray-500">/exchange</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Expert equipment matching</li>
                  <li>• Personal swap coordinator</li>
                  <li>• Professional cleaning/prep</li>
                  <li>• Insured shipping & handling</li>
                  <li>• 90-day exchange protection</li>
                  <li>• Equipment optimization advice</li>
                  <li>• Concierge customer service</li>
                </ul>
                <Button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Start Concierge Swap
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Current Swap Listings */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4">Available for Swap</h2>
              <p className="text-xl text-gray-600">Premium equipment ready for exchange</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/swap/browse">Browse All Swaps</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Swap Listing Examples */}
            {[
              {
                title: "TaylorMade SIM2 Driver",
                condition: "Excellent",
                seeking: "Callaway Epic Driver",
                value: "£256",
                owner: "ProGolfer123",
                rating: 4.9
              },
              {
                title: "Scotty Cameron Putter",
                condition: "Very Good",
                seeking: "Odyssey Putters",
                value: "£224",
                owner: "GolfEnthusiast",
                rating: 4.8
              },
              {
                title: "Ping G425 Iron Set",
                condition: "Good",
                seeking: "TaylorMade Irons",
                value: "£680",
                owner: "CourseKing",
                rating: 5.0
              },
              {
                title: "Titleist Pro V1 Bag",
                condition: "Excellent",
                seeking: "Sun Mountain Bags",
                value: "£360",
                owner: "GolfCollector",
                rating: 4.7
              }
            ].map((item, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Swap Item Image</span>
                  </div>
                  <Badge className="absolute top-3 left-3 bg-blue-500 text-white">
                    For Swap
                  </Badge>
                  <Button variant="ghost" size="sm" className="absolute top-3 right-3 bg-white/80 hover:bg-white">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">({item.rating})</span>
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">Condition: {item.condition}</p>
                  <p className="text-gray-600 text-sm mb-3">Seeking: {item.seeking}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-primary">{item.value}</span>
                    <span className="text-sm text-gray-500">@{item.owner}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Propose Swap
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Swap Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Swap Instead of Buy?</h2>
            <p className="text-xl text-gray-600">Discover the advantages of equipment swapping</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Better Value</h3>
                <p className="text-gray-600">
                  Get premium equipment at a fraction of the cost. Trade up without breaking the bank.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Verified Quality</h3>
                <p className="text-gray-600">
                  All swap items are authenticated and verified by our expert team before exchange.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Try Before Commit</h3>
                <p className="text-gray-600">
                  Test different brands and models to find your perfect fit without long-term commitment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Membership Upgrade CTA */}
      <section className="py-20 luxury-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <Crown className="w-16 h-16 mx-auto mb-6 gold-accent" />
          <h2 className="text-4xl font-bold mb-4">Unlock Equipment Swapping</h2>
          <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Upgrade to Pro+ membership to access our exclusive equipment swap marketplace
            and start trading with verified golf enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              Upgrade to Pro+
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
