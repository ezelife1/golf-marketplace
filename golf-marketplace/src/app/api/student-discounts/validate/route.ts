import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// POST /api/student-discounts/validate - Validate a student discount code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { code, cartTotal } = body

    if (!code) {
      return NextResponse.json(
        { error: "Discount code is required" },
        { status: 400 }
      )
    }

    if (!cartTotal || cartTotal <= 0) {
      return NextResponse.json(
        { error: "Valid cart total is required" },
        { status: 400 }
      )
    }

    // Find the discount code
    const discount = await db.studentDiscount.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        pgaPro: {
          select: {
            id: true,
            name: true,
            businessBranding: {
              select: {
                businessName: true,
                logoUrl: true
              }
            }
          }
        },
        discountUsages: {
          where: { studentId: session.user.id },
          select: { id: true }
        }
      }
    })

    if (!discount) {
      return NextResponse.json(
        { error: "Invalid discount code" },
        { status: 404 }
      )
    }

    // Check if discount is active
    if (!discount.isActive) {
      return NextResponse.json(
        { error: "This discount code is no longer active" },
        { status: 400 }
      )
    }

    // Check if discount has expired
    if (discount.validUntil && discount.validUntil < new Date()) {
      return NextResponse.json(
        { error: "This discount code has expired" },
        { status: 400 }
      )
    }

    // Check usage limits
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return NextResponse.json(
        { error: "This discount code has reached its usage limit" },
        { status: 400 }
      )
    }

    // Check per-student usage limit
    if (discount.perStudentLimit && discount.discountUsages.length >= discount.perStudentLimit) {
      return NextResponse.json(
        { error: "You have already used this discount code the maximum number of times" },
        { status: 400 }
      )
    }

    // Check minimum purchase requirement
    if (discount.minPurchase && cartTotal < discount.minPurchase) {
      return NextResponse.json(
        {
          error: `Minimum purchase of £${discount.minPurchase} required for this discount`,
          minimumRequired: discount.minPurchase
        },
        { status: 400 }
      )
    }

    // Check student verification requirement
    if (discount.requiresStudentVerification) {
      const studentVerification = await db.studentVerification.findUnique({
        where: { userId: session.user.id },
        select: {
          verificationStatus: true,
          institution: true,
          expiresAt: true
        }
      })

      if (!studentVerification) {
        return NextResponse.json(
          {
            error: "Student verification required for this discount",
            requiresVerification: true
          },
          { status: 400 }
        )
      }

      if (studentVerification.verificationStatus !== "verified") {
        return NextResponse.json(
          {
            error: "Your student verification is pending or has been rejected",
            verificationStatus: studentVerification.verificationStatus
          },
          { status: 400 }
        )
      }

      if (studentVerification.expiresAt < new Date()) {
        return NextResponse.json(
          {
            error: "Your student verification has expired. Please renew to use this discount",
            requiresVerification: true
          },
          { status: 400 }
        )
      }

      // Check allowed institutions
      if (discount.allowedInstitutions && Array.isArray(discount.allowedInstitutions)) {
        const allowedInstitutions = discount.allowedInstitutions as string[]
        if (!allowedInstitutions.includes(studentVerification.institution)) {
          return NextResponse.json(
            {
              error: "This discount is not available for your institution",
              allowedInstitutions
            },
            { status: 400 }
          )
        }
      }
    }

    // Calculate discount amount
    let discountAmount = 0

    if (discount.discountType === "percentage") {
      discountAmount = (cartTotal * discount.discountValue) / 100

      // Apply maximum discount limit if set
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount
      }
    } else if (discount.discountType === "fixed_amount") {
      discountAmount = discount.discountValue

      // Ensure discount doesn't exceed cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal
      }
    }

    const finalTotal = cartTotal - discountAmount

    return NextResponse.json({
      valid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        name: discount.name,
        description: discount.description,
        discountType: discount.discountType,
        discountValue: discount.discountValue
      },
      pgaPro: discount.pgaPro,
      calculation: {
        originalTotal: cartTotal,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalTotal: Math.round(finalTotal * 100) / 100,
        savings: Math.round(discountAmount * 100) / 100
      }
    })

  } catch (error) {
    console.error("Error validating student discount:", error)
    return NextResponse.json(
      { error: "Failed to validate discount code" },
      { status: 500 }
    )
  }
}
