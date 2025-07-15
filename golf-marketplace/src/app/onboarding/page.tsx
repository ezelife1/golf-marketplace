"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, ArrowLeft, User, Store, Package, Sparkles } from "lucide-react"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Welcome to Selling",
    description: "Learn about ClubUp's seller benefits",
    icon: Sparkles
  },
  {
    id: 2,
    title: "Profile Setup",
    description: "Complete your seller profile",
    icon: User
  },
  {
    id: 3,
    title: "Business Info",
    description: "Add your business details",
    icon: Store
  },
  {
    id: 4,
    title: "First Listing",
    description: "Create your first equipment listing",
    icon: Package
  }
]

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCompletedSteps(prev => [...prev, currentStep])
      setCurrentStep(currentStep + 1)
    } else {
      // Onboarding complete
      router.push("/dashboard/listings")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
              <p className="text-gray-600 mb-4">Please sign in to start selling on ClubUp.</p>
              <Button asChild>
                <a href="/auth/signin">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentStepData = ONBOARDING_STEPS[currentStep - 1]
  const IconComponent = currentStepData.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Seller Onboarding</h1>
            <Button variant="ghost" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-4">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2
                  ${completedSteps.includes(step.id)
                    ? 'bg-green-500 border-green-500 text-white'
                    : currentStep === step.id
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }
                `}>
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>

                {index < ONBOARDING_STEPS.length - 1 && (
                  <div className={`
                    w-12 h-0.5 mx-2
                    ${completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
              <p className="text-gray-600">{currentStepData.description}</p>
            </CardHeader>

            <CardContent>
              {/* Step 1: Welcome */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Why Sell on ClubUp?</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>Premium golf community</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>Lower commission rates</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>Professional services</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>Secure transactions</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>Equipment swap marketplace</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>Expert authentication</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Your Membership Benefits</h4>
                    <div className="text-sm text-blue-800">
                      {session.user?.subscription === "pro" ? (
                        <div className="space-y-1">
                          <div>• 3% commission (vs 5% for free users)</div>
                          <div>• 2 free listing bumps per month</div>
                          <div>• Access to equipment swap marketplace</div>
                          <div>• Priority customer support</div>
                        </div>
                      ) : session.user?.subscription === "business" ? (
                        <div className="space-y-1">
                          <div>• 3% commission rate</div>
                          <div>• 10 free listing bumps per month</div>
                          <div>• Advanced swap features</div>
                          <div>• Business analytics dashboard</div>
                          <div>• Verified seller badge</div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div>• 5% commission rate</div>
                          <div>• Basic listing features</div>
                          <div>• Standard support</div>
                          <div className="pt-2">
                            <Badge variant="outline">
                              <Link href="/pricing" className="text-primary">Upgrade for better rates</Link>
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Profile Setup */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <p className="text-gray-600">
                      Let's set up your seller profile to build trust with buyers.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Profile Photo</h4>
                        <p className="text-sm text-gray-600">Add a professional photo</p>
                      </div>
                      <Button size="sm" variant="outline">Upload</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Bio & Experience</h4>
                        <p className="text-sm text-gray-600">Tell buyers about your golf background</p>
                      </div>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Location</h4>
                        <p className="text-sm text-gray-600">Help buyers find local equipment</p>
                      </div>
                      <Button size="sm" variant="outline">Set</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Contact Preferences</h4>
                        <p className="text-sm text-gray-600">How buyers can reach you</p>
                      </div>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Business Info */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <p className="text-gray-600">
                      Are you selling as an individual or business? This helps with tax compliance.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-2 border-gray-200 hover:border-primary cursor-pointer transition-colors">
                      <CardContent className="p-6 text-center">
                        <User className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h4 className="font-medium mb-2">Individual Seller</h4>
                        <p className="text-sm text-gray-600">
                          Selling personal golf equipment occasionally
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-gray-200 hover:border-primary cursor-pointer transition-colors">
                      <CardContent className="p-6 text-center">
                        <Store className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h4 className="font-medium mb-2">Business Seller</h4>
                        <p className="text-sm text-gray-600">
                          Golf shop, dealer, or regular equipment trader
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Business Seller Benefits</h4>
                    <div className="text-sm text-yellow-800 space-y-1">
                      <div>• Verified seller badge</div>
                      <div>• Bulk upload tools</div>
                      <div>• Business analytics</div>
                      <div>• Priority support</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: First Listing */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <p className="text-gray-600">
                      Let's create your first listing! We'll guide you through the process.
                    </p>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Start Options</h3>
                    <div className="space-y-3">
                      <Button className="w-full justify-start" asChild>
                        <a href="/sell/new">
                          <Package className="w-4 h-4 mr-2" />
                          Create New Equipment Listing
                        </a>
                      </Button>

                      {(session.user?.subscription === "pro" || session.user?.subscription === "business") && (
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <a href="/swap/new">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            List Equipment for Swap
                          </a>
                        </Button>
                      )}

                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href="/sell/bulk">
                          <Store className="w-4 h-4 mr-2" />
                          Bulk Upload (Business)
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Pro Tips for Your First Listing</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>• Use high-quality photos from multiple angles</div>
                      <div>• Be honest about condition and any wear</div>
                      <div>• Include all original accessories and documentation</div>
                      <div>• Research comparable prices on ClubUp</div>
                      <div>• Consider professional authentication for high-value items</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button onClick={handleNext}>
                  {currentStep === ONBOARDING_STEPS.length ? "Complete Setup" : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
