import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { message: 'Reset token is required' },
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
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!resetToken) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Return success without sensitive information
    return NextResponse.json({
      valid: true,
      email: resetToken.user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Partially hide email
    })

  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { message: 'Failed to validate reset token' },
      { status: 500 }
    )
  }
}
