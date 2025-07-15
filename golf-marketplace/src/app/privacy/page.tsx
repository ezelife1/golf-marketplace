import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Eye,
  FileText,
  Clock,
  Lock,
  Globe,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Mail,
  Database,
  UserCheck
} from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
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
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
                <p className="text-gray-600">Last updated: January 13, 2025</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                GDPR Compliant
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                UK & EU Privacy Laws
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Effective Immediately
              </Badge>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900">Your Privacy Matters</h3>
                    <p className="text-green-700 text-sm">
                      We are committed to protecting your personal information and being transparent about how we collect, use, and share your data in compliance with GDPR and UK data protection laws.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Content */}
          <div className="space-y-8">
            {/* 1. Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Information You Provide
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Account Information:</strong> Name, email, password, phone number</li>
                      <li><strong>Profile Data:</strong> Bio, location, preferences, profile photo</li>
                      <li><strong>Payment Information:</strong> Billing address (payment details processed by Stripe)</li>
                      <li><strong>Listing Content:</strong> Product descriptions, photos, pricing</li>
                      <li><strong>Communications:</strong> Messages, reviews, support requests</li>
                      <li><strong>Verification Data:</strong> PGA credentials, identity verification</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Information We Collect Automatically
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Usage Data:</strong> Pages viewed, clicks, time spent, search queries</li>
                      <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                      <li><strong>Location Data:</strong> IP address, general geographic location</li>
                      <li><strong>Cookies:</strong> Session data, preferences, analytics</li>
                      <li><strong>Transaction Data:</strong> Purchase history, selling activity</li>
                      <li><strong>Performance Data:</strong> App crashes, response times, feature usage</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. How We Use Your Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Essential Platform Operations</h4>
                    <ul>
                      <li>Creating and managing your account</li>
                      <li>Processing transactions and payments</li>
                      <li>Facilitating communication between users</li>
                      <li>Providing customer support</li>
                      <li>Ensuring platform security and fraud prevention</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">Platform Improvement</h4>
                    <ul>
                      <li>Analyzing usage patterns to improve our services</li>
                      <li>Personalizing your experience and recommendations</li>
                      <li>Testing new features and functionality</li>
                      <li>Optimizing search and discovery algorithms</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">Marketing and Communications (With Your Consent)</h4>
                    <ul>
                      <li>Sending newsletters and promotional emails</li>
                      <li>Notifying you about new features and updates</li>
                      <li>Providing price alerts and wishlist notifications</li>
                      <li>Sharing relevant offers and recommendations</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">Legal and Compliance</h4>
                    <ul>
                      <li>Complying with legal obligations and regulations</li>
                      <li>Enforcing our Terms of Service</li>
                      <li>Resolving disputes and preventing abuse</li>
                      <li>Protecting intellectual property rights</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Legal Basis for Processing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Legal Basis for Processing (GDPR)
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium text-blue-900">Contract Performance</h4>
                      <p className="text-sm text-gray-600">Processing necessary to provide our marketplace services</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium text-green-900">Legitimate Interests</h4>
                      <p className="text-sm text-gray-600">Improving services, fraud prevention, analytics</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium text-purple-900">Consent</h4>
                      <p className="text-sm text-gray-600">Marketing communications, non-essential cookies</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium text-red-900">Legal Obligation</h4>
                      <p className="text-sm text-gray-600">Tax compliance, regulatory requirements</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Information Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  How We Share Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-900">We Never Sell Your Data</span>
                  </div>
                  <p className="text-red-800 text-sm">
                    ClubUp does not sell, rent, or trade your personal information to third parties for their marketing purposes.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">With Other Users</h4>
                    <ul>
                      <li>Your public profile information (name, ratings, location)</li>
                      <li>Your listings and their details</li>
                      <li>Messages you send to other users</li>
                      <li>Reviews and ratings you provide</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">With Service Providers</h4>
                    <ul>
                      <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
                      <li><strong>Amazon Web Services:</strong> Cloud hosting and data storage</li>
                      <li><strong>SendGrid:</strong> Email delivery services</li>
                      <li><strong>Google Analytics:</strong> Website analytics (anonymized)</li>
                      <li><strong>Zendesk:</strong> Customer support services</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">Legal Requirements</h4>
                    <ul>
                      <li>When required by law or legal process</li>
                      <li>To protect our rights, property, or safety</li>
                      <li>To prevent fraud or illegal activities</li>
                      <li>In connection with business transfers or mergers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Data Retention and Deletion
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Retention Periods</h4>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Account Data:</strong> While account is active + 3 years</li>
                      <li><strong>Transaction Records:</strong> 7 years (tax compliance)</li>
                      <li><strong>Communications:</strong> 3 years after last message</li>
                      <li><strong>Analytics Data:</strong> 26 months (Google Analytics)</li>
                      <li><strong>Support Tickets:</strong> 3 years after resolution</li>
                      <li><strong>Marketing Consent:</strong> Until withdrawn + 3 years</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Deletion Process</h4>
                    <ul className="space-y-2 text-sm">
                      <li>Automated deletion when retention periods expire</li>
                      <li>Secure data destruction using industry standards</li>
                      <li>Some data anonymized rather than deleted for analytics</li>
                      <li>Backup systems purged within 90 days</li>
                      <li>Legal holds may extend retention when required</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6. Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Your Privacy Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Under GDPR, You Have the Right To:</h4>
                    <ul className="space-y-2 text-sm">
                      <li><strong>Access:</strong> Request a copy of your personal data</li>
                      <li><strong>Rectification:</strong> Correct inaccurate information</li>
                      <li><strong>Erasure:</strong> Request deletion of your data</li>
                      <li><strong>Portability:</strong> Receive your data in a portable format</li>
                      <li><strong>Restriction:</strong> Limit how we process your data</li>
                      <li><strong>Object:</strong> Opt out of certain processing activities</li>
                      <li><strong>Withdraw Consent:</strong> Revoke consent at any time</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">How to Exercise Your Rights:</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        <p><strong>Online:</strong> Use your account settings</p>
                        <p><strong>Email:</strong> privacy@clubup.golf</p>
                        <p><strong>Response Time:</strong> Within 30 days</p>
                        <p><strong>Free of Charge:</strong> No fees for reasonable requests</p>
                      </div>
                      <Button size="sm" className="mt-3" asChild>
                        <Link href="/privacy/request">Submit Privacy Request</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7. Cookies and Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Cookies and Tracking Technologies
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Essential Cookies (Always Active)</h4>
                    <ul>
                      <li>Authentication and session management</li>
                      <li>Security and fraud prevention</li>
                      <li>Shopping cart and checkout functionality</li>
                      <li>Load balancing and performance</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">Analytics Cookies (With Consent)</h4>
                    <ul>
                      <li>Google Analytics for usage statistics</li>
                      <li>Performance monitoring and optimization</li>
                      <li>User behavior analysis (anonymized)</li>
                      <li>A/B testing and feature development</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium">Marketing Cookies (With Consent)</h4>
                    <ul>
                      <li>Personalized content and recommendations</li>
                      <li>Email campaign tracking</li>
                      <li>Social media integration</li>
                      <li>Retargeting and advertising</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 border rounded-lg p-4">
                    <p className="text-sm"><strong>Cookie Management:</strong> You can manage cookie preferences in your browser settings or through our cookie consent banner. Note that disabling essential cookies may affect platform functionality.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 8. Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">8</span>
                  Data Security and Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Technical Safeguards</h4>
                    <ul className="space-y-1 text-sm">
                      <li>256-bit SSL encryption for data in transit</li>
                      <li>AES-256 encryption for data at rest</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>Multi-factor authentication for admin access</li>
                      <li>Automated backup and disaster recovery</li>
                      <li>Network firewalls and intrusion detection</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Organizational Measures</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Data processing agreements with all vendors</li>
                      <li>Regular staff training on data protection</li>
                      <li>Incident response and breach notification procedures</li>
                      <li>Privacy by design in all new features</li>
                      <li>Regular review of data access permissions</li>
                      <li>ISO 27001 compliance program</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Data Breach Notification</span>
                  </div>
                  <p className="text-yellow-800 text-sm">
                    In the unlikely event of a data breach affecting your personal information, we will notify you and relevant authorities within 72 hours as required by GDPR.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 9. International Transfers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">9</span>
                  International Data Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p><strong>Data Location:</strong> Your data is primarily stored in the UK and EU. Some service providers may process data outside the EEA with appropriate safeguards:</p>

                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium">Adequacy Decisions</h4>
                    <p className="text-sm text-gray-600">Countries with EU adequacy decisions (e.g., UK, Switzerland)</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium">Standard Contractual Clauses</h4>
                    <p className="text-sm text-gray-600">EU-approved contracts for transfers to other countries</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium">Certification Schemes</h4>
                    <p className="text-sm text-gray-600">Privacy Shield successors and other certification programs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 10. Children's Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">10</span>
                  Children's Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p><strong>Age Requirement:</strong> ClubUp is not intended for children under 18. We do not knowingly collect personal information from children under 18.</p>
                <p><strong>Parental Rights:</strong> If you believe we have collected information from a child under 18, please contact us immediately at privacy@clubup.golf for prompt removal.</p>
                <p><strong>Account Verification:</strong> We may request age verification during account creation to ensure compliance.</p>
              </CardContent>
            </Card>

            {/* 11. Updates to Privacy Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">11</span>
                  Updates to This Privacy Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p><strong>Policy Updates:</strong> We may update this Privacy Policy periodically to reflect changes in our practices, technology, or legal requirements.</p>
                <p><strong>Notification:</strong> We will notify you of material changes by email and through our platform. Your continued use constitutes acceptance of the updated policy.</p>
                <p><strong>Version History:</strong> Previous versions of this policy are available upon request for transparency.</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="mt-8 bg-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Our Data Protection Officer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                For any privacy-related questions, concerns, or to exercise your rights:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 text-sm">
                  <p><strong>Data Protection Officer:</strong> Sarah Johnson</p>
                  <p><strong>Email:</strong> privacy@clubup.golf</p>
                  <p><strong>Phone:</strong> +44 20 1234 5679</p>
                  <p><strong>Address:</strong> ClubUp Ltd, 123 Golf Street, London, UK, SW1A 1AA</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Response Time:</strong> Within 30 days</p>
                  <p><strong>Supervisory Authority:</strong> ICO (Information Commissioner's Office)</p>
                  <p><strong>ICO Website:</strong> ico.org.uk</p>
                  <p><strong>ICO Helpline:</strong> 0303 123 1113</p>
                </div>
              </div>
              <div className="mt-6 space-x-4">
                <Button asChild>
                  <Link href="/privacy/request">Submit Privacy Request</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">General Contact</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
