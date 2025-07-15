import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Always return success for security (don't reveal if email exists)
    // But only send email if user actually exists
    if (user) {
      // Generate secure reset token
      const resetToken = randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Save reset token to database
      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt: resetTokenExpiry
        }
      })

      // In a real app, send email with reset link
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

      console.log(`Password reset requested for ${email}`)
      console.log(`Reset URL: ${resetUrl}`)

      // TODO: Integrate with email service (SendGrid, Resend, etc.)
      // await sendPasswordResetEmail(user.email, user.name, resetUrl)
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { message: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}

// Clean up expired tokens (could be run as a cron job)
export async function DELETE() {
  try {
    await db.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    return NextResponse.json({ message: 'Expired tokens cleaned up' })
  } catch (error) {
    console.error('Token cleanup error:', error)
    return NextResponse.json(
      { message: 'Failed to clean up tokens' },
      { status: 500 }
    )
  }
}
