import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

// Create Stripe Connect account for seller
export async function createConnectAccount(sellerId: string, email: string, country = 'GB') {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        sellerId,
        platform: 'clubup'
      }
    })

    return account
  } catch (error: any) {
    console.error('Error creating Stripe Connect account:', error)
    throw new Error(`Failed to create payout account: ${error.message}`)
  }
}

// Create account link for onboarding
export async function createAccountLink(accountId: string, sellerId: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/seller?refresh=${accountId}`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/seller?connected=${accountId}`,
      type: 'account_onboarding',
    })

    return accountLink
  } catch (error: any) {
    console.error('Error creating account link:', error)
    throw new Error(`Failed to create onboarding link: ${error.message}`)
  }
}

// Get account status
export async function getAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId)

    return {
      id: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requiresAction: account.requirements?.currently_due?.length > 0,
      currentlyDue: account.requirements?.currently_due || [],
      pendingVerification: account.requirements?.pending_verification || [],
      country: account.country,
      defaultCurrency: account.default_currency,
    }
  } catch (error: any) {
    console.error('Error getting account status:', error)
    throw new Error(`Failed to get account status: ${error.message}`)
  }
}

// Create transfer to seller account
export async function createTransfer({
  accountId,
  amount,
  currency = 'gbp',
  description,
  metadata = {}
}: {
  accountId: string
  amount: number // Amount in pence
  currency?: string
  description: string
  metadata?: Record<string, string>
}) {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to pence
      currency,
      destination: accountId,
      description,
      metadata: {
        platform: 'clubup',
        ...metadata
      }
    })

    return transfer
  } catch (error: any) {
    console.error('Error creating transfer:', error)
    throw new Error(`Failed to transfer funds: ${error.message}`)
  }
}

// Calculate seller payout amount after commission and fees
export function calculateSellerPayout(
  grossAmount: number,
  subscriptionTier: string | null = 'free'
): {
  grossAmount: number
  commissionRate: number
  commissionAmount: number
  stripeFee: number
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

  // Stripe fee: 2.9% + 20p per transaction
  const stripeFee = (grossAmount * 0.029) + 0.20

  const netAmount = grossAmount - commissionAmount - stripeFee

  return {
    grossAmount,
    commissionRate,
    commissionAmount,
    stripeFee,
    netAmount: Math.max(0, netAmount) // Ensure non-negative
  }
}

// Process automatic payout for completed transaction
export async function processSellerPayout({
  sellerId,
  transactionId,
  amount,
  subscriptionTier,
  description
}: {
  sellerId: string
  transactionId: string
  amount: number
  subscriptionTier: string | null
  description: string
}) {
  try {
    // Calculate payout amounts
    const payoutCalculation = calculateSellerPayout(amount, subscriptionTier)

    if (payoutCalculation.netAmount <= 0) {
      throw new Error('Payout amount is zero or negative after fees')
    }

    // Get seller's connected account
    // This would typically come from your database
    // For now, we'll assume it's stored in user metadata

    const metadata = {
      sellerId,
      transactionId,
      grossAmount: amount.toString(),
      commissionAmount: payoutCalculation.commissionAmount.toString(),
      stripeFee: payoutCalculation.stripeFee.toString(),
      subscriptionTier: subscriptionTier || 'free'
    }

    // Note: In real implementation, you'd get the accountId from your database
    // where you stored it during the Connect onboarding process

    return {
      success: true,
      payoutCalculation,
      message: 'Payout calculation completed. Seller account required for transfer.'
    }

  } catch (error: any) {
    console.error('Error processing seller payout:', error)
    throw new Error(`Payout processing failed: ${error.message}`)
  }
}

// Get account dashboard link for seller to manage their payouts
export async function createDashboardLink(accountId: string) {
  try {
    const link = await stripe.accounts.createLoginLink(accountId)
    return link
  } catch (error: any) {
    console.error('Error creating dashboard link:', error)
    throw new Error(`Failed to create dashboard link: ${error.message}`)
  }
}

// List recent transfers for an account
export async function getAccountTransfers(accountId: string, limit = 10) {
  try {
    const transfers = await stripe.transfers.list({
      destination: accountId,
      limit
    })

    return transfers.data.map(transfer => ({
      id: transfer.id,
      amount: transfer.amount / 100, // Convert from pence to pounds
      currency: transfer.currency,
      created: new Date(transfer.created * 1000),
      description: transfer.description,
      status: transfer.reversed ? 'reversed' : 'completed',
      metadata: transfer.metadata
    }))
  } catch (error: any) {
    console.error('Error getting account transfers:', error)
    throw new Error(`Failed to get transfer history: ${error.message}`)
  }
}
