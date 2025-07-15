"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  HelpCircle,
  Shield,
  CreditCard,
  Users,
  CheckCircle,
  Send,
  Globe
} from "lucide-react"

interface ContactForm {
  name: string
  email: string
  subject: string
  category: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))

    setSubmitted(true)
    setIsSubmitting(false)
    setFormData({ name: "", email: "", subject: "", category: "", message: "" })
  }

  const updateFormData = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact & Support</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get in touch with our team. We're here to help with any questions about buying, selling, or using ClubUp.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        Thank you for your message! We'll get back to you within 24 hours.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => updateFormData('name', e.target.value)}
                            placeholder="Your full name"
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="technical">Technical Support</SelectItem>
                              <SelectItem value="billing">Billing & Payments</SelectItem>
                              <SelectItem value="selling">Selling Equipment</SelectItem>
                              <SelectItem value="buying">Buying Equipment</SelectItem>
                              <SelectItem value="pga">PGA Verification</SelectItem>
                              <SelectItem value="advertising">Advertising</SelectItem>
                              <SelectItem value="report">Report an Issue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => updateFormData('subject', e.target.value)}
                            placeholder="Brief description"
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => updateFormData('message', e.target.value)}
                          placeholder="Tell us how we can help you..."
                          rows={6}
                          required
                          className="mt-1"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {formData.message.length}/1000 characters
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Send className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle>ClubUp HQ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-gray-600">
                        123 Golf Course Drive<br />
                        St Andrews, Scotland<br />
                        KY16 9BA, United Kingdom
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-600">+44 1334 123456</p>
                      <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM GMT</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">support@clubup.com</p>
                      <p className="text-xs text-gray-500">Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Coverage</p>
                      <p className="text-sm text-gray-600">50+ Countries</p>
                      <p className="text-xs text-gray-500">Worldwide shipping</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Support Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Monday - Friday</span>
                    <span className="text-sm font-medium">9:00 AM - 6:00 PM GMT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Saturday</span>
                    <span className="text-sm font-medium">10:00 AM - 4:00 PM GMT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sunday</span>
                    <span className="text-sm text-gray-500">Closed</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">
                      Emergency support available 24/7 for payment and security issues
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Help Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Help</CardTitle>
              <p className="text-gray-600">Find answers to common questions</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Billing & Payments</h4>
                  <p className="text-sm text-gray-600">Subscription, payments, refunds</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Response: 2-4 hours
                  </Badge>
                </div>

                <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Account Security</h4>
                  <p className="text-sm text-gray-600">Login issues, account safety</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Response: 1-2 hours
                  </Badge>
                </div>

                <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Selling Support</h4>
                  <p className="text-sm text-gray-600">Listing help, seller tools</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Response: 4-8 hours
                  </Badge>
                </div>

                <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <HelpCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">General Help</h4>
                  <p className="text-sm text-gray-600">How-to guides, tutorials</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Response: 8-24 hours
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Preview */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">How do I start selling on ClubUp?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Sign up for a free account, complete your profile, and start listing your golf equipment with photos and descriptions.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    We accept all major credit cards, debit cards, and PayPal through our secure Stripe payment system.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">How does PGA Pro verification work?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload your PGA membership certificate and ID. Verification typically takes 2-3 business days.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">What are the commission rates?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Free: 5% • Pro: 3% • Business: 3% • PGA Pro: 1%. All plans include buyer protection and secure payments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
