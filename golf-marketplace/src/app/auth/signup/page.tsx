"use client"

import { Suspense } from "react"
export const dynamic = "force-dynamic"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle,
  Crown,
  Trophy,
  Star
} from "lucide-react"
import Link from "next/link"

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  subscribeNewsletter: boolean
}

type FormErrors = Omit<Partial<FormData>, "acceptTerms"> & { acceptTerms?: boolean }

function SignUpPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const trial = searchParams.get("trial")
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    subscribeNewsletter: true
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = true // Changed from string to boolean
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // In real app, create user account via API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          subscribeNewsletter: formData.subscribeNewsletter,
          trial: trial
        })
      })

      if (response.ok) {
        // Auto sign in after successful registration
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (result?.ok) {
          // Redirect based on trial or callback
          if (trial) {
            router.push(`/dashboard/subscription?trial=${trial}&welcome=true`)
          } else {
            router.push(callbackUrl)
          }
        }
      } else {
        const error = await response.json()
        setErrors({ email: error.message || "Registration failed" })
      }
    } catch (error) {
      setErrors({ email: "Something went wrong. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignUp = async (provider: string) => {
    setIsLoading(true)
    try {
      const redirectUrl = trial
        ? `/dashboard/subscription?trial=${trial}&welcome=true`
        : callbackUrl

      await signIn(provider, { callbackUrl: redirectUrl })
    } catch (error) {
      setErrors({ email: `Failed to sign up with ${provider}` })
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getTrialInfo = (planType: string) => {
    switch (planType) {
      case "pro":
        return {
          name: "Pro Plan",
          price: "£7",
          trial: "1 Month FREE",
          features: ["3% commission", "Enhanced listings", "Priority support"],
          color: "green"
        }
      case "business":
        return {
          name: "Business Plan",
          price: "£22",
          trial: "1 Month FREE",
          features: ["3% commission", "Premium storefront", "Business analytics"],
          color: "blue"
        }
      case "pga-pro":
        return {
          name: "PGA Professional",
          price: "£45",
          trial: "2 Months FREE",
          features: ["1% commission", "PGA Pro badge", "Pro-only access"],
          color: "yellow"
        }
      default:
        return null
    }
  }

  const trialInfo = trial ? getTrialInfo(trial) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {trial ? `Start Your ${trialInfo?.name} Trial` : "Join ClubUp"}
            </h1>
            <p className="text-gray-600">
              {trial
                ? `Get ${trialInfo?.trial} to experience premium features`
                : "Create your account to buy and sell golf equipment"
              }
            </p>
          </div>

          {/* Trial Banner */}
          {trialInfo && (
            <Card className={`mb-6 border-2 ${
              trialInfo.color === 'green' ? 'border-green-200 bg-green-50' :
              trialInfo.color === 'blue' ? 'border-blue-200 bg-blue-50' :
              'border-yellow-200 bg-yellow-50'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {trialInfo.color === 'yellow' ? (
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <Crown className="w-6 h-6 text-primary" />
                  )}
                  <div>
                    <h3 className="font-semibold">{trialInfo.name}</h3>
                    <p className="text-sm text-gray-600">
                      {trialInfo.trial} • Then {trialInfo.price}/month
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  {trialInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-3 h-3 text-green-600 mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Social Sign Up */}
              <div className="space-y-3 mb-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialSignUp("google")}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialSignUp("facebook")}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        placeholder="John"
                        className="pl-10"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="john@example.com"
                      className="pl-10"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      placeholder="At least 8 characters"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className="pl-10"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => updateFormData('acceptTerms', checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="acceptTerms" className="text-sm leading-5">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:text-primary/80">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:text-primary/80">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-xs text-red-600">
                      You must accept the terms of service
                    </p>
                  )}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="subscribeNewsletter"
                      checked={formData.subscribeNewsletter}
                      onCheckedChange={(checked) => updateFormData('subscribeNewsletter', checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="subscribeNewsletter" className="text-sm leading-5">
                      Send me weekly golf equipment deals and tips (10% off first purchase)
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      {trial ? `Start ${trialInfo?.name} Trial` : "Create Account"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href={`/auth/signin${trial ? `?trial=${trial}` : ""}`}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-8 text-center">
            <h3 className="font-medium text-gray-900 mb-4">Why Choose ClubUp?</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>4.8★ rated by 50,000+ golfers</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Authenticated equipment & verified sellers</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-4 h-4 text-purple-600" />
                <span>Free trials • Cancel anytime • No hidden fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SignUpPageContent />
    </Suspense>
  )
}
