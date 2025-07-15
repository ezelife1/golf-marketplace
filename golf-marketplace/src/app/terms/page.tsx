import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Scale,
  Shield,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Scale className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Terms of Service</h1>
                <p className="text-gray-600">Last updated: January 13, 2025</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Legal Document
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Effective Immediately
              </Badge>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">Welcome to ClubUp</h3>
                    <p className="text-blue-700 text-sm">
                      By using our platform, you agree to these terms. Please read them carefully as they contain important information about your rights and obligations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Terms Content */}
          <div className="space-y-8">
            {/* 1. Acceptance of Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  By accessing or using ClubUp ("we," "us," "our"), you ("User," "you," "your") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our platform.
                </p>
                <p>
                  ClubUp is a marketplace platform that connects buyers and sellers of golf equipment. We facilitate transactions but do not own, sell, or purchase any golf equipment ourselves.
                </p>
              </CardContent>
            </Card>

            {/* 2. Account Registration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Account Registration and Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p><strong>Eligibility:</strong> You must be at least 18 years old to create an account. By registering, you represent that you meet this requirement.</p>
                <p><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                <p><strong>Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and to update such information as necessary.</p>
                <p><strong>PGA Professional Verification:</strong> PGA Professional accounts require verification of credentials. Misrepresentation of professional status may result in account termination.</p>
              </CardContent>
            </Card>

            {/* 3. Marketplace Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Marketplace Rules and Conduct
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p><strong>Listing Requirements:</strong></p>
                <ul>
                  <li>All listings must be for legitimate golf equipment</li>
                  <li>Items must be accurately described and photographed</li>
                  <li>Condition must be honestly represented</li>
                  <li>Pricing must be fair and in good faith</li>
                </ul>

                <p><strong>Prohibited Items:</strong></p>
                <ul>
                  <li>Counterfeit or replica equipment</li>
                  <li>Stolen or illegally obtained items</li>
                  <li>Items with safety recalls or defects</li>
                  <li>Non-golf related products (unless in approved categories)</li>
                </ul>

                <p><strong>Prohibited Conduct:</strong></p>
                <ul>
                  <li>Harassment, abuse, or threatening behavior</li>
                  <li>Fraudulent activities or misrepresentation</li>
                  <li>Circumventing our fee structure</li>
                  <li>Spam or unsolicited communications</li>
                </ul>
              </CardContent>
            </Card>

            {/* 4. Fees and Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Fees, Payments, and Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p><strong>Commission Structure:</strong></p>
                <ul>
                  <li>Free accounts: 5% commission on sales</li>
                  <li>Pro accounts (£7/month): 3% commission on sales</li>
                  <li>Business accounts (£22/month): 3% commission on sales</li>
                  <li>PGA Professional accounts (£45/month): 1% commission on sales</li>
                </ul>

                <p><strong>Additional Services:</strong></p>
                <ul>
                  <li>Quick Bump: £2.50+ (varies by membership tier)</li>
                  <li>Featured Listings: £6-52 depending on prominence</li>
                  <li>Equipment Authentication: £28+ per item</li>
                  <li>Equipment Swap Service: £15+ per transaction</li>
                </ul>

                <p><strong>Free Trials:</strong> Pro and Business plans include 1-month free trials; PGA Professional plans include 2-month free trials. Trials auto-convert to paid subscriptions unless cancelled.</p>

                <p><strong>Payment Processing:</strong> All payments are processed securely through Stripe. ClubUp does not store payment information.</p>
              </CardContent>
            </Card>

            {/* 5. Buyer and Seller Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Buyer and Seller Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p><strong>Seller Responsibilities:</strong></p>
                <ul>
                  <li>Accurately describe items and their condition</li>
                  <li>Respond promptly to buyer inquiries</li>
                  <li>Ship items promptly and securely</li>
                  <li>Honor return policies and guarantees</li>
                  <li>Pay applicable fees and commissions</li>
                </ul>

                <p><strong>Buyer Responsibilities:</strong></p>
                <ul>
                  <li>Pay for purchased items promptly</li>
                  <li>Communicate respectfully with sellers</li>
                  <li>Follow return procedures if applicable</li>
                  <li>Leave honest feedback and reviews</li>
                </ul>

                <p><strong>Dispute Resolution:</strong> ClubUp provides mediation services for transaction disputes. Our decisions in disputes are final.</p>
              </CardContent>
            </Card>

            {/* 6. Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Intellectual Property
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p><strong>ClubUp Content:</strong> The ClubUp platform, including logos, trademarks, and software, is owned by ClubUp and protected by intellectual property laws.</p>
                <p><strong>User Content:</strong> You retain ownership of content you post (photos, descriptions, etc.) but grant ClubUp a license to use, display, and promote such content on our platform.</p>
                <p><strong>Trademark Compliance:</strong> Use of brand names and trademarks in listings must comply with applicable trademark laws and manufacturer policies.</p>
              </CardContent>
            </Card>

            {/* 7. Privacy and Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Privacy and Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>Your privacy is important to us. Our collection and use of personal information is governed by our <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>, which is incorporated by reference into these Terms.</p>
                <p><strong>Data Security:</strong> We implement industry-standard security measures to protect your personal information.</p>
                <p><strong>Data Sharing:</strong> We do not sell personal information to third parties. Data sharing is limited to what's necessary for platform operations and legal compliance.</p>
              </CardContent>
            </Card>

            {/* 8. Disclaimers and Limitations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">8</span>
                  Disclaimers and Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-amber-900">Important Legal Notice</span>
                  </div>
                  <p className="text-amber-800 text-sm">
                    ClubUp is a marketplace platform. We do not guarantee the quality, safety, or legality of items listed by users.
                  </p>
                </div>

                <p><strong>Platform Availability:</strong> We strive for 99.9% uptime but cannot guarantee uninterrupted service.</p>
                <p><strong>User Transactions:</strong> ClubUp is not party to transactions between users. We are not responsible for disputes, non-delivery, or defective items.</p>
                <p><strong>Third-Party Services:</strong> We integrate with third-party services (payment processors, shipping providers) but are not responsible for their actions or failures.</p>
                <p><strong>Limitation of Liability:</strong> Our liability is limited to the fees you paid in the 12 months prior to any claim, not to exceed £1,000.</p>
              </CardContent>
            </Card>

            {/* 9. Termination */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">9</span>
                  Account Termination
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p><strong>Voluntary Termination:</strong> You may close your account at any time through your account settings.</p>
                <p><strong>Termination for Cause:</strong> We may suspend or terminate accounts for violations of these Terms, including but not limited to:</p>
                <ul>
                  <li>Fraudulent activity or misrepresentation</li>
                  <li>Repeated violations of marketplace rules</li>
                  <li>Abuse of other users or our support team</li>
                  <li>Non-payment of fees or chargebacks</li>
                </ul>
                <p><strong>Effect of Termination:</strong> Upon termination, your access to the platform will be revoked, but existing transaction obligations remain in effect.</p>
              </CardContent>
            </Card>

            {/* 10. General Provisions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">10</span>
                  General Provisions
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p><strong>Governing Law:</strong> These Terms are governed by the laws of England and Wales.</p>
                <p><strong>Dispute Resolution:</strong> Disputes will be resolved through binding arbitration in London, England.</p>
                <p><strong>Changes to Terms:</strong> We may update these Terms periodically. Continued use constitutes acceptance of updated Terms.</p>
                <p><strong>Severability:</strong> If any provision is deemed unenforceable, the remaining provisions remain in effect.</p>
                <p><strong>Entire Agreement:</strong> These Terms, along with our Privacy Policy, constitute the entire agreement between you and ClubUp.</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="mt-8 bg-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Questions About These Terms?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> legal@clubup.golf</p>
                <p><strong>Address:</strong> ClubUp Ltd, 123 Golf Street, London, UK, SW1A 1AA</p>
                <p><strong>Phone:</strong> +44 20 1234 5678</p>
              </div>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
