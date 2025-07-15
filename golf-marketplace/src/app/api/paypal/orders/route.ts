import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { createPayPalOrder, createPayPalMetadata, formatPayPalAmount } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      productId,
      items, // For cart checkout
      orderType = 'single' // 'single' or 'cart'
    } = body

    let orderDetails
    let metadata

    if (orderType === 'single' && productId) {
      // Single product checkout
      const product = await db.product.findFirst({
        where: {
          id: productId,
          status: 'active'
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              subscriptionTier: true
            }
          }
        }
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      // Calculate commission
      const getCommissionRate = (subscriptionTier: string | null): number => {
        switch (subscriptionTier) {
          case 'pga-pro': return 0.01 // 1%
          case 'business': return 0.03 // 3%
          case 'pro': return 0.03 // 3%
          case 'free':
          default: return 0.05 // 5%
        }
      }

      const commissionRate = getCommissionRate(product.seller.subscriptionTier)
      const commissionAmount = product.price * commissionRate
      const sellerReceives = product.price - commissionAmount

      orderDetails = {
        amount: formatPayPalAmount(product.price),
        currency: 'GBP',
        items: [{
          name: product.title,
          description: `${product.brand} - ${product.condition} condition`,
          unit_amount: formatPayPalAmount(product.price),
          quantity: '1'
        }]
      }

      metadata = createPayPalMetadata({
        productId: product.id,
        sellerId: product.seller.id,
        buyerId: session.user.id || '',
        commissionRate,
        commissionAmount,
        sellerReceives,
        orderType: 'single'
      })

    } else if (orderType === 'cart' && items) {
      // Cart checkout
      let totalAmount = 0
      const orderItems = []
      let totalCommission = 0
      const sellerCommissions: Record<string, any> = {}

      for (const item of items) {
        const seller = await db.user.findUnique({
          where: { id: item.sellerId },
          select: { subscriptionTier: true, name: true }
        })

        const getCommissionRate = (subscriptionTier: string | null): number => {
          switch (subscriptionTier) {
            case 'pga-pro': return 0.01 // 1%
            case 'business': return 0.03 // 3%
            case 'pro': return 0.03 // 3%
            case 'free':
            default: return 0.05 // 5%
          }
        }

        const commissionRate = getCommissionRate(seller?.subscriptionTier || 'free')
        const itemTotal = item.price * item.quantity
        const commissionAmount = itemTotal * commissionRate
        const sellerReceives = itemTotal - commissionAmount

        totalAmount += itemTotal
        totalCommission += commissionAmount

        sellerCommissions[item.sellerId] = {
          sellerName: seller?.name || 'Unknown',
          itemTotal,
          commissionRate,
          commissionAmount,
          sellerReceives
        }

        orderItems.push({
          name: item.title,
          description: `${item.brand} - ${item.condition}`,
          unit_amount: formatPayPalAmount(item.price),
          quantity: item.quantity.toString()
        })
      }

      // Add shipping if applicable
      const shippingFee = totalAmount > 50 ? 0 : 5.99
      if (shippingFee > 0) {
        orderItems.push({
          name: 'Shipping',
          description: 'Standard UK delivery',
          unit_amount: formatPayPalAmount(shippingFee),
          quantity: '1'
        })
        totalAmount += shippingFee
      }

      orderDetails = {
        amount: formatPayPalAmount(totalAmount),
        currency: 'GBP',
        items: orderItems
      }

      metadata = createPayPalMetadata({
        sellerId: 'multiple', // For cart orders
        buyerId: session.user.id || '',
        commissionRate: totalCommission / (totalAmount - (shippingFee || 0)), // Average rate
        commissionAmount: totalCommission,
        sellerReceives: totalAmount - totalCommission - (shippingFee || 0),
        orderType: 'cart',
        itemCount: items.length
      })

    } else {
      return NextResponse.json({ error: 'Invalid order type or missing data' }, { status: 400 })
    }

    // Create PayPal order
    const paypalOrder = await createPayPalOrder({
      ...orderDetails,
      metadata
    })

    // Store order in database for tracking
    await db.activity.create({
      data: {
        userId: session.user.id || '',
        type: 'paypal_order_created',
        description: `PayPal order created: ${paypalOrder.id}`,
        metadata: {
          paypalOrderId: paypalOrder.id,
          orderType,
          amount: orderDetails.amount,
          currency: orderDetails.currency,
          ...metadata
        }
      }
    })

    console.log('PayPal order created:', {
      id: paypalOrder.id,
      status: paypalOrder.status,
      amount: orderDetails.amount,
      currency: orderDetails.currency
    })

    return NextResponse.json({
      success: true,
      paypalOrderId: paypalOrder.id,
      approvalUrl: paypalOrder.links?.find((link: any) => link.rel === 'approve')?.href,
      amount: orderDetails.amount,
      currency: orderDetails.currency
    })

  } catch (error: any) {
    console.error('PayPal order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create PayPal order', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'PayPal Orders API',
    endpoints: {
      'POST /api/paypal/orders': 'Create PayPal order',
      'POST /api/paypal/capture': 'Capture PayPal payment'
    }
  })
}
