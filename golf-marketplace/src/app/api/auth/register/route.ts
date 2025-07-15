import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, subscribeNewsletter, trial } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Determine subscription tier based on trial
    let subscriptionTier = 'free'
    let trialEndDate = null

    if (trial) {
      subscriptionTier = trial
      const trialDuration = trial === 'pga-pro' ? 60 : 30 // PGA Pro gets 2 months, others get 1 month
      trialEndDate = new Date(Date.now() + trialDuration * 24 * 60 * 60 * 1000)
    }

    // Create user
    const user = await db.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        subscriptionTier,
        subscriptionStatus: trial ? 'trialing' : 'active',
        trialEndDate,
        emailVerified: null, // Will be set when email is verified
        verified: false,
        pgaVerified: false,
        rating: 0,
        reviewCount: 0,
        responseRate: 0,
        subscribeNewsletter: subscribeNewsletter || false
      }
    })

    // Create user profile
    await db.userProfile.create({
      data: {
        userId: user.id,
        bio: '',
        location: '',
        phoneNumber: '',
        website: '',
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: subscribeNewsletter || false,
          priceAlerts: false,
          messageNotifications: true
        }
      }
    })

    // If user has a trial, create subscription record
    if (trial) {
      const planPrices = {
        'pro': 7,
        'business': 22,
        'pga-pro': 45
      }

      await db.subscription.create({
        data: {
          userId: user.id,
          planType: trial,
          status: 'trialing',
          pricePerMonth: planPrices[trial as keyof typeof planPrices] || 0,
          currency: 'GBP',
          trialStartDate: new Date(),
          trialEndDate,
          // In real app, you'd integrate with Stripe to create subscription
          stripeSubscriptionId: `trial_${user.id}_${Date.now()}`,
          stripeCustomerId: `cust_trial_${user.id}`
        }
      })
    }

    // Add to newsletter if requested
    if (subscribeNewsletter) {
      // In real app, integrate with email service (e.g., Mailchimp, SendGrid)
      console.log(`Adding user ${email} to newsletter`)
    }

    // Send welcome email (in real app)
    // await sendWelcomeEmail(user.email, user.name, trial)

    // Return success (excluding password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword,
      trial: trial ? {
        type: trial,
        endDate: trialEndDate,
        daysRemaining: trial === 'pga-pro' ? 60 : 30
      } : null
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { message: 'User with this email already exists' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { message: 'Internal server error during registration' },
      { status: 500 }
    )
  }
}
