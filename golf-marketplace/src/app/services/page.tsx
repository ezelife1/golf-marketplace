import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Award, Truck, Sparkles, Calculator, MapPin, Clock, Star } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden luxury-gradient text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Premium Golf <span className="gold-accent">Services</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Expert authentication, professional appraisals, and white-glove services
              for serious golf equipment collectors and dealers.
            </p>
          </div>
        </div>
      </section>

      {/* Professional Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Professional Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trust our certified experts with your valuable golf equipment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Authentication Service */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Equipment Authentication</CardTitle>
                <CardDescription>Verify authenticity and detect counterfeits</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">£28</span>
                  <span className="text-gray-500">/item</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• Certificate of authenticity</li>
                  <li>• Detailed condition report</li>
                  <li>• 48-hour turnaround</li>
                  <li>• Insurance eligible</li>
                </ul>
                <Button className="w-full">Book Authentication</Button>
              </CardContent>
            </Card>

            {/* Professional Appraisal */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Professional Appraisal</CardTitle>
                <CardDescription>Certified market value assessment</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">£60</span>
                  <span className="text-gray-500">/item</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• Certified appraisal document</li>
                  <li>• Insurance & tax purposes</li>
                  <li>• Market trend analysis</li>
                  <li>• PGA certified appraiser</li>
                </ul>
                <Button className="w-full">Get Appraisal</Button>
              </CardContent>
            </Card>

            {/* White-Glove Delivery */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">White-Glove Delivery</CardTitle>
                <CardDescription>Premium delivery and setup service</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">£100</span>
                  <span className="text-gray-500">/delivery</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• Hand delivery by experts</li>
                  <li>• Unboxing & inspection</li>
                  <li>• Basic club fitting</li>
                  <li>• Satisfaction guarantee</li>
                </ul>
                <Button className="w-full">Schedule Delivery</Button>
              </CardContent>
            </Card>

            {/* Equipment Restoration */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Equipment Restoration</CardTitle>
                <CardDescription>Professional cleaning and restoration</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">£75</span>
                  <span className="text-gray-500">/set</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>• Deep cleaning & polishing</li>
                  <li>• Grip replacement</li>
                  <li>• Minor repairs included</li>
                  <li>• Before/after photos</li>
                </ul>
                <Button className="w-full">Book Restoration</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Premium Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Additional revenue-generating services for enhanced customer experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Equipment Insurance */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Equipment Insurance</CardTitle>
                <CardDescription>Protect your valuable golf investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Coverage up to £4K</span>
                    <span className="font-semibold">£12/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coverage up to £12K</span>
                    <span className="font-semibold">£28/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coverage up to £40K</span>
                    <span className="font-semibold">£68/month</span>
                  </div>
                  <Button className="w-full mt-4">Get Coverage</Button>
                </div>
              </CardContent>
            </Card>

            {/* Equipment Financing */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Calculator className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Equipment Financing</CardTitle>
                <CardDescription>Flexible payment plans for premium gear</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>6-month plan</span>
                    <span className="font-semibold">2.9% APR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>12-month plan</span>
                    <span className="font-semibold">3.9% APR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>24-month plan</span>
                    <span className="font-semibold">4.9% APR</span>
                  </div>
                  <Button className="w-full mt-4">Apply Now</Button>
                </div>
              </CardContent>
            </Card>

            {/* Extended Warranty */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Extended Warranty</CardTitle>
                <CardDescription>Additional protection beyond manufacturer warranty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>1-year extension</span>
                    <span className="font-semibold">8% of value</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2-year extension</span>
                    <span className="font-semibold">12% of value</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3-year extension</span>
                    <span className="font-semibold">15% of value</span>
                  </div>
                  <Button className="w-full mt-4">Add Warranty</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Expert Services Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Meet Our Experts</h2>
            <p className="text-xl text-gray-600">PGA-certified professionals at your service</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Michael Thompson",
                role: "Chief Equipment Appraiser",
                credentials: "PGA Professional, 15 years experience",
                specialties: "Vintage clubs, Tour equipment"
              },
              {
                name: "Sarah Martinez",
                role: "Authentication Specialist",
                credentials: "Golf Industry Association Certified",
                specialties: "Counterfeit detection, Modern equipment"
              },
              {
                name: "David Chen",
                role: "Restoration Expert",
                credentials: "Master Craftsman, Golf Repair Institute",
                specialties: "Club restoration, Custom work"
              }
            ].map((expert, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2">{expert.name}</h3>
                  <p className="text-primary font-medium mb-2">{expert.role}</p>
                  <p className="text-sm text-gray-600 mb-2">{expert.credentials}</p>
                  <p className="text-sm text-gray-500">{expert.specialties}</p>
                  <div className="flex justify-center mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 luxury-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready for Premium Service?</h2>
          <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Book any of our professional services today and experience the ClubUp difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              Book a Service
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Expert
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
