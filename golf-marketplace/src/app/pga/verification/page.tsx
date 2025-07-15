"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Trophy,
  Camera,
  FileText,
  Award,
  ArrowLeft,
  ArrowRight
} from "lucide-react"
import { Navigation } from "@/components/navigation"

const PGA_CREDENTIALS = [
  "PGA Teaching Professional",
  "PGA Club Professional",
  "PGA Master Professional",
  "PGA Director of Golf",
  "PGA Head Professional",
  "LPGA Teaching Professional",
  "LPGA Tour Professional",
  "Golf Course Superintendent",
  "Golf Equipment Representative",
  "Golf Industry Executive"
]

const VERIFICATION_STEPS = [
  {
    step: 1,
    title: "Professional Credentials",
    description: "Provide your PGA/LPGA certification details",
    icon: Trophy
  },
  {
    step: 2,
    title: "Employment Verification",
    description: "Current golf facility or employer information",
    icon: Shield
  },
  {
    step: 3,
    title: "Documentation Upload",
    description: "Upload certification and employment documents",
    icon: FileText
  },
  {
    step: 4,
    title: "Review & Approval",
    description: "Our team reviews your application",
    icon: Award
  }
]

export default function PGAVerificationPage() {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [verificationData, setVerificationData] = useState({
    credential: "",
    membershipNumber: "",
    yearsExperience: "",
    currentEmployer: "",
    jobTitle: "",
    facilityName: "",
    facilityAddress: "",
    supervisorName: "",
    supervisorEmail: "",
    specializations: "",
    bio: "",
    website: "",
    linkedIn: ""
  })
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setCurrentStep(4)
  }

  const handleDocUpload = () => {
    // Simulate document upload
    setUploadedDocs(prev => [...prev, `Document ${prev.length + 1}`])
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
              <p className="text-gray-600 mb-4">Please sign in to apply for PGA verification.</p>
              <Button asChild>
                <a href="/auth/signin">Sign In</a>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">PGA Professional Verification</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get verified as a PGA Professional to unlock exclusive features, lowest commission rates,
              and access to our professional network.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {VERIFICATION_STEPS.map((step, index) => (
                <div key={step.step} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2
                    ${currentStep >= step.step
                      ? 'bg-yellow-500 border-yellow-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                    }
                  `}>
                    {currentStep > step.step ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>

                  {index < VERIFICATION_STEPS.length - 1 && (
                    <div className={`
                      w-24 h-0.5 mx-4
                      ${currentStep > step.step ? 'bg-yellow-500' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold">
                {VERIFICATION_STEPS[currentStep - 1]?.title}
              </h3>
              <p className="text-gray-600">
                {VERIFICATION_STEPS[currentStep - 1]?.description}
              </p>
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="p-8">
              {/* Step 1: Professional Credentials */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="credential">Professional Credential *</Label>
                      <Select onValueChange={(value) => setVerificationData(prev => ({ ...prev, credential: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your professional credential" />
                        </SelectTrigger>
                        <SelectContent>
                          {PGA_CREDENTIALS.map(credential => (
                            <SelectItem key={credential} value={credential.toLowerCase().replace(/ /g, '-')}>
                              {credential}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="membershipNumber">Membership/License Number *</Label>
                        <Input
                          id="membershipNumber"
                          value={verificationData.membershipNumber}
                          onChange={(e) => setVerificationData(prev => ({ ...prev, membershipNumber: e.target.value }))}
                          placeholder="e.g., PGA123456"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="yearsExperience">Years of Experience</Label>
                        <Input
                          id="yearsExperience"
                          type="number"
                          value={verificationData.yearsExperience}
                          onChange={(e) => setVerificationData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="specializations">Teaching/Professional Specializations</Label>
                      <Textarea
                        id="specializations"
                        value={verificationData.specializations}
                        onChange={(e) => setVerificationData(prev => ({ ...prev, specializations: e.target.value }))}
                        placeholder="e.g., Junior golf development, club fitting, swing analysis..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Benefits of PGA Verification</h4>
                    <div className="text-sm text-yellow-800 space-y-1">
                      <div>• 1% commission rate (lowest available)</div>
                      <div>• PGA Professional badge on all listings</div>
                      <div>• Access to pro-only equipment and testing programs</div>
                      <div>• Teaching revenue tracking tools</div>
                      <div>• Professional networking features</div>
                      <div>• Priority customer support</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Employment Verification */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentEmployer">Current Employer Status</Label>
                        <Select onValueChange={(value) => setVerificationData(prev => ({ ...prev, currentEmployer: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employed">Currently Employed</SelectItem>
                            <SelectItem value="self-employed">Self-Employed</SelectItem>
                            <SelectItem value="consultant">Independent Consultant</SelectItem>
                            <SelectItem value="retired">Retired Professional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="jobTitle">Current Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={verificationData.jobTitle}
                          onChange={(e) => setVerificationData(prev => ({ ...prev, jobTitle: e.target.value }))}
                          placeholder="e.g., Head Golf Professional"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="facilityName">Golf Facility/Company Name</Label>
                      <Input
                        id="facilityName"
                        value={verificationData.facilityName}
                        onChange={(e) => setVerificationData(prev => ({ ...prev, facilityName: e.target.value }))}
                        placeholder="e.g., Prestigious Golf Club"
                      />
                    </div>

                    <div>
                      <Label htmlFor="facilityAddress">Facility Address</Label>
                      <Textarea
                        id="facilityAddress"
                        value={verificationData.facilityAddress}
                        onChange={(e) => setVerificationData(prev => ({ ...prev, facilityAddress: e.target.value }))}
                        placeholder="Full address of your golf facility"
                        rows={2}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="supervisorName">Supervisor/Reference Name</Label>
                        <Input
                          id="supervisorName"
                          value={verificationData.supervisorName}
                          onChange={(e) => setVerificationData(prev => ({ ...prev, supervisorName: e.target.value }))}
                          placeholder="Reference contact name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="supervisorEmail">Reference Email</Label>
                        <Input
                          id="supervisorEmail"
                          type="email"
                          value={verificationData.supervisorEmail}
                          onChange={(e) => setVerificationData(prev => ({ ...prev, supervisorEmail: e.target.value }))}
                          placeholder="reference@golfclub.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Documentation Upload */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Required Documentation</h3>
                    <p className="text-gray-600">
                      Please upload clear photos or scans of the following documents
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Required Documents */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Required Documents</h4>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <h5 className="font-medium mb-1">PGA/LPGA Certification</h5>
                        <p className="text-sm text-gray-600 mb-3">Professional membership card or certificate</p>
                        <Button size="sm" onClick={handleDocUpload}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </Button>
                      </div>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <h5 className="font-medium mb-1">Employment Verification</h5>
                        <p className="text-sm text-gray-600 mb-3">Letter from employer or business license</p>
                        <Button size="sm" onClick={handleDocUpload}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </Button>
                      </div>
                    </div>

                    {/* Optional Documents */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Optional Documents</h4>

                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                        <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <h5 className="font-medium mb-1">Additional Certifications</h5>
                        <p className="text-sm text-gray-600 mb-3">TPI, club fitting, etc.</p>
                        <Button size="sm" variant="outline" onClick={handleDocUpload}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </Button>
                      </div>

                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                        <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <h5 className="font-medium mb-1">Professional Photo</h5>
                        <p className="text-sm text-gray-600 mb-3">Professional headshot for your profile</p>
                        <Button size="sm" variant="outline" onClick={handleDocUpload}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Documents */}
                  {uploadedDocs.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Uploaded Documents</h4>
                      <div className="space-y-2">
                        {uploadedDocs.map((doc, index) => (
                          <div key={index} className="flex items-center text-green-800">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span className="text-sm">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review & Approval */}
              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Thank you for applying for PGA Professional verification. Our team will review
                      your application and credentials within 2-3 business days.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
                    <div className="text-sm text-blue-800 space-y-1 text-left">
                      <div>• We'll verify your PGA/LPGA credentials</div>
                      <div>• Contact your employment reference if provided</div>
                      <div>• Review uploaded documentation</div>
                      <div>• Send you confirmation via email</div>
                      <div>• Activate your PGA Professional features</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full max-w-xs" asChild>
                      <a href="/dashboard">Return to Dashboard</a>
                    </Button>
                    <Button variant="outline" className="w-full max-w-xs" asChild>
                      <a href="/pga/network">Explore PGA Network</a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="flex justify-between pt-8 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  {currentStep === 3 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || uploadedDocs.length === 0}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
