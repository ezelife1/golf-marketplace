import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
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

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain uppercase, lowercase, and number' },
        { status: 400 }
      )
    }

    // Find the reset token in database
    const resetToken = await db.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date() // Token must not be expired
        }
      },
      include: {
        user: true
      }
    })

    if (!resetToken) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12)

    // Update user's password
    await db.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    })

    // Delete the used reset token and any other tokens for this user
    await db.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId }
    })

    // Log the password reset for security audit
    console.log(`Password reset successful for user: ${resetToken.user.email}`)

    // In real app, send email notification about password change
    // await sendPasswordChangeNotification(resetToken.user.email, resetToken.user.name)

    return NextResponse.json({
      message: 'Password reset successful'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { message: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
