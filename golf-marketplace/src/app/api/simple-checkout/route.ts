import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

export async function GET() {
  try {
    console.log('Creating simple checkout session...')

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Test Golf Club',
            },
            unit_amount: 10000, // £100
          },
          quantity: 1,
        },
      ],
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    })

    console.log('Session created:', session.id, session.url)

    // Return both JSON and try redirect
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      redirect: true
    })

  } catch (error: any) {
    console.error('Simple checkout failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.type
    }, { status: 500 })
  }
}
