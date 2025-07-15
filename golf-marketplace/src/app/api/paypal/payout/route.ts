import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  createPayPalPayout,
  getPayPalPayoutBatch,
  getPayPalPayoutItem,
  calculatePayPalPayout,
  verifyPayPalAccount
} from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, ...data } = await request.json()

    switch (action) {
      case 'create_payout': {
        const { transactionId, sellerId, amount, description, receiverEmail } = data

        if (!transactionId || !sellerId || !amount || !receiverEmail) {
          return NextResponse.json({
            error: 'Missing required fields: transactionId, sellerId, amount, receiverEmail'
          }, { status: 400 })
        }

        // Get seller information
        const seller = await db.user.findUnique({
          where: { id: sellerId },
          select: {
            id: true,
            email: true,
            name: true,
            subscriptionTier: true
          }
        })

        if (!seller) {
          return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
        }

        // Check if payout already exists for this transaction
        const existingPayout = await db.payout.findFirst({
          where: { transactionId }
        })

        if (existingPayout) {
          return NextResponse.json({
            error: 'Payout already processed for this transaction',
            payoutId: existingPayout.id
          }, { status: 400 })
        }

        // Verify PayPal account
        const accountVerification = await verifyPayPalAccount(receiverEmail)
        if (!accountVerification.valid) {
          return NextResponse.json({
            error: 'Invalid PayPal account',
            details: accountVerification.error
          }, { status: 400 })
        }

        // Calculate payout amounts
        const payoutCalculation = calculatePayPalPayout(amount, seller.subscriptionTier)

        if (payoutCalculation.netAmount <= 0) {
          return NextResponse.json({
            error: 'Payout amount is zero or negative after fees',
            calculation: payoutCalculation
          }, { status: 400 })
        }

        // Create PayPal payout
        const paypalPayout = await createPayPalPayout({
          receiverEmail,
          amount: payoutCalculation.netAmount.toFixed(2),
          currency: 'GBP',
          note: description || `ClubUp sale payout - Transaction ${transactionId}`,
          transactionId,
          sellerId
        })

        // Record payout in database
        const payout = await db.payout.create({
          data: {
            transactionId,
            sellerId,
            payoutMethod: 'paypal',
            grossAmount: payoutCalculation.grossAmount,
            commissionAmount: payoutCalculation.commissionAmount,
            stripeFee: 0, // No Stripe fee for PayPal payouts
            netAmount: payoutCalculation.netAmount,
            status: 'processing',
            paypalPayoutId: paypalPayout.items?.[0]?.payout_item_id || '',
            paypalBatchId: paypalPayout.batch_header?.payout_batch_id || '',
            processedAt: new Date(),
            metadata: {
              paypalPayoutId: paypalPayout.items?.[0]?.payout_item_id,
              paypalBatchId: paypalPayout.batch_header?.payout_batch_id,
              receiverEmail,
              paypalFee: payoutCalculation.paypalFee
            }
          }
        })

        // Log activity
        await db.activity.create({
          data: {
            userId: sellerId,
            type: 'paypal_payout_created',
            description: `PayPal payout created: £${payoutCalculation.netAmount.toFixed(2)}`,
            metadata: {
              payoutId: payout.id,
              transactionId,
              paypalPayoutId: paypalPayout.items?.[0]?.payout_item_id,
              netAmount: payoutCalculation.netAmount
            }
          }
        })

        console.log('PayPal payout created successfully:', {
          payoutId: payout.id,
          paypalPayoutId: paypalPayout.items?.[0]?.payout_item_id,
          sellerId,
          netAmount: payoutCalculation.netAmount
        })

        return NextResponse.json({
          success: true,
          payout: {
            id: payout.id,
            paypalPayoutId: paypalPayout.items?.[0]?.payout_item_id,
            paypalBatchId: paypalPayout.batch_header?.payout_batch_id,
            netAmount: payoutCalculation.netAmount,
            status: 'processing'
          },
          calculation: payoutCalculation,
          message: 'PayPal payout created successfully'
        })
      }

      case 'verify_account': {
        const { email } = data

        if (!email) {
          return NextResponse.json({
            error: 'Email is required'
          }, { status: 400 })
        }

        const verification = await verifyPayPalAccount(email)

        return NextResponse.json({
          success: true,
          verification
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('PayPal payout API error:', error)

    // Log failed payout attempt
    try {
      const { transactionId, sellerId } = await request.json()
      if (transactionId && sellerId) {
        await db.activity.create({
          data: {
            userId: sellerId,
            type: 'paypal_payout_failed',
            description: `PayPal payout failed: ${error.message}`,
            metadata: {
              transactionId,
              error: error.message,
              stack: error.stack
            }
          }
        })
      }
    } catch (logError) {
      console.error('Failed to log PayPal payout error:', logError)
    }

    return NextResponse.json(
      { error: 'Failed to process PayPal payout', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const payoutId = searchParams.get('payoutId')
    const batchId = searchParams.get('batchId')
    const itemId = searchParams.get('itemId')
    const sellerId = searchParams.get('sellerId')

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (payoutId) {
      // Get specific payout details
      const payout = await db.payout.findUnique({
        where: { id: payoutId },
        include: {
          transaction: {
            select: {
              id: true,
              productId: true,
              amount: true,
              status: true,
              createdAt: true
            }
          }
        }
      })

      if (!payout) {
        return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
      }

      // Check authorization
      if (payout.sellerId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      // Get PayPal payout status if available
      let paypalStatus = null
      if (payout.paypalPayoutId) {
        try {
          paypalStatus = await getPayPalPayoutItem(payout.paypalPayoutId)
        } catch (error) {
          console.error('Error fetching PayPal payout status:', error)
        }
      }

      return NextResponse.json({
        success: true,
        payout: {
          ...payout,
          paypalStatus
        }
      })
    }

    if (batchId) {
      // Get PayPal batch details
      try {
        const batchDetails = await getPayPalPayoutBatch(batchId)
        return NextResponse.json({
          success: true,
          batch: batchDetails
        })
      } catch (error: any) {
        return NextResponse.json({
          error: 'Failed to fetch batch details',
          details: error.message
        }, { status: 500 })
      }
    }

    if (itemId) {
      // Get PayPal payout item details
      try {
        const itemDetails = await getPayPalPayoutItem(itemId)
        return NextResponse.json({
          success: true,
          item: itemDetails
        })
      } catch (error: any) {
        return NextResponse.json({
          error: 'Failed to fetch payout item details',
          details: error.message
        }, { status: 500 })
      }
    }

    // Get seller's PayPal payouts
    const targetSellerId = sellerId || user.id

    if (sellerId && sellerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const payouts = await db.payout.findMany({
      where: {
        sellerId: targetSellerId,
        payoutMethod: 'paypal'
      },
      orderBy: { processedAt: 'desc' },
      take: 20,
      include: {
        transaction: {
          select: {
            id: true,
            productId: true,
            amount: true,
            status: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      payouts: payouts.map(payout => ({
        id: payout.id,
        transactionId: payout.transactionId,
        grossAmount: payout.grossAmount,
        commissionAmount: payout.commissionAmount,
        paypalFee: (payout.metadata as any)?.paypalFee || 0.20,
        netAmount: payout.netAmount,
        status: payout.status,
        processedAt: payout.processedAt,
        paypalPayoutId: payout.paypalPayoutId,
        paypalBatchId: payout.paypalBatchId,
        receiverEmail: (payout.metadata as any)?.receiverEmail,
        transaction: payout.transaction
      }))
    })

  } catch (error: any) {
    console.error('Error getting PayPal payout details:', error)
    return NextResponse.json(
      { error: 'Failed to get payout details', details: error.message },
      { status: 500 }
    )
  }
}
