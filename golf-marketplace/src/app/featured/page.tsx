import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Zap, Eye, Star, ArrowUp, Clock, Users } from "lucide-react"
import Link from "next/link"

export default function FeaturedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden luxury-gradient text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Featured <span className="gold-accent">Listings</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Boost your equipment sales with premium placement and enhanced visibility.
              Reach serious buyers faster with our featured listing packages.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Bump Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">⚡ Quick Bump Feature</h2>
            <p className="text-lg text-gray-600 mb-8">
              Need instant visibility? Bump your listing to the top of search results and category pages
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">£2.50</div>
                  <div className="font-semibold mb-2">1-Hour Bump</div>
                  <div className="text-sm text-gray-600 mb-4">Top placement for 1 hour</div>
                  <Button size="sm" className="w-full">Quick Bump</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-2 border-blue-500">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">£6</div>
                  <div className="font-semibold mb-2">6-Hour Bump</div>
                  <div className="text-sm text-gray-600 mb-4">Top placement for 6 hours</div>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">Power Bump</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">£12</div>
                  <div className="font-semibold mb-2">24-Hour Bump</div>
                  <div className="text-sm text-gray-600 mb-4">Top placement for full day</div>
                  <Button size="sm" className="w-full">Mega Bump</Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-4 bg-white/60 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-gray-600">
                <strong>How it works:</strong> Your listing instantly moves to the top of relevant search results and category pages.
                Perfect for when you need immediate attention for time-sensitive sales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listing Packages */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Premium Listing Packages</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Long-term visibility solutions with enhanced features and extended placement
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Basic Featured */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Basic Featured</CardTitle>
                <CardDescription>Essential visibility boost</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">£6</span>
                  <span className="text-gray-500">/7 days</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                  <li>• 3x more visibility</li>
                  <li>• Category page priority</li>
                  <li>• "Featured" badge</li>
                  <li>• Basic analytics</li>
                </ul>
                <Button className="w-full" variant="outline">Feature Listing</Button>
              </CardContent>
            </Card>

            {/* Premium Featured */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Premium Featured</CardTitle>
                <CardDescription>Maximum exposure package</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">£14</span>
                  <span className="text-gray-500">/14 days</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                  <li>• 8x more visibility</li>
                  <li>• Homepage featured slot</li>
                  <li>• Search result priority</li>
                  <li>• Social media promotion</li>
                  <li>• Advanced analytics</li>
                  <li>• "Premium" gold badge</li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90">Feature Premium</Button>
              </CardContent>
            </Card>

            {/* Spotlight Featured */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Spotlight Featured</CardTitle>
                <CardDescription>Elite positioning</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">£28</span>
                  <span className="text-gray-500">/30 days</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                  <li>• 15x more visibility</li>
                  <li>• Exclusive spotlight banner</li>
                  <li>• Email newsletter feature</li>
                  <li>• Multiple category placement</li>
                  <li>• Professional photography</li>
                  <li>• Priority customer support</li>
                </ul>
                <Button className="w-full" variant="outline">Get Spotlight</Button>
              </CardContent>
            </Card>

            {/* Ultra Featured */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Ultra Featured</CardTitle>
                <CardDescription>Ultimate premium package</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">£52</span>
                  <span className="text-gray-500">/60 days</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                  <li>• Maximum visibility boost</li>
                  <li>• Dedicated landing page</li>
                  <li>• Video showcase feature</li>
                  <li>• Influencer promotion</li>
                  <li>• White-glove listing service</li>
                  <li>• Personal account manager</li>
                  <li>• Custom promotional campaigns</li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
                  Go Ultra
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Performance Stats */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Featured Listing Performance</h2>
            <p className="text-xl text-gray-600">Real results from sellers using our featured listings</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-6">
              <div className="text-4xl font-bold text-primary mb-2">3.2x</div>
              <div className="text-lg font-semibold mb-1">Faster Sales</div>
              <div className="text-gray-600">Average time to sale</div>
            </Card>

            <Card className="text-center p-6">
              <div className="text-4xl font-bold text-primary mb-2">87%</div>
              <div className="text-lg font-semibold mb-1">More Views</div>
              <div className="text-gray-600">Increase in listing views</div>
            </Card>

            <Card className="text-center p-6">
              <div className="text-4xl font-bold text-primary mb-2">$420</div>
              <div className="text-lg font-semibold mb-1">Higher Prices</div>
              <div className="text-gray-600">Average price increase</div>
            </Card>

            <Card className="text-center p-6">
              <div className="text-4xl font-bold text-primary mb-2">94%</div>
              <div className="text-lg font-semibold mb-1">Satisfaction</div>
              <div className="text-gray-600">Seller satisfaction rate</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Current Featured Listings */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-4">Current Featured Listings</h2>
              <p className="text-xl text-gray-600">See what premium placement looks like</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products">View All Featured</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Featured Product Examples */}
            {[
              {
                title: "Rare 1987 MacGregor Driver",
                price: "£2,000",
                badge: "Ultra Featured",
                badgeColor: "bg-gradient-to-r from-purple-500 to-pink-500",
                views: "1,247",
                inquiries: "23"
              },
              {
                title: "Tour-Used Scotty Cameron",
                price: "£1,480",
                badge: "Premium Featured",
                badgeColor: "bg-primary",
                views: "892",
                inquiries: "18"
              },
              {
                title: "Complete Callaway Set",
                price: "£2,240",
                badge: "Spotlight Featured",
                badgeColor: "bg-yellow-500",
                views: "643",
                inquiries: "12"
              }
            ].map((item, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Featured Product Image</span>
                  </div>
                  <Badge className={`absolute top-3 left-3 ${item.badgeColor} text-white`}>
                    {item.badge}
                  </Badge>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                    <Eye className="w-3 h-3 inline mr-1" />
                    {item.views}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-primary">{item.price}</span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {item.inquiries} inquiries
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">Contact Seller</Button>
                    <Button size="sm" variant="outline">
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Revenue Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Additional Promotion Options</h2>
            <p className="text-xl text-gray-600">Maximize your reach with these add-on services</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Social Media Boost */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Social Media Boost</CardTitle>
                <CardDescription>Promote across our social channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Instagram story feature</span>
                    <span className="font-semibold">£12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Facebook post feature</span>
                    <span className="font-semibold">£20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Full social package</span>
                    <span className="font-semibold">£36</span>
                  </div>
                  <Button className="w-full mt-4">Boost on Social</Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Newsletter Feature */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Newsletter Feature</CardTitle>
                <CardDescription>Reach 50,000+ golf enthusiasts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Product spotlight</span>
                    <span className="font-semibold">£60</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dedicated email blast</span>
                    <span className="font-semibold">£120</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly newsletter series</span>
                    <span className="font-semibold">£240</span>
                  </div>
                  <Button className="w-full mt-4">Feature in Newsletter</Button>
                </div>
              </CardContent>
            </Card>

            {/* Professional Photography */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Pro Photography</CardTitle>
                <CardDescription>Professional product photography service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Basic photo package</span>
                    <span className="font-semibold">£68</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Premium photo package</span>
                    <span className="font-semibold">£120</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Video showcase</span>
                    <span className="font-semibold">£220</span>
                  </div>
                  <Button className="w-full mt-4">Book Photography</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 luxury-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Feature Your Listing?</h2>
          <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Join thousands of successful sellers who've boosted their sales with featured listings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              Feature My Listing
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              View Examples
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
