import paypal from '@paypal/checkout-server-sdk'
import payouts from '@paypal/payouts-sdk'

// PayPal environment setup
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!

  if (process.env.NODE_ENV === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret)
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret)
  }
}

// PayPal client
export function paypalClient() {
  return new paypal.core.PayPalHttpClient(environment())
}

// PayPal Payouts client
export function paypalPayoutsClient() {
  return new payouts.core.PayPalHttpClient(environment())
}

// Create PayPal order
export async function createPayPalOrder(orderDetails: {
  amount: string
  currency: string
  items?: Array<{
    name: string
    description?: string
    unit_amount: string
    quantity: string
  }>
  metadata?: Record<string, string>
}) {
  const request = new paypal.orders.OrdersCreateRequest()

  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: orderDetails.currency.toUpperCase(),
        value: orderDetails.amount,
        breakdown: orderDetails.items ? {
          item_total: {
            currency_code: orderDetails.currency.toUpperCase(),
            value: orderDetails.amount
          }
        } : undefined
      },
      items: orderDetails.items?.map(item => ({
        name: item.name,
        description: item.description,
        unit_amount: {
          currency_code: orderDetails.currency.toUpperCase(),
          value: item.unit_amount
        },
        quantity: item.quantity
      })),
      custom_id: orderDetails.metadata?.orderId || '',
      invoice_id: orderDetails.metadata?.invoiceId || `INV-${Date.now()}`
    }],
    application_context: {
      return_url: `${process.env.NEXTAUTH_URL}/checkout/paypal/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout/paypal/cancel`,
      brand_name: 'ClubUp Golf Marketplace',
      locale: 'en-GB',
      landing_page: 'BILLING',
      user_action: 'PAY_NOW'
    }
  })

  const client = paypalClient()
  const response = await client.execute(request)

  return response.result
}

// Capture PayPal order
export async function capturePayPalOrder(orderId: string) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId)

  const client = paypalClient()
  const response = await client.execute(request)

  return response.result
}

// Get PayPal order details
export async function getPayPalOrder(orderId: string) {
  const request = new paypal.orders.OrdersGetRequest(orderId)

  const client = paypalClient()
  const response = await client.execute(request)

  return response.result
}

// Validate PayPal webhook signature
export function validatePayPalWebhook(
  requestBody: string,
  headers: Record<string, string>
): boolean {
  // PayPal webhook validation logic
  // In production, you'd implement proper webhook signature verification
  // For now, return true for development
  return true
}

// Helper to format PayPal amount
export function formatPayPalAmount(amount: number): string {
  return amount.toFixed(2)
}

// Extract commission details for PayPal metadata
export function createPayPalMetadata(orderData: {
  productId?: string
  sellerId: string
  buyerId: string
  commissionRate: number
  commissionAmount: number
  sellerReceives: number
  orderType: 'single' | 'cart'
  itemCount?: number
}) {
  return {
    productId: orderData.productId || '',
    sellerId: orderData.sellerId,
    buyerId: orderData.buyerId,
    commissionRate: orderData.commissionRate.toString(),
    commissionAmount: formatPayPalAmount(orderData.commissionAmount),
    sellerReceives: formatPayPalAmount(orderData.sellerReceives),
    orderType: orderData.orderType,
    itemCount: orderData.itemCount?.toString() || '1',
    platform: 'clubup'
  }
}

// PayPal Payouts Functions

// Create a payout to a seller's PayPal account
export async function createPayPalPayout(payoutDetails: {
  receiverEmail: string
  amount: string
  currency: string
  note: string
  transactionId: string
  sellerId: string
  senderBatchId?: string
}) {
  const request = new payouts.payouts.PayoutsPostRequest()

  const batchId = payoutDetails.senderBatchId || `CLUBUP_${Date.now()}_${payoutDetails.sellerId}`

  request.requestBody({
    sender_batch_header: {
      sender_batch_id: batchId,
      email_subject: 'ClubUp Seller Payout',
      email_message: 'You have received a payout from ClubUp for your recent sale.'
    },
    items: [
      {
        recipient_type: 'EMAIL',
        amount: {
          value: payoutDetails.amount,
          currency: payoutDetails.currency.toUpperCase()
        },
        note: payoutDetails.note,
        sender_item_id: payoutDetails.transactionId,
        receiver: payoutDetails.receiverEmail,
        notification_language: 'en-GB'
      }
    ]
  })

  const client = paypalPayoutsClient()
  const response = await client.execute(request)

  return response.result
}

