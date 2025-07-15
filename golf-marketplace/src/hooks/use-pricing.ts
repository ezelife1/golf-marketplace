import { useCountry } from '@/contexts/country-context'

export function usePricing() {
  const { country, formatPrice, convertPrice } = useCountry()

  const getSubscriptionPrice = (plan: 'pro' | 'business' | 'pgaPro') => {
    return country.pricing[plan]
  }

  const getFormattedSubscriptionPrice = (plan: 'pro' | 'business' | 'pgaPro') => {
    return formatPrice(getSubscriptionPrice(plan))
  }

  const getShippingInfo = () => {
    return {
      freeShippingThreshold: country.shipping.free,
      standardShipping: country.shipping.standard,
      expressShipping: country.shipping.express,
      formatted: {
        freeThreshold: formatPrice(country.shipping.free),
        standard: formatPrice(country.shipping.standard),
        express: formatPrice(country.shipping.express)
      }
    }
  }

  const convertAndFormatPrice = (price: number, fromCurrency = 'GBP') => {
    const convertedPrice = convertPrice(price, fromCurrency)
    return formatPrice(convertedPrice)
  }

  const getCommissionInfo = (subscriptionTier: string) => {
    const rates = {
      free: 5,
      pro: 3,
      business: 3,
      'pga-pro': 1
    }
    return rates[subscriptionTier as keyof typeof rates] || 5
  }

  return {
    country,
    formatPrice,
    convertPrice,
    getSubscriptionPrice,
    getFormattedSubscriptionPrice,
    getShippingInfo,
    convertAndFormatPrice,
    getCommissionInfo
  }
}
