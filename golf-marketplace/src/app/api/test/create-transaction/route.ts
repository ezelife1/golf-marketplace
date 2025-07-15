import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createPaymentHold } from '@/lib/payment-hold'

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
    }

    // For testing purposes, we'll create test data without auth
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { scenario = 'basic' } = await request.json()

    // Get or create test users
    let seller = await db.user.findFirst({
      where: { email: 'seller@test.com' }
    })

    if (!seller) {
      seller = await db.user.create({
        data: {
          email: 'seller@test.com',
          name: 'Test Seller',
          subscriptionTier: 'pro',
          stripeAccountId: 'acct_test_seller_123'
        }
      })
    }

    let buyer = await db.user.findFirst({
      where: { email: 'buyer@test.com' }
    })

    if (!buyer) {
      buyer = await db.user.create({
        data: {
          email: 'buyer@test.com',
          name: 'Test Buyer'
        }
      })
    }

    // Create test category if needed
    let category = await db.category.findFirst({
      where: { name: 'Drivers' }
    })

    if (!category) {
      category = await db.category.create({
        data: {
          name: 'Drivers',
          slug: 'drivers',
          description: 'Golf drivers and woods'
        }
      })
    }

    // Create test product
    let product = await db.product.findFirst({
      where: { title: 'Test Golf Driver - TaylorMade' }
    })

    if (!product) {
      product = await db.product.create({
        data: {
          title: 'Test Golf Driver - TaylorMade',
          slug: 'test-golf-driver-taylormade',
          description: 'Test product for payout system testing',
          price: 150.00,
          brand: 'TaylorMade',
          condition: 'Excellent',
          sellerId: seller.id,
          categoryId: category.id,
          status: 'active',
          images: ['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop'],
          primaryImage: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop'
        }
      })
    }

    // Create test transaction based on scenario
    let transactionData: any = {
      productId: product.id,
      sellerId: seller.id,
      buyerEmail: buyer.email,
      amount: 150.00,
      commissionRate: 0.03, // 3% for pro seller
      commissionAmount: 4.50,
      sellerAmount: 145.50,
      status: 'pending',
      holdStatus: 'payment_held',
      paidAt: new Date(),
      stripeSessionId: `cs_test_${Date.now()}`,
      metadata: {
        testTransaction: true,
        scenario
      }
    }

    // Modify based on scenario
    switch (scenario) {
      case 'shipped':
        transactionData.holdStatus = 'shipped'
        transactionData.shippedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        transactionData.shippingTrackingNumber = 'TEST123456789'
        transactionData.shippingCarrier = 'Royal Mail'
        break

      case 'delivered':
        transactionData.holdStatus = 'delivered'
        transactionData.shippedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        transactionData.deliveredAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        transactionData.shippingTrackingNumber = 'TEST123456789'
        transactionData.shippingCarrier = 'Royal Mail'
        break

      case 'confirmed_ready':
        // This will create a transaction ready for payout (2+ hours ago)
        const confirmedTime = new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
        transactionData.holdStatus = 'confirmed'
        transactionData.shippedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        transactionData.deliveredAt = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        transactionData.deliveryConfirmedAt = confirmedTime
        transactionData.deliveryConfirmedBy = 'buyer_confirmed'
        transactionData.releasedAt = confirmedTime
        break

      case 'confirmed_recent':
        // This will create a transaction confirmed recently (less than 2 hours ago)
        const recentTime = new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        transactionData.holdStatus = 'confirmed'
        transactionData.shippedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        transactionData.deliveredAt = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        transactionData.deliveryConfirmedAt = recentTime
        transactionData.deliveryConfirmedBy = 'buyer_confirmed'
        transactionData.releasedAt = recentTime
        break
    }

    const transaction = await db.transaction.create({
      data: transactionData,
      include: {
        product: true,
        seller: true
      }
    })

    // Create payment hold
    const paymentHold = await createPaymentHold({
      transactionId: transaction.id,
      heldAmount: transaction.amount,
      currency: 'GBP',
      commissionAmount: transaction.commissionAmount,
      processingFee: 0.20
    })

    // Update payment hold based on scenario
    if (['confirmed_ready', 'confirmed_recent'].includes(scenario)) {
      const payoutScheduledTime = scenario === 'confirmed_ready'
        ? new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago (ready for payout)
        : new Date(Date.now() + 1.5 * 60 * 60 * 1000) // 1.5 hours from now (not ready yet)

      await db.paymentHold.update({
        where: { id: paymentHold.id },
        data: {
          status: 'released',
          reason: 'buyer_confirmed',
          releasedAt: transaction.deliveryConfirmedAt,
          metadata: {
            payoutScheduledAt: payoutScheduledTime.toISOString(),
            payoutStatus: scenario === 'confirmed_ready' ? 'ready' : 'scheduled',
            payoutDelay: '2_hours'
          }
        }
      })
    }

    // Log activity
    await db.activity.create({
      data: {
        userId: seller.id,
        type: 'test_transaction_created',
        description: `Test transaction created: ${scenario}`,
        metadata: {
          transactionId: transaction.id,
          scenario,
          testData: true
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Test transaction created with scenario: ${scenario}`,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        holdStatus: transaction.holdStatus,
        scenario,
        seller: transaction.seller.name,
        product: transaction.product.title
      },
      paymentHold: {
        id: paymentHold.id,
        status: paymentHold.status,
        metadata: paymentHold.metadata
      }
    })

  } catch (error: any) {
    console.error('Test transaction creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create test transaction', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  return NextResponse.json({
    message: 'Test transaction creator',
    scenarios: [
      'basic - Payment held, awaiting shipment',
      'shipped - Item marked as shipped',
      'delivered - Item delivered, awaiting confirmation',
      'confirmed_ready - Delivery confirmed 3+ hours ago (ready for payout)',
      'confirmed_recent - Delivery confirmed recently (not ready for payout yet)'
    ],
    usage: 'POST with { "scenario": "confirmed_ready" }'
  })
}
