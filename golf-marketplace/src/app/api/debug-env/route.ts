import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const stripePublishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const stripeSecret = process.env.STRIPE_SECRET_KEY

    return NextResponse.json({
      hasPublishableKey: !!stripePublishable,
      hasSecretKey: !!stripeSecret,
      publishableKeyStart: stripePublishable?.substring(0, 15) + '...',
      secretKeyStart: stripeSecret?.substring(0, 15) + '...',
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('STRIPE'))
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
