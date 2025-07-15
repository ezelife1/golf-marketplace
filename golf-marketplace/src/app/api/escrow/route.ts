import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, transactionId, ...data } = await request.json()

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 })
    }

    // Get transaction with hold details
    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
      include: {
        paymentHold: true,
        seller: { select: { id: true, email: true, name: true } },
        product: { select: { id: true, title: true } }
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Get current user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    switch (action) {
      case 'mark_shipped': {
        // Only seller can mark as shipped
        if (transaction.sellerId !== user.id) {
          return NextResponse.json({ error: 'Only seller can mark item as shipped' }, { status: 403 })
        }

        const { trackingNumber, carrier, estimatedDelivery } = data

        // Update transaction
        const updatedTransaction = await db.transaction.update({
          where: { id: transactionId },
          data: {
            holdStatus: 'shipped',
            shippedAt: new Date(),
            shippingTrackingNumber: trackingNumber,
            shippingCarrier: carrier || 'Unknown',
            // Estimate delivery in 3 days if not provided
            deliveredAt: estimatedDelivery ? new Date(estimatedDelivery) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          }
        })

        // Update payment hold
        if (transaction.paymentHold) {
          await db.paymentHold.update({
            where: { id: transaction.paymentHold.id },
            data: {
              reason: 'awaiting_delivery',
              deliveryConfirmationSent: false // Reset to send new confirmation
            }
          })
        }

        // Log activity
        await db.activity.create({
          data: {
            userId: user.id,
            type: 'item_shipped',
            description: `Item shipped for transaction ${transactionId}`,
            metadata: {
              transactionId,
              trackingNumber,
              carrier
            }
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Item marked as shipped',
          transaction: updatedTransaction
        })
      }

      case 'confirm_delivery': {
        // Only buyer can confirm delivery
        if (transaction.buyerEmail !== user.email) {
          return NextResponse.json({ error: 'Only buyer can confirm delivery' }, { status: 403 })
        }

        const { satisfied = true, notes } = data

        if (!satisfied) {
          // Buyer is not satisfied - create dispute
          await db.transaction.update({
            where: { id: transactionId },
            data: {
              holdStatus: 'disputed',
              disputedAt: new Date(),
              disputeReason: notes || 'Buyer reported issue with delivery'
            }
          })

          if (transaction.paymentHold) {
            await db.paymentHold.update({
              where: { id: transaction.paymentHold.id },
              data: {
                status: 'disputed',
                disputeRaised: true,
                disputeRaisedAt: new Date(),
                disputeRaisedBy: 'buyer',
                disputeReason: notes || 'Buyer reported issue with delivery'
              }
            })
          }

          // Log dispute
          await db.activity.create({
            data: {
              userId: user.id,
              type: 'delivery_disputed',
              description: `Buyer disputed delivery for transaction ${transactionId}`,
              metadata: {
                transactionId,
                reason: notes
              }
            }
          })

          return NextResponse.json({
            success: true,
            message: 'Delivery dispute raised. Our support team will review.',
            disputed: true
          })
        }

        // Buyer is satisfied - confirm delivery and SCHEDULE payout for 2 hours later
        const now = new Date()
        const payoutScheduledAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now

        await db.transaction.update({
          where: { id: transactionId },
          data: {
            holdStatus: 'confirmed',
            deliveryConfirmedAt: now,
            deliveryConfirmedBy: 'buyer_confirmed',
            releasedAt: now // Hold released immediately for tracking
          }
        })

        if (transaction.paymentHold) {
          await db.paymentHold.update({
            where: { id: transaction.paymentHold.id },
            data: {
              status: 'released',
              reason: 'buyer_confirmed',
              releasedAt: now,
              autoReleaseExecutedAt: now,
              // Schedule payout for 2 hours after confirmation
              metadata: {
                ...((transaction.paymentHold.metadata as any) || {}),
                payoutScheduledAt: payoutScheduledAt.toISOString(),
                payoutStatus: 'scheduled',
                payoutDelay: '2_hours'
              }
            }
          })
        }

        // Log confirmation with scheduled payout info
        await db.activity.create({
          data: {
            userId: user.id,
            type: 'delivery_confirmed',
            description: `Buyer confirmed delivery for transaction ${transactionId}`,
            metadata: {
              transactionId,
              confirmedAt: now.toISOString(),
              payoutScheduledAt: payoutScheduledAt.toISOString(),
              notes
            }
          }
        })

        // TODO: Trigger scheduled payout process (2 hours later)
        // This could be done via:
        // 1. Background job/cron that runs every hour and checks for eligible payouts
        // 2. Serverless function with delay
        // 3. Queue system with delayed execution
        console.log(`💰 PAYOUT SCHEDULED: Transaction ${transactionId} - Payout at ${payoutScheduledAt.toISOString()}`)

        return NextResponse.json({
          success: true,
          message: 'Delivery confirmed. Seller will be paid in 2 hours.',
          confirmed: true,
          payoutScheduledAt: payoutScheduledAt.toISOString()
        })
      }

      case 'request_release': {
        // Only seller can request release
        if (transaction.sellerId !== user.id) {
          return NextResponse.json({ error: 'Only seller can request payment release' }, { status: 403 })
        }

        // Check if enough time has passed (delivery + 7 days)
        const deliveryDate = transaction.deliveredAt
        if (!deliveryDate) {
          return NextResponse.json({
            error: 'Cannot request release until item is marked as delivered'
          }, { status: 400 })
        }

        const daysSinceDelivery = (Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceDelivery < 7) {
          return NextResponse.json({
            error: `Must wait ${Math.ceil(7 - daysSinceDelivery)} more days after delivery before requesting release`
          }, { status: 400 })
        }

        const now = new Date()

        await db.transaction.update({
          where: { id: transactionId },
          data: {
            holdStatus: 'release_requested',
            releaseRequestedAt: now,
            // Give buyer 1 more day to respond
            finalReleaseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        })

        if (transaction.paymentHold) {
          await db.paymentHold.update({
            where: { id: transaction.paymentHold.id },
            data: {
              sellerReleaseRequested: true,
              sellerReleaseRequestedAt: now,
              reason: 'seller_requested',
              // Auto-release in 24 hours if buyer doesn't respond
              autoReleaseEligibleAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
          })
        }

        // Log release request
        await db.activity.create({
          data: {
            userId: user.id,
            type: 'release_requested',
            description: `Seller requested payment release for transaction ${transactionId}`,
            metadata: {
              transactionId,
              requestedAt: now.toISOString(),
              autoReleaseAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
          }
        })

        // TODO: Send notification to buyer about release request

        return NextResponse.json({
          success: true,
          message: 'Release requested. Buyer has 24 hours to respond, then payment will be automatically released.',
          releaseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
        })
      }

      case 'auto_release': {
        // This would be called by a background job/cron
        // Check if auto-release is eligible

        if (!transaction.paymentHold?.autoReleaseEligibleAt) {
          return NextResponse.json({ error: 'Auto-release not eligible' }, { status: 400 })
        }

        const now = new Date()
        if (now < transaction.paymentHold.autoReleaseEligibleAt) {
          return NextResponse.json({
            error: 'Auto-release time not reached yet'
          }, { status: 400 })
        }

        await db.transaction.update({
          where: { id: transactionId },
          data: {
            holdStatus: 'released',
            releasedAt: now,
            deliveryConfirmedBy: 'auto_confirmed'
          }
        })

        await db.paymentHold.update({
          where: { id: transaction.paymentHold.id },
          data: {
            status: 'released',
            reason: 'auto_release',
            releasedAt: now,
            autoReleaseExecutedAt: now
          }
        })

        // Log auto-release
        await db.activity.create({
          data: {
            userId: transaction.sellerId,
            type: 'auto_release_executed',
            description: `Payment automatically released for transaction ${transactionId}`,
            metadata: {
              transactionId,
              releasedAt: now.toISOString(),
              reason: 'auto_release_timeout'
            }
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Payment automatically released to seller',
          autoReleased: true
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Escrow API error:', error)
    return NextResponse.json(
      { error: 'Failed to process escrow action', details: error.message },
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
    const transactionId = searchParams.get('transactionId')
    const status = searchParams.get('status')
    const userRole = searchParams.get('role') // 'buyer' or 'seller'

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (transactionId) {
      // Get specific transaction hold status
      const transaction = await db.transaction.findUnique({
        where: { id: transactionId },
        include: {
          paymentHold: true,
          product: {
            select: { id: true, title: true, primaryImage: true }
          },
          seller: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }

      // Check authorization
      const isBuyer = transaction.buyerEmail === user.email
      const isSeller = transaction.sellerId === user.id

      if (!isBuyer && !isSeller) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      return NextResponse.json({
        success: true,
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          holdStatus: transaction.holdStatus,
          shippedAt: transaction.shippedAt,
          deliveredAt: transaction.deliveredAt,
          deliveryConfirmedAt: transaction.deliveryConfirmedAt,
          releaseRequestedAt: transaction.releaseRequestedAt,
          releasedAt: transaction.releasedAt,
          shippingTrackingNumber: transaction.shippingTrackingNumber,
          shippingCarrier: transaction.shippingCarrier,
          product: transaction.product,
          seller: transaction.seller,
          paymentHold: transaction.paymentHold
        },
        userRole: isBuyer ? 'buyer' : 'seller'
      })
    }

    // Get user's held transactions
    const whereClause: any = {}

    if (status) {
      whereClause.holdStatus = status
    }

    // Filter by user role
    if (userRole === 'buyer') {
      whereClause.buyerEmail = user.email
    } else if (userRole === 'seller') {
      whereClause.sellerId = user.id
    } else {
      // Return both buyer and seller transactions
      whereClause.OR = [
        { buyerEmail: user.email },
        { sellerId: user.id }
      ]
    }

    const transactions = await db.transaction.findMany({
      where: whereClause,
      include: {
        paymentHold: true,
        product: {
          select: { id: true, title: true, primaryImage: true }
        },
        seller: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        holdStatus: t.holdStatus,
        shippedAt: t.shippedAt,
        deliveredAt: t.deliveredAt,
        deliveryConfirmedAt: t.deliveryConfirmedAt,
        releaseRequestedAt: t.releaseRequestedAt,
        releasedAt: t.releasedAt,
        product: t.product,
        seller: t.seller,
        isBuyer: t.buyerEmail === user.email,
        isSeller: t.sellerId === user.id,
        paymentHold: t.paymentHold
      }))
    })

  } catch (error: any) {
    console.error('Error getting escrow status:', error)
    return NextResponse.json(
      { error: 'Failed to get escrow status', details: error.message },
      { status: 500 }
    )
  }
}
