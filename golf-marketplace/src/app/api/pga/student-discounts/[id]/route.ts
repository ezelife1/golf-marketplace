import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"


// GET /api/pga/student-discounts/[id] - Get specific student discount details
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await context.params

    const discount = await db.studentDiscount.findUnique({
      where: { id },
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
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                studentVerification: {
                  select: {
                    institution: true,
                    courseOfStudy: true,
                    verificationStatus: true
                  }
                }
              }
            },
            order: {
              select: {
                id: true,
                orderNumber: true,
                total: true,
                createdAt: true
              }
            }
          },
          orderBy: { usedAt: "desc" }
        },
        _count: {
          select: {
            discountUsages: true
          }
        }
      }
    })

    if (!discount) {
      return NextResponse.json(
        { error: "Student discount not found" },
        { status: 404 }
      )
    }

    // Check if user owns this discount
    if (discount.pgaProId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to view this discount" },
        { status: 403 }
      )
    }

    // Calculate analytics
    const totalSaved = discount.discountUsages.reduce((sum, usage) => sum + usage.discountAmount, 0)
    const totalRevenue = discount.discountUsages.reduce((sum, usage) => sum + usage.purchaseAmount, 0)
    const uniqueStudents = new Set(discount.discountUsages.map(usage => usage.studentId)).size

    return NextResponse.json({
      ...discount,
      analytics: {
        totalUsages: discount._count.discountUsages,
        totalSaved: totalSaved,
        totalRevenue: totalRevenue,
        uniqueStudents: uniqueStudents,
        averageOrderValue: totalRevenue / (discount._count.discountUsages || 1),
        averageDiscount: totalSaved / (discount._count.discountUsages || 1)
      }
    })

  } catch (error) {
    console.error("Error fetching student discount:", error)
    return NextResponse.json(
      { error: "Failed to fetch student discount" },
      { status: 500 }
    )
  }
}

// PUT /api/pga/student-discounts/[id] - Update student discount
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await context.params

    // Check if discount exists and user owns it
    const existingDiscount = await db.studentDiscount.findUnique({
      where: { id },
      select: { pgaProId: true, usageCount: true }
    })

    if (!existingDiscount) {
      return NextResponse.json(
        { error: "Student discount not found" },
        { status: 404 }
      )
    }

    if (existingDiscount.pgaProId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this discount" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      usageLimit,
      perStudentLimit,
      validUntil,
      isActive,
      requiresStudentVerification,
      allowedInstitutions
    } = body

    // Validation for discount value changes
    if (discountType === "percentage" && discountValue && (discountValue <= 0 || discountValue > 100)) {
      return NextResponse.json(
        { error: "Percentage discount must be between 1 and 100" },
        { status: 400 }
      )
    }

    if (discountType === "fixed_amount" && discountValue && discountValue <= 0) {
      return NextResponse.json(
        { error: "Fixed amount discount must be greater than 0" },
        { status: 400 }
      )
    }

    // Check if usage limit is being reduced below current usage
    if (usageLimit && usageLimit < existingDiscount.usageCount) {
      return NextResponse.json(
        { error: `Cannot set usage limit below current usage count (${existingDiscount.usageCount})` },
        { status: 400 }
      )
    }

    const updatedDiscount = await db.studentDiscount.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(discountType && { discountType }),
        ...(discountValue && { discountValue: parseFloat(discountValue) }),
        ...(minPurchase !== undefined && { minPurchase: minPurchase ? parseFloat(minPurchase) : null }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit) : null }),
        ...(perStudentLimit !== undefined && { perStudentLimit: perStudentLimit ? parseInt(perStudentLimit) : null }),
        ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(requiresStudentVerification !== undefined && { requiresStudentVerification }),
        ...(allowedInstitutions !== undefined && { allowedInstitutions })
      },
      include: {
        pgaPro: {
          select: {
            id: true,
            name: true,
            businessBranding: {
              select: {
                businessName: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedDiscount)

  } catch (error) {
    console.error("Error updating student discount:", error)
    return NextResponse.json(
      { error: "Failed to update student discount" },
      { status: 500 }
    )
  }
}

// DELETE /api/pga/student-discounts/[id] - Delete student discount
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await context.params

    // Check if discount exists and user owns it
    const existingDiscount = await db.studentDiscount.findUnique({
      where: { id },
      select: {
        pgaProId: true,
        usageCount: true,
        _count: {
          select: {
            discountUsages: true
          }
        }
      }
    })

    if (!existingDiscount) {
      return NextResponse.json(
        { error: "Student discount not found" },
        { status: 404 }
      )
    }

    if (existingDiscount.pgaProId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this discount" },
        { status: 403 }
      )
    }

    // Prevent deletion if discount has been used
    if (existingDiscount._count.discountUsages > 0) {
      return NextResponse.json(
        { error: "Cannot delete discount that has been used. Consider deactivating it instead." },
        { status: 400 }
      )
    }

    await db.studentDiscount.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Student discount deleted successfully" })

  } catch (error) {
    console.error("Error deleting student discount:", error)
    return NextResponse.json(
      { error: "Failed to delete student discount" },
      { status: 500 }
    )
  }
}
