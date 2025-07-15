"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useCountry } from "@/contexts/country-context"
import { useLocale } from "@/contexts/locale-context"
import {
  Star,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Shield,
  Users,
  Zap,
  Trophy,
  MessageCircle,
  Search,
  Heart,
  Camera,
  Award,
  Verified,
  Crown,
  Globe,
  Mail
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { country, formatPrice } = useCountry()
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-yellow-500 text-yellow-900 hover:bg-yellow-400">
              🏆 {t('home.hero.badge')}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8">
                  <Search className="w-5 h-5 mr-2" />
                  {t('home.hero.browse')}
                </Button>
              </Link>
              <Link href="/sell/new">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8">
                  <Camera className="w-5 h-5 mr-2" />
                  {t('home.hero.sell')}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-green-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-green-200 text-sm">{t('home.stats.members')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">25K+</div>
                <div className="text-green-200 text-sm">{t('home.stats.listings')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.8★</div>
                <div className="text-green-200 text-sm">{t('home.stats.rating')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatPrice(2000000)}+</div>
                <div className="text-green-200 text-sm">{t('home.stats.sales')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('home.features.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Verified className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('feature.authentication.title')}</h3>
                <p className="text-gray-600 mb-4">{t('feature.authentication.description')}</p>
                <Badge variant="outline" className="text-xs">{t('feature.authentication.badge')}</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('feature.community.title')}</h3>
                <p className="text-gray-600 mb-4">{t('feature.community.description')}</p>
                <Badge variant="outline" className="text-xs">{t('feature.community.badge')}</Badge>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('feature.security.title')}</h3>
                <p className="text-gray-600 mb-4">{t('feature.security.description')}</p>
                <Badge variant="outline" className="text-xs">{t('feature.security.badge')}</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('home.membership.title')}</h2>
            <p className="text-xl text-gray-600">
              {t('home.membership.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-300 h-full flex flex-col">
              <div className="bg-gray-400 text-white text-center py-2 text-sm font-medium">
                {t('plan.getStarted')}
              </div>
              <CardHeader className="text-center">
                <CardTitle>{t('plan.free')}</CardTitle>
                <div className="text-3xl font-bold">£0</div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    5% {t('plan.features.commission')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.basicListings')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.communityAccess')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.searchVisibility')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.basicMessaging')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.emailSupport')}
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  {t('common.getStarted')}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-green-500 h-full flex flex-col">
              <div className="bg-green-500 text-white text-center py-2 text-sm font-medium">
                {t('plan.mostPopular')}
              </div>
              <CardHeader className="text-center">
                <CardTitle>{t('plan.pro')}</CardTitle>
                <div className="text-3xl font-bold text-green-600">{formatPrice(country.pricing.pro)}</div>
                <div className="text-sm text-gray-500">{t('plan.perMonth')}</div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    3% {t('plan.features.commission')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.enhancedListings')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.priorityPlacement')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.advancedMessaging')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.analytics')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.prioritySupport')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.listingBumps')} (2/month)
                  </li>
                </ul>
                <Button className="w-full">
                  {t('common.startFreeTrial')}
                </Button>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="border-2 border-blue-500 h-full flex flex-col">
              <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                {t('plan.forBusiness')}
              </div>
              <CardHeader className="text-center">
                <CardTitle>{t('plan.business')}</CardTitle>
                <div className="text-3xl font-bold text-blue-600">{formatPrice(country.pricing.business)}</div>
                <div className="text-sm text-gray-500">{t('plan.perMonth')}</div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    3% {t('plan.features.commission')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.premiumStorefront')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.customBranding')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.comprehensiveAnalytics')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.bulkTools')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.accountManager')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.listingBumps')} (10/month)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.whiteLabelSolutions')}
                  </li>
                </ul>
                <Button className="w-full">
                  {t('common.startFreeTrial')}
                </Button>
              </CardContent>
            </Card>

            {/* PGA Pro Plan */}
            <Card className="border-2 border-yellow-500 h-full flex flex-col">
              <div className="bg-yellow-500 text-white text-center py-2 text-sm font-medium">
                {t('plan.pgaProfessional')}
              </div>
              <CardHeader className="text-center">
                <CardTitle>{t('plan.pga-pro')}</CardTitle>
                <div className="text-3xl font-bold text-yellow-600">{formatPrice(country.pricing.pgaPro)}</div>
                <div className="text-sm text-gray-500">{t('plan.perMonth')}</div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    1% {t('plan.features.commission')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.pgaBadge')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.exclusiveMarketplace')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.studentDiscounts')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.lessonBooking')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.professionalNetworking')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.businessAnalytics')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.earlyAccess')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('plan.features.professionalBranding')}
                  </li>
                </ul>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                  {t('plan.features.2MonthTrial')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('home.featured.title')}</h2>
            <p className="text-xl text-gray-600">
              {t('home.featured.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* TaylorMade SIM2 Driver */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500">
              <div className="relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop"
                  alt="TaylorMade SIM2 Driver"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                  <Verified className="w-3 h-3 mr-1" />
                  {t('home.featured.authenticated')}
                </Badge>
                <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-900">
                  {t('home.featured.featured')}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">TaylorMade SIM2 Driver</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm ml-1">4.8</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">10.5° Regular Flex</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  Excellent condition with Speed Injected technology. Includes original headcover and adjustment tool.
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">{formatPrice(240)}</span>
                    <span className="text-sm text-gray-500 line-through">{formatPrice(450)}</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Excellent
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Link href="/products/taylormade-sim2-driver-10-5-regular">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      {t('common.viewDetails')}
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Callaway Apex Iron Set */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500">
              <div className="relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop"
                  alt="Callaway Apex Iron Set"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                  <Verified className="w-3 h-3 mr-1" />
                  {t('home.featured.authenticated')}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">Callaway Apex Iron Set</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm ml-1">4.9</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">4-PW (7 clubs)</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  Forged irons offering exceptional feel and workability. True Temper Dynamic Gold shafts.
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">{formatPrice(480)}</span>
                    <span className="text-sm text-gray-500 line-through">{formatPrice(899)}</span>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Very Good
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Link href="/products/callaway-apex-iron-set-4-pw">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      {t('common.viewDetails')}
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scotty Cameron Newport 2 Putter */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500">
              <div className="relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=600&fit=crop"
                  alt="Scotty Cameron Newport 2 Putter"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                  <Verified className="w-3 h-3 mr-1" />
                  {t('home.featured.authenticated')}
                </Badge>
                <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-900">
                  {t('home.featured.featured')}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">Scotty Cameron Newport 2</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm ml-1">5.0</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">34" Right-handed</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  Legendary putter used by Tour professionals. Includes original headcover and certificate.
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">{formatPrice(360)}</span>
                    <span className="text-sm text-gray-500 line-through">{formatPrice(450)}</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Excellent
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Link href="/products/scotty-cameron-newport-2-putter">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      {t('common.viewDetails')}
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <Link href="/search">
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                {t('common.viewAll')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('home.testimonials.title')}</h2>
            <p className="text-xl text-gray-600">
              {t('home.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{t('testimonial.sarah.quote')}"
                </p>
                <div className="font-semibold">{t('testimonial.sarah.name')}</div>
                <div className="text-sm text-gray-500">{t('testimonial.sarah.title')}</div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{t('testimonial.michael.quote')}"
                </p>
                <div className="font-semibold">{t('testimonial.michael.name')}</div>
                <div className="text-sm text-gray-500">{t('testimonial.michael.title')}</div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{t('testimonial.david.quote')}"
                </p>
                <div className="font-semibold">{t('testimonial.david.name')}</div>
                <div className="text-sm text-gray-500">{t('testimonial.david.title')}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advertising Platform */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('advertising.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('advertising.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Banner Advertising */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('advertising.banner.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('advertising.banner.description')}
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.banner.feature1')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.banner.feature2')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.banner.feature3')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Featured Listings */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('advertising.featured.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('advertising.featured.description')}
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.featured.feature1')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.featured.feature2')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.featured.feature3')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Newsletter Sponsorship */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('advertising.newsletter.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('advertising.newsletter.description')}
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.newsletter.feature1')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.newsletter.feature2')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.newsletter.feature3')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Category Sponsorship */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('advertising.category.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('advertising.category.description')}
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.category.feature1')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.category.feature2')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.category.feature3')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* PGA Professional Network */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('advertising.pga.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('advertising.pga.description')}
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.pga.feature1')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.pga.feature2')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.pga.feature3')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Custom Partnerships */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('advertising.custom.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('advertising.custom.description')}
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.custom.feature1')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.custom.feature2')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('advertising.custom.feature3')}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold mb-4">{t('advertising.cta.title')}</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('advertising.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                {t('advertising.cta.mediaKit')}
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                {t('advertising.cta.contactSales')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8">
                <Search className="w-5 h-5 mr-2" />
                {t('home.cta.browse')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/sell/new">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8">
                <Camera className="w-5 h-5 mr-2" />
                {t('home.cta.list')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t('home.newsletter.title')}</h2>
            <p className="text-xl text-gray-600 mb-8">
              {t('home.newsletter.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t('home.newsletter.placeholder')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
              <Button className="px-6 py-3">
                <Mail className="w-4 h-4 mr-2" />
                {t('common.subscribe')}
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              {t('home.newsletter.privacy')}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="text-xl font-bold">ClubUp</span>
              </div>
              <p className="text-gray-400 mb-4">
                {t('footer.description')}
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Globe className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/search" className="hover:text-white">{t('footer.browseEquipment')}</Link></li>
                <li><Link href="/sell" className="hover:text-white">{t('footer.sellEquipment')}</Link></li>
                <li><Link href="/wanted" className="hover:text-white">{t('footer.wantedListings')}</Link></li>
                <li><Link href="/services" className="hover:text-white">{t('footer.services')}</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.support')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Membership */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.membership')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white">Join ClubUp</Link></li>
                <li><Link href="/subscription" className="hover:text-white">Upgrade Plan</Link></li>
                <li><Link href="/pga" className="hover:text-white">PGA Professionals</Link></li>
                <li><Link href="/business" className="hover:text-white">Business Accounts</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
