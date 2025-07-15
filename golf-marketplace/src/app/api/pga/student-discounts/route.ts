import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// GET /api/pga/student-discounts - Get all student discounts for a PGA Pro
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user is a verified PGA Pro
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { pgaVerified: true, subscriptionTier: true }
    })

    if (!user?.pgaVerified || user.subscriptionTier !== "pga-pro") {
      return NextResponse.json(
        { error: "PGA Professional verification required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // active, inactive, expired
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: {
      pgaProId: string
      isActive?: boolean
      validUntil?: { gte: Date } | { lt: Date }
    } = {
      pgaProId: session.user.id
    }

    if (status === "active") {
      where.isActive = true
      where.validUntil = { gte: new Date() }
    } else if (status === "inactive") {
      where.isActive = false
    } else if (status === "expired") {
      where.validUntil = { lt: new Date() }
    }

    const [discounts, total] = await Promise.all([
      db.studentDiscount.findMany({
        where,
        include: {
          discountUsages: {
            select: {
              id: true,
              discountAmount: true,
              purchaseAmount: true,
              usedAt: true,
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { usedAt: "desc" },
            take: 5 // latest 5 usages
          },
          _count: {
            select: {
              discountUsages: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset
      }),
      db.studentDiscount.count({ where })
    ])

    return NextResponse.json({
      discounts: discounts.map(discount => ({
        ...discount,
        totalUsages: discount._count.discountUsages,
        recentUsages: discount.discountUsages,
        discountUsages: undefined,
        _count: undefined
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error("Error fetching student discounts:", error)
    return NextResponse.json(
      { error: "Failed to fetch student discounts" },
      { status: 500 }
    )
  }
}

// POST /api/pga/student-discounts - Create a new student discount
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user is a verified PGA Pro
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { pgaVerified: true, subscriptionTier: true }
    })

    if (!user?.pgaVerified || user.subscriptionTier !== "pga-pro") {
      return NextResponse.json(
        { error: "PGA Professional verification required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      usageLimit,
      perStudentLimit,
      validUntil,
      requiresStudentVerification = true,
      allowedInstitutions
    } = body

    // Validation
    if (!code || !name || !discountType || !discountValue) {
      return NextResponse.json(
        { error: "Code, name, discount type, and discount value are required" },
        { status: 400 }
      )
    }

    if (discountType === "percentage" && (discountValue <= 0 || discountValue > 100)) {
      return NextResponse.json(
        { error: "Percentage discount must be between 1 and 100" },
        { status: 400 }
      )
    }

    if (discountType === "fixed_amount" && discountValue <= 0) {
      return NextResponse.json(
        { error: "Fixed amount discount must be greater than 0" },
        { status: 400 }
      )
    }

    // Check if code is unique for this PGA Pro
    const existingDiscount = await db.studentDiscount.findFirst({
      where: {
        code,
        pgaProId: session.user.id
      }
    })

    if (existingDiscount) {
      return NextResponse.json(
        { error: "Discount code already exists" },
        { status: 400 }
      )
    }

    const discount = await db.studentDiscount.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perStudentLimit: perStudentLimit ? parseInt(perStudentLimit) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        requiresStudentVerification,
        allowedInstitutions: allowedInstitutions || null,
        pgaProId: session.user.id
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

    return NextResponse.json(discount, { status: 201 })

  } catch (error) {
    console.error("Error creating student discount:", error)
    return NextResponse.json(
      { error: "Failed to create student discount" },
      { status: 500 }
    )
  }
}
