import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { capturePayPalOrder, getPayPalOrder } from '@/lib/paypal'
import { createPaymentHold } from '@/lib/payment-hold'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paypalOrderId } = await request.json()

    if (!paypalOrderId) {
      return NextResponse.json({ error: 'PayPal Order ID is required' }, { status: 400 })
    }

    console.log('Capturing PayPal order:', paypalOrderId)

    // Get order details first
    const orderDetails = await getPayPalOrder(paypalOrderId)

    if (orderDetails.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Order not approved by customer' },
        { status: 400 }
      )
    }

    // Capture the payment
    const captureResult = await capturePayPalOrder(paypalOrderId)

    console.log('PayPal capture result:', {
      id: captureResult.id,
      status: captureResult.status,
      purchase_units: captureResult.purchase_units?.length
    })

    if (captureResult.status === 'COMPLETED') {
      const purchaseUnit = captureResult.purchase_units[0]
      const capture = purchaseUnit.payments.captures[0]

      // Extract metadata from custom_id or invoice_id
      const customData = purchaseUnit.custom_id || ''
      const amount = parseFloat(capture.amount.value)

      // TODO: Extract proper product and seller info from PayPal order metadata
      // For now, using placeholder values - this should be populated from the original order creation
      const productId = 'placeholder-product-id' // Should come from order metadata
      const sellerId = 'placeholder-seller-id' // Should come from order metadata
      const commissionRate = 0.05 // Should come from seller subscription tier
      const commissionAmount = amount * commissionRate
      const sellerAmount = amount - commissionAmount

      // Create transaction record with PAYMENT HOLD STATUS
      const transaction = await db.transaction.create({
        data: {
          productId, // TODO: Extract from PayPal order metadata
          sellerId, // TODO: Extract from PayPal order metadata
          buyerEmail: session.user.email || '',
          amount,
          commissionRate,
          commissionAmount,
          sellerAmount,
          status: 'pending', // Keep as pending until delivery confirmed
          holdStatus: 'payment_held', // NEW: Set hold status
          paypalOrderId: captureResult.id,
          paypalPaymentId: capture.id,
          paidAt: new Date(),
          metadata: {
            paypalOrderId: captureResult.id,
            paypalCaptureId: capture.id,
            paymentMethod: 'paypal',
            currency: capture.amount.currency_code,
            capturedAt: capture.create_time
          }
        }
      })

      // Calculate PayPal processing fee (flat £0.20)
      const paypalFee = 0.20

      // CREATE PAYMENT HOLD - Key change for escrow system!
      await createPaymentHold({
        transactionId: transaction.id,
        heldAmount: amount,
        currency: capture.amount.currency_code,
        commissionAmount,
        processingFee: paypalFee
      })

      // Log PAYMENT HELD (not payment captured)
      await db.activity.create({
        data: {
          userId: session.user.id || '',
          type: 'paypal_payment_held',
          description: `PayPal payment held in escrow: £${amount}`,
          metadata: {
            paypalOrderId: captureResult.id,
            paypalCaptureId: capture.id,
            transactionId: transaction.id,
            heldAmount: amount,
            currency: capture.amount.currency_code,
            escrowMessage: 'Payment will be released after delivery confirmation'
          }
        }
      })

      console.log('💰 PAYPAL PAYMENT HELD IN ESCROW:')
      console.log(`- Amount: £${amount}`)
      console.log(`- Transaction ID: ${transaction.id}`)
      console.log(`- PayPal Order ID: ${captureResult.id}`)
      console.log(`- Status: Payment held until delivery confirmation`)

      return NextResponse.json({
        success: true,
        paypalOrderId: captureResult.id,
        captureId: capture.id,
        amount: capture.amount.value,
        currency: capture.amount.currency_code,
        status: captureResult.status,
        message: 'Payment captured successfully'
      })

    } else {
      console.log('PayPal capture failed:', captureResult.status)

      return NextResponse.json(
        { error: 'Payment capture failed', status: captureResult.status },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('PayPal capture error:', error)

    // Log failed capture attempt
    try {
      const session = await getServerSession()
      if (session?.user?.id) {
        await db.activity.create({
          data: {
            userId: session.user.id,
            type: 'paypal_capture_failed',
            description: `PayPal capture failed: ${error.message}`,
            metadata: {
              error: error.message,
              stack: error.stack
            }
          }
        })
      }
    } catch (logError) {
      console.error('Failed to log capture error:', logError)
    }

    return NextResponse.json(
      { error: 'Failed to capture PayPal payment', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
  }

  try {
    const orderDetails = await getPayPalOrder(orderId)

    return NextResponse.json({
      success: true,
      order: {
        id: orderDetails.id,
        status: orderDetails.status,
        amount: orderDetails.purchase_units[0]?.amount?.value,
        currency: orderDetails.purchase_units[0]?.amount?.currency_code,
        created: orderDetails.create_time,
        updated: orderDetails.update_time
      }
    })

  } catch (error: any) {
    console.error('PayPal order lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to get order details', details: error.message },
      { status: 500 }
    )
  }
}
