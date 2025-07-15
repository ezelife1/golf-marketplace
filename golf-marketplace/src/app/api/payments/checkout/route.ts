import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { shippingService } from '@/lib/shipping'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      productId,
      buyerEmail,
      successUrl,
      cancelUrl,
      shippingOptionId,
      buyerPostcode
    } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Fetch real product data from database
    const product = await db.product.findFirst({
      where: {
        id: productId,
        status: 'active'
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            subscriptionTier: true,
            pgaVerified: true,
            location: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or no longer available' },
        { status: 404 }
      )
    }

    console.log(`Creating checkout for: ${product.title} - £${product.price}`)

    // Calculate commission based on seller subscription
    const getCommissionRate = (subscriptionTier: string | null): number => {
      switch (subscriptionTier) {
        case 'pga-pro': return 0.01 // 1%
        case 'business': return 0.03 // 3%
        case 'pro': return 0.03 // 3%
        case 'free':
        default: return 0.05 // 5%
      }
    }

    const commissionRate = getCommissionRate(product.seller.subscriptionTier)
    const commissionAmount = product.price * commissionRate
    const sellerReceives = product.price - commissionAmount

    // Line items array
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: product.title,
            description: `${product.brand} ${product.condition} condition`,
            images: Array.isArray(product.images) && product.images.length > 0 ? [product.images[0] as string] : undefined,
          },
          unit_amount: Math.round(product.price * 100), // Convert to pence
        },
        quantity: 1,
      }
    ]

    // Calculate shipping if not included and shipping option provided
    let shippingCost = 0
    let shippingDescription = ''

    const shippingData = product.shipping as any
    if (!shippingData?.included && shippingOptionId && buyerPostcode) {
      try {
        const shippingRequest = {
          from: {
            postcode: shippingData?.postcode || 'SW1A 1AA',
            country: 'GB'
          },
          to: {
            postcode: buyerPostcode,
            country: 'GB'
          },
          dimensions: shippingData?.dimensions || {
            length: 50,
            width: 30,
            height: 20,
            weight: 1.0
          },
          value: product.price,
          category: (product.category as any)?.name?.toLowerCase() || 'golf-equipment'
        }

        const shippingResult = await shippingService.calculateShipping(shippingRequest)

        if (shippingResult.success) {
          const selectedShipping = shippingResult.options.find(opt => opt.id === shippingOptionId)

          if (selectedShipping && selectedShipping.price > 0) {
            shippingCost = selectedShipping.price
            shippingDescription = `${selectedShipping.carrier} - ${selectedShipping.service}`

            // Add shipping as separate line item
            lineItems.push({
              price_data: {
                currency: 'gbp',
                product_data: {
                  name: 'Shipping',
                  description: shippingDescription,
                },
                unit_amount: Math.round(shippingCost * 100),
              },
              quantity: 1,
            })
          }
        }
      } catch (shippingError) {
        console.warn('Shipping calculation failed during checkout:', shippingError)
        // Continue without shipping - seller will arrange separately
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/products/${productId}`,
      customer_email: buyerEmail,
      metadata: {
        productId: product.id,
        sellerId: product.seller.id,
        commissionRate: commissionRate.toString(),
        commissionAmount: commissionAmount.toFixed(2),
        sellerReceives: sellerReceives.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        shippingOption: shippingDescription
      },
      payment_intent_data: {
        description: `ClubUp: ${product.title}`,
        metadata: {
          productId: product.id,
          sellerId: product.seller.id,
          productTitle: product.title,
          sellerName: product.seller.name,
          commission: commissionAmount.toFixed(2),
          shipping: shippingCost.toFixed(2)
        }
      }
    })

    // Log transaction for tracking
    await db.activity.create({
      data: {
        userId: product.seller.id,
        type: 'checkout_initiated',
        description: `Checkout started for: ${product.title}`,
        metadata: {
          productId: product.id,
          sessionId: session.id,
          amount: product.price + shippingCost,
          commission: commissionAmount,
          shipping: shippingCost,
          buyerEmail
        }
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      commission: {
        rate: commissionRate,
        amount: commissionAmount,
        sellerReceives: sellerReceives
      },
      shipping: {
        cost: shippingCost,
        description: shippingDescription
      },
      total: product.price + shippingCost
    })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout failed', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Checkout API is working' })
}
