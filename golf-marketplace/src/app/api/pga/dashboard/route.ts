import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// GET /api/pga/dashboard - Get PGA Professional dashboard statistics
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

    // Get user's active products
    const activeListings = await db.product.count({
      where: {
        sellerId: session.user.id,
        status: "active"
      }
    })

    // Get total revenue (from payment transactions)
    const totalRevenueResult = await db.paymentTransaction.aggregate({
      where: {
        userId: session.user.id,
        status: "completed"
      },
      _sum: {
        amount: true
      }
    })

    // Get lesson stats
    const totalLessons = await db.lessonBooking.count({
      where: {
        pgaProId: session.user.id
      }
    })

    // Get total students (unique students who booked lessons)
    const totalStudents = await db.lessonStudent.groupBy({
      by: ['studentId'],
      where: {
        lesson: {
          pgaProId: session.user.id
        }
      }
    })

    // Get networking connections
    const totalConnections = await db.pGAConnection.count({
      where: {
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id }
        ],
        status: "accepted"
      }
    })

    // Get total referrals
    const totalReferrals = await db.pGAReferral.count({
      where: {
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id }
        ]
      }
    })

    // Get recent activity
    const recentActivity = await db.activity.findMany({
      where: {
        userId: session.user.id,
        type: {
          in: [
            "product_created",
            "product_sold",
            "lesson_booked",
            "lesson_completed",
            "pga_connection_sent",
            "pga_connection_received",
            "discount_created",
            "discount_used"
          ]
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    })

    const stats = {
      totalRevenue: totalRevenueResult._sum.amount || 0,
      activeListings,
      totalStudents: totalStudents.length,
      totalLessons,
      totalConnections,
      totalReferrals,
      recentActivity: recentActivity.map(activity => ({
        type: activity.type,
        description: activity.description,
        date: activity.createdAt.toLocaleDateString()
      }))
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Error fetching PGA dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    )
  }
}
