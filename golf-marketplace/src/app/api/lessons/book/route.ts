import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// POST /api/lessons/book - Book a lesson
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
    const { lessonId, discountCode, notes } = body

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      )
    }

    // Get lesson details
    const lesson = await db.lessonBooking.findUnique({
      where: { id: lessonId },
      include: {
        students: true,
        pgaPro: {
          select: {
            id: true,
            name: true,
            businessBranding: {
              select: {
                businessName: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      )
    }

    // Validation checks
    if (lesson.status !== "scheduled") {
      return NextResponse.json(
        { error: "This lesson is not available for booking" },
        { status: 400 }
      )
    }

    if (lesson.pgaProId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot book your own lesson" },
        { status: 400 }
      )
    }

    if (lesson.scheduledAt < new Date()) {
      return NextResponse.json(
        { error: "Cannot book past lessons" },
        { status: 400 }
      )
    }

    if (lesson.students.length >= lesson.maxStudents) {
      return NextResponse.json(
        { error: "This lesson is fully booked" },
        { status: 400 }
      )
    }

    // Check if student is already booked
    const existingBooking = lesson.students.find(s => s.studentId === session.user.id)
    if (existingBooking) {
      return NextResponse.json(
        { error: "You are already booked for this lesson" },
        { status: 400 }
      )
    }

    // Calculate final price (with discount if applicable)
    let finalPrice = lesson.price
    let discountAmount = 0
    let appliedDiscount = null

    if (discountCode) {
      try {
        const discountResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/student-discounts/validate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cookie": request.headers.get("cookie") || ""
          },
          body: JSON.stringify({
            code: discountCode,
            cartTotal: lesson.price
          })
        })

        if (discountResponse.ok) {
          const discountData = await discountResponse.json()
          discountAmount = discountData.calculation.discountAmount
          finalPrice = discountData.calculation.finalTotal
          appliedDiscount = discountData.discount
        }
      } catch (error) {
        // Discount validation failed, continue without discount
        console.warn("Discount validation failed:", error)
      }
    }

    // Create the booking
    const booking = await db.lessonStudent.create({
      data: {
        lessonId: lesson.id,
        studentId: session.user.id,
        paidAmount: finalPrice,
        discountApplied: discountAmount,
        notes: notes || null
      },
      include: {
        lesson: {
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
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Update lesson total amount
    await db.lessonBooking.update({
      where: { id: lesson.id },
      data: {
        totalAmount: {
          increment: finalPrice
        }
      }
    })

    // Record discount usage if discount was applied
    if (appliedDiscount && discountAmount > 0) {
      await db.discountUsage.create({
        data: {
          discountId: appliedDiscount.id,
          studentId: session.user.id,
          discountAmount: discountAmount,
          purchaseAmount: lesson.price
        }
      })

      // Update discount usage count
      await db.studentDiscount.update({
        where: { id: appliedDiscount.id },
        data: {
          usageCount: {
            increment: 1
          }
        }
      })
    }

    // Log activity
    await db.activity.create({
      data: {
        userId: session.user.id,
        type: "lesson_booked",
        description: `Booked lesson: ${lesson.title}`,
        metadata: {
          lessonId: lesson.id,
          pgaProId: lesson.pgaProId,
          paidAmount: finalPrice,
          discountApplied: discountAmount
        }
      }
    })

    // TODO: Send confirmation emails to student and instructor
    // TODO: Create payment intent with Stripe for lesson payment

    return NextResponse.json({
      message: "Lesson booked successfully",
      booking: {
        id: booking.id,
        lesson: {
          id: booking.lesson.id,
          title: booking.lesson.title,
          scheduledAt: booking.lesson.scheduledAt,
          duration: booking.lesson.duration,
          location: booking.lesson.location,
          pgaPro: booking.lesson.pgaPro
        },
        paidAmount: booking.paidAmount,
        discountApplied: booking.discountApplied,
        joinedAt: booking.joinedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error booking lesson:", error)
    return NextResponse.json(
      { error: "Failed to book lesson" },
      { status: 500 }
    )
  }
}
