import { NextRequest, NextResponse } from 'next/server'
import { stripe, SERVICES } from '@/lib/stripe'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serviceType, serviceId, metadata } = await req.json()

    // Validate service and get pricing
    let service
    let serviceName
    let price

    switch (serviceType) {
      case 'quickBump':
        service = SERVICES.quickBump[serviceId as keyof typeof SERVICES.quickBump]
        serviceName = `Quick Bump - ${service.name}`
        price = service.price
        break
      case 'professional':
        service = SERVICES.professional[serviceId as keyof typeof SERVICES.professional]
        serviceName = service.name
        price = service.price
        break
      case 'featured':
        service = SERVICES.featured[serviceId as keyof typeof SERVICES.featured]
        serviceName = service.name
        price = service.price
        break
      case 'swap':
        service = SERVICES.swap[serviceId as keyof typeof SERVICES.swap]
        serviceName = service.name
        price = service.price
        break
      default:
        return NextResponse.json({ error: 'Invalid service type' }, { status: 400 })
    }

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 400 })
    }

    // Create or retrieve customer
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1
    })

    let customer
    if (customers.data.length > 0) {
      customer = customers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id || ''
        }
      })
    }

    // Create checkout session for one-time payment
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: serviceName,
              description: `ClubUp ${serviceName}`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=service&service=${serviceName}&amount=${(price/100).toFixed(2)}`,
      cancel_url: `${req.headers.get('origin')}/payment/cancelled?reason=cancelled&type=service`,
      metadata: {
        userId: session.user.id || '',
        serviceType,
        serviceId,
        ...metadata
      }
    })

    return NextResponse.json({ url: checkoutSession.url })

  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
