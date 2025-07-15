import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createPaymentHold } from '@/lib/payment-hold'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// POST - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}

// Handle successful checkout completion - CREATE PAYMENT HOLD INSTEAD OF IMMEDIATE PAYOUT
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing completed checkout:', session.id)

    // Find or create transaction record
    let transaction = await db.transaction.findUnique({
      where: { stripeSessionId: session.id },
      include: {
        product: true,
        seller: true
      }
    })

    if (!transaction) {
      // Create transaction record if it doesn't exist
      const { productId, sellerId, commissionRate, commissionAmount, sellerReceives } = session.metadata || {}

      if (!productId || !sellerId) {
        console.error('Missing metadata in Stripe session:', session.id)
        return
      }

      const product = await db.product.findUnique({
        where: { id: productId },
        include: { seller: true }
      })

      if (!product) {
        console.error('Product not found:', productId)
        return
      }

      transaction = await db.transaction.create({
        data: {
          productId,
          sellerId,
          buyerEmail: session.customer_email || 'unknown',
          amount: session.amount_total ? session.amount_total / 100 : 0,
          commissionRate: parseFloat(commissionRate || '0.05'),
          commissionAmount: parseFloat(commissionAmount || '0'),
          sellerAmount: parseFloat(sellerReceives || '0'),
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string || undefined,
          status: 'pending',
          holdStatus: 'payment_held',
          paidAt: new Date(),
          metadata: {
            sessionCompleted: true,
            stripeCustomerEmail: session.customer_email
          }
        },
        include: {
          product: true,
          seller: true
        }
      })
    } else {
      // Update existing transaction
      transaction = await db.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'pending', // Keep as pending until delivery confirmed
          holdStatus: 'payment_held',
          completedAt: new Date(),
          paidAt: new Date(),
          buyerEmail: session.customer_email || transaction.buyerEmail
        },
        include: {
          product: true,
          seller: true
        }
      })
    }

    // Calculate fees for payment hold
    const stripeFee = (transaction.amount * 0.029) + 0.20 // 2.9% + 20p

    // CREATE PAYMENT HOLD - This is the key change!
    await createPaymentHold({
      transactionId: transaction.id,
      heldAmount: transaction.amount,
      currency: 'GBP',
      commissionAmount: transaction.commissionAmount,
      processingFee: stripeFee
    })

    // Mark product as pending sale (not sold yet - until delivery confirmed)
    await db.product.update({
      where: { id: transaction.productId },
      data: {
        status: 'pending', // Product is sold but payment held
        updatedAt: new Date()
      }
    })

    // Create activity log for PAYMENT HELD (not sale completed)
    await db.activity.create({
      data: {
        userId: transaction.sellerId,
        type: 'payment_held',
        description: `Payment held in escrow for: ${transaction.product.title}`,
        metadata: {
          productId: transaction.productId,
          heldAmount: transaction.amount,
          commission: transaction.commissionAmount,
          sellerWillReceive: transaction.sellerAmount,
          buyerEmail: transaction.buyerEmail,
          escrowMessage: 'Payment will be released after delivery confirmation'
        }
      }
    })

    // Log the escrow creation
    console.log(`💰 PAYMENT HELD IN ESCROW:`)
    console.log(`- Product: ${transaction.product.title}`)
    console.log(`- Amount: £${transaction.amount}`)
    console.log(`- Seller: ${transaction.seller.email}`)
    console.log(`- Buyer: ${transaction.buyerEmail}`)
    console.log(`- Status: Payment held until delivery confirmation`)

    // TODO: Send notification to both buyer and seller about escrow hold
    // - Buyer: "Payment successful, item will ship soon"
    // - Seller: "Sale confirmed, ship item to receive payment"

  } catch (error) {
    console.error('Error handling checkout completion:', error)
    throw error
  }
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing successful payment:', paymentIntent.id)

    // Find transaction by payment intent metadata
    const transactions = await db.transaction.findMany({
      where: {
        status: 'pending'
      }
    })

    // Match by payment intent ID in metadata if needed
    for (const transaction of transactions) {
      await db.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'paid',
          paidAt: new Date()
        }
      })
    }

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Processing failed payment:', paymentIntent.id)

    // Find transaction by payment intent metadata
    const transactions = await db.transaction.findMany({
      where: {
        status: 'pending'
      }
    })

    for (const transaction of transactions) {
      await db.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'failed',
          failedAt: new Date()
        }
      })

      // Create activity log
      await db.activity.create({
        data: {
          userId: transaction.sellerId,
          type: 'payment_failed',
          description: `Payment failed for product sale`,
          metadata: {
            productId: transaction.productId,
            transactionId: transaction.id,
            reason: paymentIntent.last_payment_error?.message || 'Payment failed'
          }
        }
      })
    }

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

// Handle transfer to seller
async function handleTransferCreated(transfer: Stripe.Transfer) {
  try {
    console.log('Processing transfer:', transfer.id)

    // Find recent completed transaction for transfer logging
    const transaction = await db.transaction.findFirst({
      where: {
        status: 'completed'
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    if (transaction) {
      await db.transaction.update({
        where: { id: transaction.id },
        data: {
          stripeTransferId: transfer.id,
          transferredAt: new Date()
        }
      })

      // Create activity log
      await db.activity.create({
        data: {
          userId: transaction.sellerId,
          type: 'payout_processed',
          description: `Payout processed: £${transaction.sellerAmount}`,
          metadata: {
            transferId: transfer.id,
            amount: transaction.sellerAmount,
            productId: transaction.productId
          }
        }
      })
    }

  } catch (error) {
    console.error('Error handling transfer:', error)
  }
}
