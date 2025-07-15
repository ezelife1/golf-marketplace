import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  pro: {
    name: 'Pro',
    price: 700, // £7.00 in pence
    stripePriceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    features: [
      '3% commission on sales',
      'Enhanced listings',
      'Priority support',
      'Advanced messaging',
      'Price history analytics',
      'Equipment swap marketplace',
      'Free listing bumps (2/month)'
    ]
  },
  business: {
    name: 'Business',
    price: 2200, // £22.00 in pence
    stripePriceId: 'price_business_monthly', // Replace with actual Stripe price ID
    features: [
      '3% commission on sales',
      'Premium storefront',
      'Dedicated support',
      'Bulk upload tools',
      'Business analytics',
      'Verified seller badge',
      'Advanced swap features',
      'Free listing bumps (10/month)'
    ]
  },
  'pga-pro': {
    name: 'PGA Professional',
    price: 4500, // £45.00 in pence
    stripePriceId: 'price_pga_pro_monthly', // Replace with actual Stripe price ID
    features: [
      '1% commission on sales',
      'PGA Professional badge',
      'Pro-only equipment access',
      'Teaching revenue tools',
      'Equipment testing programs',
      'White-glove services included',
      'Unlimited listing bumps',
      'Priority authentication',
      'Industry networking features',
      'Bulk equipment management'
    ]
  }
}

// One-time payment services
export const SERVICES = {
  quickBump: {
    oneHour: { price: 250, name: '1-Hour Bump' },
    sixHour: { price: 600, name: '6-Hour Bump' },
    twentyFourHour: { price: 1200, name: '24-Hour Bump' }
  },
  professional: {
    authentication: { price: 2800, name: 'Equipment Authentication' },
    appraisal: { price: 6000, name: 'Professional Appraisal' },
    delivery: { price: 10000, name: 'White-Glove Delivery' },
    restoration: { price: 7500, name: 'Equipment Restoration' }
  },
  featured: {
    basic: { price: 600, name: 'Basic Featured (7 days)' },
    premium: { price: 1400, name: 'Premium Featured (14 days)' },
    spotlight: { price: 2800, name: 'Spotlight Featured (30 days)' },
    ultra: { price: 5200, name: 'Ultra Featured (60 days)' }
  },
  swap: {
    basic: { price: 1500, name: 'Basic Swap' },
    premium: { price: 2700, name: 'Premium Swap' },
    concierge: { price: 5100, name: 'Concierge Swap' }
  }
}
