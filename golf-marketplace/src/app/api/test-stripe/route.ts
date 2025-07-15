import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export async function GET() {
  try {
    console.log('Testing Stripe connection...')
    console.log('Stripe Secret Key exists:', !!process.env.STRIPE_SECRET_KEY)
    console.log('Stripe Secret Key prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 12))

    // Test creating a simple checkout session
    const testSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Test Product',
            },
            unit_amount: 1000, // £10.00
          },
          quantity: 1,
        },
      ],
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    })

    console.log('Test session created successfully:', testSession.id)

    return NextResponse.json({
      success: true,
      sessionId: testSession.id,
      url: testSession.url,
      message: 'Stripe connection working'
    })

  } catch (error: any) {
    console.error('Stripe test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.type,
      code: error.code
    }, { status: 500 })
  }
}
