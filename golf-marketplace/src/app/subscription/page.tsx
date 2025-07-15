import { CheckCircle, Star, Crown, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"

const subscriptionPlans = [
  {
    name: "Basic",
    price: "Free",
    billing: "Forever",
    commission: "5%",
    description: "Perfect for occasional sellers",
    features: [
      "List up to 5 items",
      "Basic messaging system",
      "Standard customer support",
      "Mobile app access",
      "Basic seller profile",
      "Community access"
    ],
    popular: false,
    icon: <Users className="w-8 h-8" />,
    buttonText: "Get Started Free",
    color: "bg-gray-100"
  },
  {
    name: "Pro",
    price: "£9",
    billing: "per month",
    commission: "3%",
    description: "For serious golf equipment sellers",
    features: [
      "Unlimited listings",
      "Advanced messaging with file sharing",
      "Priority customer support",
      "Advanced analytics dashboard",
      "Featured listing placements",
      "Bulk upload tools",
      "Price history tracking",
      "Seller verification badge",
      "Custom seller branding",
      "Advanced notification system"
    ],
    popular: true,
    icon: <Star className="w-8 h-8" />,
    buttonText: "Start 14-Day Free Trial",
    color: "luxury-gradient"
  },
  {
    name: "Business",
    price: "£29",
    billing: "per month",
    commission: "3%",
    description: "For golf retailers and high-volume sellers",
    features: [
      "Everything in Pro",
      "API access for integrations",
      "Custom storefront branding",
      "Dedicated account manager",
      "Advanced seller analytics",
      "White-label options",
      "Custom commission rates",
      "Inventory management tools",
      "Multi-location support",
      "Priority listing placement"
    ],
    popular: false,
    icon: <Crown className="w-8 h-8" />,
    buttonText: "Contact Sales",
    color: "bg-gradient-to-br from-yellow-400 to-yellow-600"
  }
]

const comparisonFeatures = [
  { feature: "Monthly Listings", basic: "5", pro: "Unlimited", business: "Unlimited" },
  { feature: "Commission Rate", basic: "5%", pro: "3%", business: "3%" },
  { feature: "Customer Support", basic: "Standard", pro: "Priority", business: "Dedicated Manager" },
  { feature: "Analytics", basic: "Basic", pro: "Advanced", business: "Enterprise" },
  { feature: "API Access", basic: "❌", pro: "❌", business: "✅" },
  { feature: "Featured Listings", basic: "❌", pro: "✅", business: "✅" },
  { feature: "Custom Branding", basic: "❌", pro: "Basic", business: "Full" },
]

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="luxury-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Choose Your
            <span className="gold-accent block">Membership Plan</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
            All sellers must be members. Choose the plan that fits your selling goals and unlock premium features.
          </p>
          <div className="flex items-center justify-center gap-4 text-lg">
            <span>✨ 14-day free trial</span>
            <span>•</span>
            <span>🔒 No long-term contracts</span>
            <span>•</span>
            <span>💎 Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionPlans.map((plan, index) => (
              <Card key={plan.name} className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${plan.popular ? 'scale-105 border-2 border-primary premium-shadow' : 'hover:scale-105'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-2 font-semibold">
                    🏆 Most Popular
                  </div>
                )}

                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white ${plan.color}`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>

                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-gray-500">{plan.billing}</span>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-sm">
                        {plan.commission} commission per sale
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full h-12 text-lg font-semibold ${plan.popular ? 'luxury-gradient text-white hover:opacity-90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Compare Plans</h2>
            <p className="text-xl text-gray-600">See what's included in each membership tier</p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-xl premium-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="luxury-gradient text-white">
                  <tr>
                    <th className="text-left p-6 font-semibold">Features</th>
                    <th className="text-center p-6 font-semibold">Basic</th>
                    <th className="text-center p-6 font-semibold">Pro</th>
                    <th className="text-center p-6 font-semibold">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="p-6 font-medium text-gray-900">{item.feature}</td>
                      <td className="p-6 text-center text-gray-700">{item.basic}</td>
                      <td className="p-6 text-center text-gray-700">{item.pro}</td>
                      <td className="p-6 text-center text-gray-700">{item.business}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Why do all sellers need to be members?",
                answer: "Membership ensures quality, security, and trust in our marketplace. All sellers are verified and committed to providing excellent service to our golf community."
              },
              {
                question: "Can I change my plan anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through Stripe."
              },
              {
                question: "How does the commission system work?",
                answer: "Commission is automatically deducted from each sale. Basic members pay 5%, while Pro and Business members pay only 3%. You'll see a detailed breakdown in your earnings dashboard."
              },
              {
                question: "Is there a long-term contract?",
                answer: "No contracts! All plans are month-to-month and you can cancel anytime. Your account will remain active until the end of your current billing period."
              }
            ].map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 luxury-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Selling?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-200">
            Join thousands of golf enthusiasts already trading on ClubUp. Start with our free plan today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 h-14 px-8 text-lg">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 h-14 px-8 text-lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