// Get payout batch details
export async function getPayPalPayoutBatch(batchId: string) {
  const request = new payouts.payouts.PayoutsGetRequest(batchId)

  const client = paypalPayoutsClient()
  const response = await client.execute(request)

  return response.result
}

// Get individual payout item details
export async function getPayPalPayoutItem(payoutItemId: string) {
  const request = new payouts.payouts.PayoutsItemGetRequest(payoutItemId)

  const client = paypalPayoutsClient()
  const response = await client.execute(request)

  return response.result
}

// Cancel a payout item (if still unclaimed)
export async function cancelPayPalPayoutItem(payoutItemId: string) {
  const request = new payouts.payouts.PayoutsItemCancelRequest(payoutItemId)

  const client = paypalPayoutsClient()
  const response = await client.execute(request)

  return response.result
}

// Calculate PayPal payout fees and amounts
export function calculatePayPalPayout(
  grossAmount: number,
  subscriptionTier: string | null = 'free'
): {
  grossAmount: number
  commissionRate: number
  commissionAmount: number
  paypalFee: number
  netAmount: number
} {
  // Commission rates based on subscription tier
  const getCommissionRate = (tier: string | null): number => {
    switch (tier) {
      case 'pga-pro': return 0.01 // 1%
      case 'business': return 0.03 // 3%
      case 'pro': return 0.03 // 3%
      case 'free':
      default: return 0.05 // 5%
    }
  }

  const commissionRate = getCommissionRate(subscriptionTier)
  const commissionAmount = grossAmount * commissionRate

  // PayPal Payouts fee: $0.25 USD per payout (or equivalent in other currencies)
  // For GBP, approximately £0.20 per payout
  const paypalFee = 0.20

  const netAmount = grossAmount - commissionAmount - paypalFee

  return {
    grossAmount,
    commissionRate,
    commissionAmount,
    paypalFee,
    netAmount: Math.max(0, netAmount) // Ensure non-negative
  }
}

// Verify PayPal account for payouts
export async function verifyPayPalAccount(email: string): Promise<{
  valid: boolean
  accountType?: string
  countryCode?: string
  error?: string
}> {
  try {
    // Note: In a real implementation, you might use PayPal's Account Validation API
    // For now, we'll do basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return {
        valid: false,
        error: 'Invalid email format'
      }
    }

    // In production, you'd make an API call to verify the PayPal account
    // For now, assume valid if email format is correct
    return {
      valid: true,
      accountType: 'personal', // Could be 'business' or 'personal'
      countryCode: 'GB'
    }
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Account verification failed'
    }
  }
}

// Format PayPal payout status for display
export function formatPayPalPayoutStatus(status: string): {
  status: string
  displayStatus: string
  color: 'success' | 'warning' | 'error' | 'info'
} {
  const statusMap: Record<string, { displayStatus: string; color: 'success' | 'warning' | 'error' | 'info' }> = {
    'SUCCESS': { displayStatus: 'Completed', color: 'success' },
    'PENDING': { displayStatus: 'Pending', color: 'warning' },
    'CLAIMED': { displayStatus: 'Claimed', color: 'success' },
    'UNCLAIMED': { displayStatus: 'Unclaimed', color: 'warning' },
    'RETURNED': { displayStatus: 'Returned', color: 'error' },
    'ONHOLD': { displayStatus: 'On Hold', color: 'warning' },
    'BLOCKED': { displayStatus: 'Blocked', color: 'error' },
    'REFUNDED': { displayStatus: 'Refunded', color: 'error' },
    'REVERSED': { displayStatus: 'Reversed', color: 'error' },
    'CANCELED': { displayStatus: 'Cancelled', color: 'error' },
    'DENIED': { displayStatus: 'Denied', color: 'error' }
  }

  const statusInfo = statusMap[status] || { displayStatus: status, color: 'info' as const }

  return {
    status,
    ...statusInfo
  }
}
