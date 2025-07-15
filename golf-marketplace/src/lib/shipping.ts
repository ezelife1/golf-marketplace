// Shipping service with carrier integration
import { NextRequest } from 'next/server'

// Types for shipping calculations
export interface ShippingDimensions {
  length: number // cm
  width: number // cm
  height: number // cm
  weight: number // kg
}

export interface ShippingAddress {
  postcode: string
  country?: string
}

export interface ShippingOption {
  id: string
  carrier: string
  service: string
  price: number
  currency: string
  estimatedDays: string
  description: string
  tracking: boolean
  insurance?: number
  size_restrictions?: string
}

export interface ShippingQuoteRequest {
  from: ShippingAddress
  to: ShippingAddress
  dimensions: ShippingDimensions
  value?: number // for insurance
  category?: string // golf equipment category
}

// Royal Mail API integration
class RoyalMailService {
  private baseUrl = process.env.ROYAL_MAIL_API_URL || 'https://api.royalmail.net/shipping/v2'
  private apiKey = process.env.ROYAL_MAIL_API_KEY

  async getShippingOptions(request: ShippingQuoteRequest): Promise<ShippingOption[]> {
    if (!this.apiKey) {
      console.warn('Royal Mail API key not configured, using mock data')
      return this.getMockRoyalMailRates(request)
    }

    try {
      // Royal Mail API call structure
      const payload = {
        ReferenceId: `quote-${Date.now()}`,
        RequestedShipment: {
          ShipTimestamp: new Date().toISOString(),
          ServiceType: 'ALL', // Get all available services
          Shipper: {
            PostalCode: request.from.postcode,
            CountryCode: request.from.country || 'GB'
          },
          Recipient: {
            PostalCode: request.to.postcode,
            CountryCode: request.to.country || 'GB'
          },
          RequestedPackageLineItems: [{
            SequenceNumber: '1',
            Weight: {
              Units: 'KG',
              Value: request.dimensions.weight
            },
            Dimensions: {
              Length: request.dimensions.length,
              Width: request.dimensions.width,
              Height: request.dimensions.height,
              Units: 'CM'
            },
            InsuredValue: {
              Amount: request.value || 0,
              Currency: 'GBP'
            }
          }]
        }
      }

      const response = await fetch(`${this.baseUrl}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Royal Mail API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseRoyalMailResponse(data)

    } catch (error) {
      console.error('Royal Mail API error:', error)
      return this.getMockRoyalMailRates(request)
    }
  }

  private parseRoyalMailResponse(data: any): ShippingOption[] {
    const options: ShippingOption[] = []

    if (data.RateReplyDetails) {
      data.RateReplyDetails.forEach((rate: any) => {
        options.push({
          id: `rm-${rate.ServiceType}`,
          carrier: 'Royal Mail',
          service: this.getRoyalMailServiceName(rate.ServiceType),
          price: parseFloat(rate.RatedShipmentDetails[0]?.ShipmentRateDetail?.TotalNetCharge?.Amount || '0'),
          currency: 'GBP',
          estimatedDays: this.getRoyalMailDeliveryTime(rate.ServiceType),
          description: this.getRoyalMailDescription(rate.ServiceType),
          tracking: this.hasTracking(rate.ServiceType),
          insurance: rate.RatedShipmentDetails[0]?.ShipmentRateDetail?.InsuranceCharges?.Amount || 0
        })
      })
    }

    return options.sort((a, b) => a.price - b.price)
  }

  private getMockRoyalMailRates(request: ShippingQuoteRequest): ShippingOption[] {
    const basePrice = this.calculateBasePrice(request.dimensions, request.to.postcode)
    const isLargeItem = request.dimensions.length > 61 || request.dimensions.width > 46 || request.dimensions.height > 46
    const isHeavy = request.dimensions.weight > 2

    const options: ShippingOption[] = [
      {
        id: 'rm-2nd-class',
        carrier: 'Royal Mail',
        service: '2nd Class',
        price: Math.round((basePrice * 0.8) * 100) / 100,
        currency: 'GBP',
        estimatedDays: '2-3 working days',
        description: 'Standard delivery',
        tracking: false
      },
      {
        id: 'rm-1st-class',
        carrier: 'Royal Mail',
        service: '1st Class',
        price: Math.round(basePrice * 100) / 100,
        currency: 'GBP',
        estimatedDays: '1-2 working days',
        description: 'Fast delivery',
        tracking: false
      },
      {
        id: 'rm-tracked-48',
        carrier: 'Royal Mail',
        service: 'Tracked 48',
        price: Math.round((basePrice * 1.3) * 100) / 100,
        currency: 'GBP',
        estimatedDays: '2-3 working days',
        description: 'Tracked delivery',
        tracking: true
      },
      {
        id: 'rm-tracked-24',
        carrier: 'Royal Mail',
        service: 'Tracked 24',
        price: Math.round((basePrice * 1.6) * 100) / 100,
        currency: 'GBP',
        estimatedDays: '1-2 working days',
        description: 'Next day tracked delivery',
        tracking: true
      }
    ]

    // Add Special Delivery for valuable items
    if (request.value && request.value > 100) {
      options.push({
        id: 'rm-special-delivery',
        carrier: 'Royal Mail',
        service: 'Special Delivery Guaranteed',
        price: Math.round((basePrice * 2.2) * 100) / 100,
        currency: 'GBP',
        estimatedDays: 'Next working day by 1pm',
        description: 'Guaranteed next day with full insurance',
        tracking: true,
        insurance: request.value
      })
    }

    // Filter options based on size/weight restrictions
    return options.filter(option => {
      if (isLargeItem && option.service.includes('Class')) {
        return false // Standard classes have size limits
      }
      return true
    })
  }

  private calculateBasePrice(dimensions: ShippingDimensions, postcode: string): number {
    // Calculate volumetric weight
    const volumetricWeight = (dimensions.length * dimensions.width * dimensions.height) / 5000
    const chargeableWeight = Math.max(dimensions.weight, volumetricWeight)

    // Base pricing tiers
    let basePrice = 3.50 // Minimum price

    if (chargeableWeight <= 0.1) basePrice = 3.50
    else if (chargeableWeight <= 0.5) basePrice = 4.50
    else if (chargeableWeight <= 1.0) basePrice = 5.95
    else if (chargeableWeight <= 2.0) basePrice = 7.95
    else if (chargeableWeight <= 5.0) basePrice = 12.95
    else if (chargeableWeight <= 10.0) basePrice = 19.95
    else basePrice = 29.95

    // Add premium for remote areas (simplified check)
    const remoteAreas = ['IV', 'HS', 'KA27', 'KA28', 'KW', 'PA20', 'PA41', 'PA42', 'PA43', 'PA44', 'PA45', 'PA46', 'PA47', 'PA48', 'PA49', 'PA60', 'PA61', 'PA62', 'PA63', 'PA64', 'PA65', 'PA66', 'PA67', 'PA68', 'PA69', 'PA70', 'PA71', 'PA72', 'PA73', 'PA74', 'PA75', 'PA76', 'PA77', 'PA78', 'PH17', 'PH18', 'PH19', 'PH20', 'PH21', 'PH22', 'PH23', 'PH24', 'PH25', 'PH26', 'PH30', 'PH31', 'PH32', 'PH33', 'PH34', 'PH35', 'PH36', 'PH37', 'PH38', 'PH39', 'PH40', 'PH41', 'PH42', 'PH43', 'PH44', 'PH49', 'PH50', 'ZE', 'BT']
    const isRemote = remoteAreas.some(area => postcode.toUpperCase().startsWith(area))

    if (isRemote) {
      basePrice += 5.00 // Remote area surcharge
    }

    return basePrice
  }

  private getRoyalMailServiceName(serviceType: string): string {
    const serviceMap: Record<string, string> = {
      'PRIORITY_OVERNIGHT': 'Special Delivery Guaranteed',
      'FEDEX_2_DAY': 'Tracked 48',
      'FEDEX_GROUND': '2nd Class',
      'STANDARD_OVERNIGHT': 'Tracked 24'
    }
    return serviceMap[serviceType] || serviceType
  }

  private getRoyalMailDeliveryTime(serviceType: string): string {
    const timeMap: Record<string, string> = {
      'PRIORITY_OVERNIGHT': 'Next working day by 1pm',
      'STANDARD_OVERNIGHT': '1-2 working days',
      'FEDEX_2_DAY': '2-3 working days',
      'FEDEX_GROUND': '2-3 working days'
    }
    return timeMap[serviceType] || '2-3 working days'
  }

  private getRoyalMailDescription(serviceType: string): string {
    const descMap: Record<string, string> = {
      'PRIORITY_OVERNIGHT': 'Guaranteed next day with full insurance',
      'STANDARD_OVERNIGHT': 'Next day tracked delivery',
      'FEDEX_2_DAY': 'Tracked delivery',
      'FEDEX_GROUND': 'Standard delivery'
    }
    return descMap[serviceType] || 'Standard delivery'
  }

  private hasTracking(serviceType: string): boolean {
    return !serviceType.includes('GROUND') && !serviceType.includes('2nd') && !serviceType.includes('1st')
  }
}

// DPD integration for larger items
class DPDService {
  private baseUrl = process.env.DPD_API_URL || 'https://api.dpd.co.uk/shipping/v1'
  private apiKey = process.env.DPD_API_KEY

  async getShippingOptions(request: ShippingQuoteRequest): Promise<ShippingOption[]> {
    if (!this.apiKey) {
      return this.getMockDPDRates(request)
    }

    // DPD API implementation would go here
    return this.getMockDPDRates(request)
  }

  private getMockDPDRates(request: ShippingQuoteRequest): ShippingOption[] {
    const isLargeItem = request.dimensions.length > 100 || request.dimensions.width > 60 || request.dimensions.height > 60
    const isHeavy = request.dimensions.weight > 10

    // Only show DPD for larger/heavier items
    if (!isLargeItem && !isHeavy) {
      return []
    }

    const basePrice = 15.99
    const weightSurcharge = Math.max(0, (request.dimensions.weight - 10) * 2.50)

    return [
      {
        id: 'dpd-classic',
        carrier: 'DPD',
        service: 'DPD Classic',
        price: Math.round((basePrice + weightSurcharge) * 100) / 100,
        currency: 'GBP',
        estimatedDays: '1-2 working days',
        description: 'Next working day delivery with 1-hour time slot',
        tracking: true,
        size_restrictions: 'Max 175cm length, 300cm combined dimensions'
      },
      {
        id: 'dpd-express',
        carrier: 'DPD',
        service: 'DPD Express 10:30',
        price: Math.round((basePrice * 1.8 + weightSurcharge) * 100) / 100,
        currency: 'GBP',
        estimatedDays: 'Next working day by 10:30am',
        description: 'Guaranteed morning delivery',
        tracking: true
      }
    ]
  }
}

// Collection service for local pickup
class CollectionService {
  getCollectionOptions(sellerLocation: string, buyerLocation: string): ShippingOption[] {
    // Simple distance calculation based on postcodes (simplified)
    const distance = this.calculateDistance(sellerLocation, buyerLocation)

    const options: ShippingOption[] = []

    // Always offer collection
    options.push({
      id: 'collection',
      carrier: 'Collection',
      service: 'Collect in Person',
      price: 0,
      currency: 'GBP',
      estimatedDays: 'Arrange with seller',
      description: 'Meet seller to collect item',
      tracking: false
    })

    // Offer local delivery if within reasonable distance
    if (distance < 50) {
      options.push({
        id: 'local-delivery',
        carrier: 'Local Delivery',
        service: 'Local Delivery',
        price: Math.round(distance * 0.5 * 100) / 100, // 50p per mile
        currency: 'GBP',
        estimatedDays: '1-3 days',
        description: `Seller delivery within ${distance} miles`,
        tracking: false
      })
    }

    return options
  }

  private calculateDistance(postcode1: string, postcode2: string): number {
    // Simplified distance calculation
    // In real implementation, use postcode lookup API
    return Math.floor(Math.random() * 100) + 10
  }
}

// Main shipping service
export class ShippingService {
  private royalMail = new RoyalMailService()
  private dpd = new DPDService()
  private collection = new CollectionService()

  async calculateShipping(request: ShippingQuoteRequest): Promise<{
    success: boolean
    options: ShippingOption[]
    error?: string
  }> {
    try {
      const allOptions: ShippingOption[] = []

      // Get Royal Mail options
      const royalMailOptions = await this.royalMail.getShippingOptions(request)
      allOptions.push(...royalMailOptions)

      // Get DPD options for larger items
      const dpdOptions = await this.dpd.getShippingOptions(request)
      allOptions.push(...dpdOptions)

      // Get collection options
      const collectionOptions = this.collection.getCollectionOptions(
        request.from.postcode,
        request.to.postcode
      )
      allOptions.push(...collectionOptions)

      // Sort by price
      allOptions.sort((a, b) => a.price - b.price)

      return {
        success: true,
        options: allOptions
      }

    } catch (error) {
      console.error('Shipping calculation error:', error)
      return {
        success: false,
        options: [],
        error: 'Unable to calculate shipping rates at this time'
      }
    }
  }

  // Helper method to get standard golf equipment dimensions
  getStandardDimensions(category: string): Partial<ShippingDimensions> {
    const dimensionsMap: Record<string, Partial<ShippingDimensions>> = {
      'drivers': { length: 115, width: 15, height: 15, weight: 0.3 },
      'irons': { length: 100, width: 40, height: 15, weight: 3.5 },
      'putters': { length: 90, width: 15, height: 15, weight: 0.5 },
      'golf-bags': { length: 120, width: 25, height: 25, weight: 2.5 },
      'shoes': { length: 35, width: 25, height: 15, weight: 1.0 },
      'apparel': { length: 30, width: 25, height: 5, weight: 0.5 }
    }

    return dimensionsMap[category.toLowerCase()] || { length: 50, width: 30, height: 20, weight: 1.0 }
  }

  // Validate UK postcode format
  validatePostcode(postcode: string): boolean {
    const ukPostcodeRegex = /^([A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2})$/i
    return ukPostcodeRegex.test(postcode.replace(/\s/g, ' ').toUpperCase())
  }
}

// Export singleton instance
export const shippingService = new ShippingService()
