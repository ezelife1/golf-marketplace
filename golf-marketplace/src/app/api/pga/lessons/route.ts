import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// GET /api/pga/lessons - Get all lessons for a PGA Pro
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
    const status = searchParams.get("status") // scheduled, confirmed, cancelled, completed
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: {
      pgaProId: string
      status?: string
      scheduledAt?: {
        gte?: Date
        lte?: Date
      }
    } = {
      pgaProId: session.user.id
    }

    if (status) {
      where.status = status
    }

    if (dateFrom || dateTo) {
      where.scheduledAt = {}
      if (dateFrom) where.scheduledAt.gte = new Date(dateFrom)
      if (dateTo) where.scheduledAt.lte = new Date(dateTo)
    }

    const [lessons, total] = await Promise.all([
      db.lessonBooking.findMany({
        where,
        include: {
          students: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  studentVerification: {
                    select: {
                      verificationStatus: true,
                      institution: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              students: true
            }
          }
        },
        orderBy: { scheduledAt: "asc" },
        take: limit,
        skip: offset
      }),
      db.lessonBooking.count({ where })
    ])

    // Calculate some statistics
    const stats = {
      upcoming: await db.lessonBooking.count({
        where: {
          pgaProId: session.user.id,
          status: { in: ["scheduled", "confirmed"] },
          scheduledAt: { gte: new Date() }
        }
      }),
      thisWeek: await db.lessonBooking.count({
        where: {
          pgaProId: session.user.id,
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      totalStudents: await db.lessonStudent.count({
        where: {
          lesson: {
            pgaProId: session.user.id
          }
        }
      })
    }

    return NextResponse.json({
      lessons: lessons.map(lesson => ({
        ...lesson,
        studentCount: lesson._count.students,
        _count: undefined
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      stats
    })

  } catch (error) {
    console.error("Error fetching lessons:", error)
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    )
  }
}

// POST /api/pga/lessons - Create a new lesson
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
      title,
      description,
      lessonType,
      duration,
      price,
      scheduledAt,
      timeZone = "Europe/London",
      locationType,
      location,
      maxStudents = 1
    } = body

    // Validation
    if (!title || !lessonType || !duration || !price || !scheduledAt || !locationType) {
      return NextResponse.json(
        { error: "Title, lesson type, duration, price, scheduled time, and location type are required" },
        { status: 400 }
      )
    }

    if (duration < 30 || duration > 480) {
      return NextResponse.json(
        { error: "Lesson duration must be between 30 minutes and 8 hours" },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      )
    }

    if (maxStudents < 1 || maxStudents > 20) {
      return NextResponse.json(
        { error: "Maximum students must be between 1 and 20" },
        { status: 400 }
      )
    }

    const lessonStart = new Date(scheduledAt)
    const lessonEnd = new Date(lessonStart.getTime() + duration * 60 * 1000)

    // Check for scheduling conflicts
    const conflictingLesson = await db.lessonBooking.findFirst({
      where: {
        pgaProId: session.user.id,
        status: { in: ["scheduled", "confirmed"] },
        OR: [
          {
            AND: [
              { scheduledAt: { lte: lessonStart } },
              { endTime: { gt: lessonStart } }
            ]
          },
          {
            AND: [
              { scheduledAt: { lt: lessonEnd } },
              { endTime: { gte: lessonEnd } }
            ]
          },
          {
            AND: [
              { scheduledAt: { gte: lessonStart } },
              { scheduledAt: { lt: lessonEnd } }
            ]
          }
        ]
      }
    })

    if (conflictingLesson) {
      return NextResponse.json(
        { error: "You have a scheduling conflict with another lesson at this time" },
        { status: 400 }
      )
    }

    const lesson = await db.lessonBooking.create({
      data: {
        title,
        description,
        lessonType,
        duration,
        price: parseFloat(price),
        scheduledAt: lessonStart,
        endTime: lessonEnd,
        timeZone,
        locationType,
        location,
        maxStudents,
        totalAmount: parseFloat(price), // Will be updated when students book
        pgaProId: session.user.id
      },
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
        }
      }
    })

    // Log activity
    await db.activity.create({
      data: {
        userId: session.user.id,
        type: "lesson_created",
        description: `Created lesson: ${title}`,
        metadata: {
          lessonId: lesson.id,
          lessonType,
          scheduledAt: lessonStart.toISOString(),
          price: parseFloat(price)
        }
      }
    })

    return NextResponse.json(lesson, { status: 201 })

  } catch (error) {
    console.error("Error creating lesson:", error)
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    )
  }
}
