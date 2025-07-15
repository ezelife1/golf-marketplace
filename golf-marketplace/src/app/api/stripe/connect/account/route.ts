import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  createConnectAccount,
  createAccountLink,
  getAccountStatus,
  createDashboardLink
} from '@/lib/stripe-connect'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        stripeAccountId: true,
        subscriptionTier: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    switch (action) {
      case 'create_account': {
        // Check if user already has a Connect account
        if (user.stripeAccountId) {
          return NextResponse.json({
            error: 'Connect account already exists',
            accountId: user.stripeAccountId
          }, { status: 400 })
        }

        // Create new Stripe Connect account
        const account = await createConnectAccount(user.id, user.email)

        // Save account ID to database
        await db.user.update({
          where: { id: user.id },
          data: { stripeAccountId: account.id }
        })

        // Create onboarding link
        const accountLink = await createAccountLink(account.id, user.id)

        // Log activity
        await db.activity.create({
          data: {
            userId: user.id,
            type: 'stripe_connect_created',
            description: 'Stripe Connect account created',
            metadata: {
              accountId: account.id
            }
          }
        })

        return NextResponse.json({
          success: true,
          accountId: account.id,
          onboardingUrl: accountLink.url,
          message: 'Connect account created successfully'
        })
      }

      case 'create_onboarding_link': {
        if (!user.stripeAccountId) {
          return NextResponse.json({
            error: 'No Connect account found. Create account first.'
          }, { status: 400 })
        }

        const accountLink = await createAccountLink(user.stripeAccountId, user.id)

        return NextResponse.json({
          success: true,
          onboardingUrl: accountLink.url,
          message: 'Onboarding link created'
        })
      }

      case 'create_dashboard_link': {
        if (!user.stripeAccountId) {
          return NextResponse.json({
            error: 'No Connect account found'
          }, { status: 400 })
        }

        const dashboardLink = await createDashboardLink(user.stripeAccountId)

        return NextResponse.json({
          success: true,
          dashboardUrl: dashboardLink.url,
          message: 'Dashboard link created'
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Stripe Connect API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
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

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        stripeAccountId: true,
        subscriptionTier: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        message: 'No Connect account found'
      })
    }

    // Get account status from Stripe
    const accountStatus = await getAccountStatus(user.stripeAccountId)

    return NextResponse.json({
      connected: true,
      accountId: user.stripeAccountId,
      status: accountStatus,
      subscriptionTier: user.subscriptionTier
    })

  } catch (error: any) {
    console.error('Error getting Connect account status:', error)
    return NextResponse.json(
      { error: 'Failed to get account status', details: error.message },
      { status: 500 }
    )
  }
}
