import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  createTransfer,
  calculateSellerPayout,
  getAccountTransfers
} from '@/lib/stripe-connect'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { transactionId, sellerId, amount, description } = await request.json()

    if (!transactionId || !sellerId || !amount) {
      return NextResponse.json({
        error: 'Missing required fields: transactionId, sellerId, amount'
      }, { status: 400 })
    }

    // Get seller information
    const seller = await db.user.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        email: true,
        name: true,
        stripeAccountId: true,
        subscriptionTier: true
      }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    if (!seller.stripeAccountId) {
      return NextResponse.json({
        error: 'Seller has not set up payout account'
      }, { status: 400 })
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

    // Calculate payout amounts
    const payoutCalculation = calculateSellerPayout(amount, seller.subscriptionTier)

    if (payoutCalculation.netAmount <= 0) {
      return NextResponse.json({
        error: 'Payout amount is zero or negative after fees',
        calculation: payoutCalculation
      }, { status: 400 })
    }

    // Create transfer to seller's Connect account
    const transfer = await createTransfer({
      accountId: seller.stripeAccountId,
      amount: payoutCalculation.netAmount,
      description: description || `ClubUp sale payout - Transaction ${transactionId}`,
      metadata: {
        transactionId,
        sellerId,
        grossAmount: amount.toString(),
        commissionAmount: payoutCalculation.commissionAmount.toString(),
        subscriptionTier: seller.subscriptionTier || 'free'
      }
    })

    // Record payout in database
    const payout = await db.payout.create({
      data: {
        transactionId,
        sellerId,
        stripeTransferId: transfer.id,
        grossAmount: payoutCalculation.grossAmount,
        commissionAmount: payoutCalculation.commissionAmount,
        stripeFee: payoutCalculation.stripeFee,
        netAmount: payoutCalculation.netAmount,
        status: 'completed',
        processedAt: new Date(),
        metadata: {
          stripeAccountId: seller.stripeAccountId,
          transferId: transfer.id,
          currency: transfer.currency
        }
      }
    })

    // Log activity
    await db.activity.create({
      data: {
        userId: sellerId,
        type: 'payout_processed',
        description: `Payout processed: £${payoutCalculation.netAmount.toFixed(2)}`,
        metadata: {
          payoutId: payout.id,
          transactionId,
          transferId: transfer.id,
          grossAmount: payoutCalculation.grossAmount,
          netAmount: payoutCalculation.netAmount
        }
      }
    })

    console.log('Payout processed successfully:', {
      payoutId: payout.id,
      transferId: transfer.id,
      sellerId,
      netAmount: payoutCalculation.netAmount
    })

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        transferId: transfer.id,
        netAmount: payoutCalculation.netAmount,
        status: 'completed'
      },
      calculation: payoutCalculation,
      message: 'Payout processed successfully'
    })

  } catch (error: any) {
    console.error('Payout processing error:', error)

    // Log failed payout attempt
    try {
      const { transactionId, sellerId } = await request.json()
      if (transactionId && sellerId) {
        await db.activity.create({
          data: {
            userId: sellerId,
            type: 'payout_failed',
            description: `Payout failed: ${error.message}`,
            metadata: {
              transactionId,
              error: error.message,
              stack: error.stack
            }
          }
        })
      }
    } catch (logError) {
      console.error('Failed to log payout error:', logError)
    }

    return NextResponse.json(
      { error: 'Failed to process payout', details: error.message },
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
    const sellerId = searchParams.get('sellerId')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        stripeAccountId: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If sellerId is provided, check authorization
    if (sellerId && sellerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const targetSellerId = sellerId || user.id

    // Get payouts from database
    const payouts = await db.payout.findMany({
      where: { sellerId: targetSellerId },
      orderBy: { processedAt: 'desc' },
      take: limit,
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

    // Also get Stripe transfer history if Connect account exists
    let stripeTransfers = []
    if (user.stripeAccountId) {
      try {
        stripeTransfers = await getAccountTransfers(user.stripeAccountId, limit)
      } catch (error) {
        console.error('Error fetching Stripe transfers:', error)
        // Continue without Stripe data
      }
    }

    return NextResponse.json({
      success: true,
      payouts: payouts.map(payout => ({
        id: payout.id,
        transactionId: payout.transactionId,
        grossAmount: payout.grossAmount,
        commissionAmount: payout.commissionAmount,
        stripeFee: payout.stripeFee,
        netAmount: payout.netAmount,
        status: payout.status,
        processedAt: payout.processedAt,
        stripeTransferId: payout.stripeTransferId,
        transaction: payout.transaction
      })),
      stripeTransfers,
      hasConnectAccount: !!user.stripeAccountId
    })

  } catch (error: any) {
    console.error('Error getting payout history:', error)
    return NextResponse.json(
      { error: 'Failed to get payout history', details: error.message },
      { status: 500 }
    )
  }
}
