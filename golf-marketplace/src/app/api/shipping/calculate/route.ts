import { NextRequest, NextResponse } from 'next/server'
import { shippingService, ShippingQuoteRequest } from '@/lib/shipping'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      fromPostcode,
      toPostcode,
      length,
      width,
      height,
      weight,
      value,
      category
    } = body

    // Validate required fields
    if (!fromPostcode || !toPostcode || !length || !width || !height || !weight) {
      return NextResponse.json(
        { error: 'Missing required shipping information' },
        { status: 400 }
      )
    }

    // Validate postcodes
    if (!shippingService.validatePostcode(fromPostcode)) {
      return NextResponse.json(
        { error: 'Invalid seller postcode format' },
        { status: 400 }
      )
    }

    if (!shippingService.validatePostcode(toPostcode)) {
      return NextResponse.json(
        { error: 'Invalid buyer postcode format' },
        { status: 400 }
      )
    }

    // Create shipping request
    const shippingRequest: ShippingQuoteRequest = {
      from: {
        postcode: fromPostcode.toUpperCase().replace(/\s/g, ' '),
        country: 'GB'
      },
      to: {
        postcode: toPostcode.toUpperCase().replace(/\s/g, ' '),
        country: 'GB'
      },
      dimensions: {
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height),
        weight: parseFloat(weight)
      },
      value: value ? parseFloat(value) : undefined,
      category: category || 'general'
    }

    // Calculate shipping options
    const result = await shippingService.calculateShipping(shippingRequest)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to calculate shipping' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      options: result.options,
      fromPostcode: shippingRequest.from.postcode,
      toPostcode: shippingRequest.to.postcode
    })

  } catch (error) {
    console.error('Shipping calculation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')

  if (category) {
    const dimensions = shippingService.getStandardDimensions(category)
    return NextResponse.json({
      category,
      standardDimensions: dimensions,
      message: 'Use POST /api/shipping/calculate to get shipping quotes'
    })
  }

  return NextResponse.json({
    message: 'Shipping calculation API',
    usage: 'POST with fromPostcode, toPostcode, dimensions, weight, value',
    supportedCarriers: ['Royal Mail', 'DPD', 'Collection'],
    example: {
      fromPostcode: 'SW1A 1AA',
      toPostcode: 'M1 1AA',
      length: 115,
      width: 15,
      height: 15,
      weight: 0.3,
      value: 240,
      category: 'drivers'
    }
  })
}
