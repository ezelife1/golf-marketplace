import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          // Handle successful subscription creation
          console.log('Subscription created:', session.id)

          // Here you would update your database with the subscription info
          // await updateUserSubscription({
          //   userId: session.metadata?.userId,
          //   subscriptionId: session.subscription,
          //   customerId: session.customer,
          //   plan: session.metadata?.plan,
          //   status: 'trialing'
          // })
        } else {
          // Handle successful one-time payment
          console.log('Payment completed:', session.id)

          // Here you would process the service purchase
          // await processServicePurchase({
          //   userId: session.metadata?.userId,
          //   serviceType: session.metadata?.serviceType,
          //   serviceId: session.metadata?.serviceId,
          //   paymentIntentId: session.payment_intent
          // })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Handle subscription changes (trial ending, plan changes, etc.)
        console.log('Subscription updated:', subscription.id)

        // await updateUserSubscription({
        //   subscriptionId: subscription.id,
        //   status: subscription.status,
        //   currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        //   cancelAtPeriodEnd: subscription.cancel_at_period_end
        // })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Handle subscription cancellation
        console.log('Subscription canceled:', subscription.id)

        // await updateUserSubscription({
        //   subscriptionId: subscription.id,
        //   status: 'canceled',
        //   canceledAt: new Date()
        // })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice

        // Handle successful recurring payment
        console.log('Invoice paid:', invoice.id)

        // await recordPayment({
        //   invoiceId: invoice.id,
        //   subscriptionId: invoice.subscription,
        //   amount: invoice.amount_paid,
        //   paidAt: new Date(invoice.status_transitions.paid_at! * 1000)
        // })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        // Handle failed payment
        console.log('Invoice payment failed:', invoice.id)

        // await handleFailedPayment({
        //   invoiceId: invoice.id,
        //   subscriptionId: invoice.subscription,
        //   customerId: invoice.customer
        // })
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
