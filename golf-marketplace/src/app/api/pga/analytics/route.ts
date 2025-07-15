import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// GET /api/pga/analytics - Get comprehensive business analytics for PGA Pro
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
    const period = searchParams.get("period") || "30" // days
    const periodDays = parseInt(period)
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)

    // Revenue Analytics
    const revenueData = await db.order.findMany({
      where: {
        sellerId: session.user.id,
        createdAt: { gte: startDate },
        paymentStatus: "paid"
      },
      select: {
        id: true,
        total: true,
        platformFee: true,
        createdAt: true,
        orderItems: {
          select: {
            price: true,
            quantity: true
          }
        }
      }
    })

    const totalRevenue = revenueData.reduce((sum, order) => sum + order.total, 0)
    const totalCommission = revenueData.reduce((sum, order) => sum + order.platformFee, 0)
    const netRevenue = totalRevenue - totalCommission

    // Product Analytics
    const productStats = await db.product.findMany({
      where: {
        sellerId: session.user.id,
        createdAt: { gte: startDate }
      },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        viewCount: true,
        createdAt: true,
        category: {
          select: { name: true }
        },
        _count: {
          select: {
            favorites: true,
            reviews: true,
            orderItems: true
          }
        }
      }
    })

    const activeListings = productStats.filter(p => p.status === "active").length
    const soldItems = productStats.filter(p => p._count.orderItems > 0).length
    const totalViews = productStats.reduce((sum, p) => sum + p.viewCount, 0)
    const totalFavorites = productStats.reduce((sum, p) => sum + p._count.favorites, 0)

    // Student Discount Analytics
    const discountStats = await db.studentDiscount.findMany({
      where: {
        pgaProId: session.user.id,
        createdAt: { gte: startDate }
      },
      include: {
        discountUsages: {
          where: {
            usedAt: { gte: startDate }
          }
        }
      }
    })

    const totalDiscounts = discountStats.length
    const totalDiscountUsage = discountStats.reduce((sum, d) => sum + d.discountUsages.length, 0)
    const totalStudentSavings = discountStats.reduce((sum, d) =>
      sum + d.discountUsages.reduce((dSum, usage) => dSum + usage.discountAmount, 0), 0
    )

    // Lesson Analytics
    const lessonStats = await db.lessonBooking.findMany({
      where: {
        pgaProId: session.user.id,
        createdAt: { gte: startDate }
      },
      include: {
        students: true
      }
    })

    const totalLessons = lessonStats.length
    const completedLessons = lessonStats.filter(l => l.status === "completed").length
    const totalStudents = lessonStats.reduce((sum, l) => sum + l.students.length, 0)
    const lessonRevenue = lessonStats.reduce((sum, l) => sum + l.totalAmount, 0)

    // Monthly breakdown for charts
    const monthlyData = []
    for (let i = 0; i < Math.min(periodDays / 7, 12); i++) {
      const weekStart = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000)

      const weekRevenue = revenueData
        .filter(order => order.createdAt >= weekStart && order.createdAt < weekEnd)
        .reduce((sum, order) => sum + order.total, 0)

      const weekLessons = lessonStats
        .filter(lesson => lesson.createdAt >= weekStart && lesson.createdAt < weekEnd)
        .length

      const weekDiscountUsage = discountStats
        .reduce((sum, discount) => {
          const weekUsage = discount.discountUsages
            .filter(usage => usage.usedAt >= weekStart && usage.usedAt < weekEnd)
            .length
          return sum + weekUsage
        }, 0)

      monthlyData.unshift({
        period: weekStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        revenue: weekRevenue,
        lessons: weekLessons,
        discountUsage: weekDiscountUsage,
        date: weekStart.toISOString()
      })
    }

    // Top performing products
    const topProducts = productStats
      .sort((a, b) => (b.viewCount + b._count.favorites * 2) - (a.viewCount + a._count.favorites * 2))
      .slice(0, 5)
      .map(product => ({
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category.name,
        views: product.viewCount,
        favorites: product._count.favorites,
        sales: product._count.orderItems,
        score: product.viewCount + product._count.favorites * 2
      }))

    // Customer insights
    const recentCustomers = await db.order.findMany({
      where: {
        sellerId: session.user.id,
        createdAt: { gte: startDate }
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            studentVerification: {
              select: {
                verificationStatus: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })

    const uniqueCustomers = new Set(recentCustomers.map(o => o.buyer.id)).size
    const studentCustomers = recentCustomers.filter(o =>
      o.buyer.studentVerification?.verificationStatus === "verified"
    ).length

    return NextResponse.json({
      summary: {
        totalRevenue,
        netRevenue,
        totalCommission,
        activeListings,
        soldItems,
        totalViews,
        totalFavorites,
        totalLessons,
        completedLessons,
        totalStudents,
        lessonRevenue,
        totalDiscounts,
        totalDiscountUsage,
        totalStudentSavings,
        uniqueCustomers,
        studentCustomers
      },
      chartData: monthlyData,
      topProducts,
      recentActivity: recentCustomers.slice(0, 5).map(order => ({
        id: order.id,
        type: "sale",
        customer: order.buyer.name,
        amount: order.total,
        date: order.createdAt,
        isStudent: order.buyer.studentVerification?.verificationStatus === "verified"
      }))
    })

  } catch (error) {
    console.error("Error fetching PGA analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}
