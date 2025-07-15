import { db } from '@/lib/db'
import {
  notifySellerPayoutProcessed,
  notifyBuyerPayoutCompleted,
  notifySellerPayoutFailed
} from '@/lib/email-notifications'

// Create a payment hold for a transaction
export async function createPaymentHold({
  transactionId,
  heldAmount,
  currency,
  commissionAmount,
  processingFee
}: {
  transactionId: string
  heldAmount: number
  currency: string
  commissionAmount: number
  processingFee: number
}) {
  try {
    const paymentHold = await db.paymentHold.create({
      data: {
        transactionId,
        heldAmount,
        currency,
        status: 'held',
        reason: 'payment_captured',
        heldAt: new Date(),
        commissionHeld: commissionAmount,
        processingFeeHeld: processingFee,
        metadata: {
          createdAt: new Date().toISOString(),
          commissionRate: commissionAmount / heldAmount,
          processingFee
        }
      }
    })

    console.log(`💰 Payment hold created: £${heldAmount} for transaction ${transactionId}`)
    return paymentHold
  } catch (error: any) {
    console.error('Error creating payment hold:', error)
    throw new Error(`Failed to create payment hold: ${error.message}`)
  }
}

// Process scheduled payouts (for payouts scheduled 2+ hours after delivery confirmation)
export async function processScheduledPayouts() {
  try {
    if (!db) {
      console.warn('Database not available for scheduled payouts')
      return { processed: 0, successful: 0, failed: 0, results: [] }
    }

    const now = new Date()

    // Find all payment holds that are released and have scheduled payouts ready
    const eligibleHolds = await db.paymentHold.findMany({
      where: {
        status: 'released',
        reason: 'buyer_confirmed'
      },
      include: {
        transaction: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                stripeAccountId: true,
                subscriptionTier: true
              }
            },
            product: {
              select: { id: true, title: true }
            }
          }
        }
      }
    })

    // Filter for holds that have scheduled payouts ready (2+ hours past confirmation)
    const readyForPayout = eligibleHolds.filter(hold => {
      const metadata = hold.metadata as any
      if (!metadata?.payoutScheduledAt || metadata?.payoutStatus === 'completed') {
        return false
      }

      const scheduledTime = new Date(metadata.payoutScheduledAt)
      return now >= scheduledTime
    })

    console.log(`Found ${readyForPayout.length} payouts ready for processing`)

    const results = []

    for (const hold of readyForPayout) {
      try {
        const transaction = hold.transaction
        const seller = transaction.seller

        console.log(`Processing payout for transaction ${transaction.id} to seller ${seller.email}`)

        // Calculate net payout amount (already calculated when hold was created)
        const netAmount = hold.heldAmount - hold.commissionHeld - hold.processingFeeHeld

        let payoutResult = null

        // Import Stripe Connect functions dynamically to avoid circular imports
        const { createTransfer, calculateSellerPayout } = await import('./stripe-connect')

        // Try Stripe Connect payout first (if seller has Stripe account)
        if (seller.stripeAccountId) {
          try {
            const payoutCalculation = calculateSellerPayout(hold.heldAmount, seller.subscriptionTier)

            const transfer = await createTransfer({
              accountId: seller.stripeAccountId,
              amount: payoutCalculation.netAmount,
              description: `ClubUp sale payout - ${transaction.product.title}`,
              metadata: {
                transactionId: transaction.id,
                holdId: hold.id,
                productTitle: transaction.product.title,
                payoutType: 'scheduled_payout'
              }
            })

            // Record successful Stripe payout
            await db.payout.create({
              data: {
                transactionId: transaction.id,
                sellerId: seller.id,
                stripeTransferId: transfer.id,
                grossAmount: hold.heldAmount,
                commissionAmount: hold.commissionHeld,
                stripeFee: hold.processingFeeHeld,
                netAmount: payoutCalculation.netAmount,
                status: 'completed',
                processedAt: now,
                metadata: {
                  payoutType: 'scheduled_automatic',
                  triggeredBy: 'delivery_confirmation',
                  stripeTransferId: transfer.id
                }
              }
            })

            payoutResult = { method: 'stripe', transferId: transfer.id, amount: payoutCalculation.netAmount }

            // Send success notification email to seller
            try {
              await notifySellerPayoutProcessed({
                sellerId: seller.id,
                sellerEmail: seller.email,
                sellerName: seller.name || 'Seller',
                transactionId: transaction.id,
                productTitle: transaction.product.title,
                netAmount: payoutCalculation.netAmount,
                payoutMethod: 'stripe',
                transferId: transfer.id
              })
            } catch (emailError) {
              console.error('Failed to send seller payout notification:', emailError)
            }

            // Send completion notification to buyer
            try {
              await notifyBuyerPayoutCompleted({
                buyerEmail: transaction.buyerEmail,
                transactionId: transaction.id,
                productTitle: transaction.product.title,
                sellerName: seller.name || 'Seller',
                payoutDate: now
              })
            } catch (emailError) {
              console.error('Failed to send buyer completion notification:', emailError)
            }

          } catch (stripeError: any) {
            console.error(`Stripe payout failed for transaction ${transaction.id}:`, stripeError)
            payoutResult = { method: 'stripe', error: stripeError.message }

            // Send failure notification email to seller
            try {
              const failedPayoutCalculation = calculateSellerPayout(hold.heldAmount, seller.subscriptionTier)
              await notifySellerPayoutFailed({
                sellerId: seller.id,
                sellerEmail: seller.email,
                sellerName: seller.name || 'Seller',
                transactionId: transaction.id,
                productTitle: transaction.product.title,
                attemptedAmount: failedPayoutCalculation.netAmount,
                payoutMethod: 'stripe',
                errorMessage: stripeError.message
              })
            } catch (emailError) {
              console.error('Failed to send payout failure notification:', emailError)
            }
          }
        }

        // If Stripe failed or not available, try PayPal (if available)
        if (!payoutResult?.transferId) {
          try {
            // For PayPal, we'd need the seller's PayPal email stored in their profile
            // For now, log that PayPal payout would be attempted
            console.log(`PayPal payout would be attempted for seller ${seller.email}`)
            // TODO: Implement PayPal payout logic when seller PayPal emails are stored

          } catch (paypalError: any) {
            console.error(`PayPal payout failed for transaction ${transaction.id}:`, paypalError)
          }
        }

        // Update hold metadata to mark payout as completed (or failed)
        await db.paymentHold.update({
          where: { id: hold.id },
          data: {
            metadata: {
              ...((hold.metadata as any) || {}),
              payoutStatus: payoutResult?.transferId ? 'completed' : 'failed',
              payoutCompletedAt: now.toISOString(),
              payoutMethod: payoutResult?.method,
              payoutDetails: payoutResult
            }
          }
        })

        // Log the payout attempt
        await db.activity.create({
          data: {
            userId: seller.id,
            type: payoutResult?.transferId ? 'scheduled_payout_completed' : 'scheduled_payout_failed',
            description: payoutResult?.transferId
              ? `Automatic payout processed: £${payoutResult.amount}`
              : `Automatic payout failed: ${payoutResult?.error || 'Unknown error'}`,
            metadata: {
              transactionId: transaction.id,
              holdId: hold.id,
              payoutResult,
              processedAt: now.toISOString()
            }
          }
        })

        results.push({
          success: !!payoutResult?.transferId,
          transactionId: transaction.id,
          sellerId: seller.id,
          payoutResult
        })

      } catch (error: any) {
        console.error(`Error processing payout for hold ${hold.id}:`, error)
        results.push({
          success: false,
          transactionId: hold.transactionId,
          error: error.message
        })
      }
    }

    const summary = {
      processed: readyForPayout.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }

    console.log('Scheduled payout processing completed:', summary)
    return summary

  } catch (error: any) {
    console.error('Error processing scheduled payouts:', error)
    throw new Error(`Scheduled payout processing failed: ${error.message}`)
  }
}
