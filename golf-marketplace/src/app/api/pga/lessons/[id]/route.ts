import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// GET /api/pga/lessons/[id] - Get specific lesson details
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await await context.params

    const lesson = await db.lessonBooking.findUnique({
      where: { id },
      include: {
        pgaPro: {
          select: {
            id: true,
            name: true,
            businessBranding: {
              select: {
                businessName: true,
                logoUrl: true,
                phone: true,
                email: true
              }
            }
          }
        },
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                phone: true,
                studentVerification: {
                  select: {
                    verificationStatus: true,
                    institution: true,
                    courseOfStudy: true
                  }
                }
              }
            }
          },
          orderBy: { joinedAt: "asc" }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      )
    }

    // Check if user is the PGA Pro or one of the students
    const isInstructor = lesson.pgaProId === session.user.id
    const isStudent = lesson.students.some(s => s.studentId === session.user.id)

    if (!isInstructor && !isStudent) {
      return NextResponse.json(
        { error: "Not authorized to view this lesson" },
        { status: 403 }
      )
    }

    // Filter sensitive information based on user role
    const responseData = {
      ...lesson,
      // Only show instructor notes to the instructor
      proNotes: isInstructor ? lesson.proNotes : null,
      // Only show full student details to instructor
      students: lesson.students.map(student => ({
        ...student,
        student: {
          ...student.student,
          email: isInstructor ? student.student.email : null,
          phone: isInstructor ? student.student.phone : null
        }
      }))
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error("Error fetching lesson:", error)
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    )
  }
}

// PUT /api/pga/lessons/[id] - Update lesson
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await await context.params

    // Check if lesson exists and user owns it
    const existingLesson = await db.lessonBooking.findUnique({
      where: { id },
      select: {
        pgaProId: true,
        status: true,
        scheduledAt: true,
        students: { select: { id: true } }
      }
    })

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      )
    }

    if (existingLesson.pgaProId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this lesson" },
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
      timeZone,
      locationType,
      location,
      maxStudents,
      status,
      proNotes,
      rating
    } = body

    // Prevent certain updates if lesson has students or is in the past
    const hasStudents = existingLesson.students.length > 0
    const isPastLesson = existingLesson.scheduledAt < new Date()

    if (isPastLesson && (scheduledAt || duration || price)) {
      return NextResponse.json(
        { error: "Cannot modify time or price for past lessons" },
        { status: 400 }
      )
    }

    if (hasStudents && maxStudents && maxStudents < existingLesson.students.length) {
      return NextResponse.json(
        { error: "Cannot reduce maximum students below current enrollment" },
        { status: 400 }
      )
    }

    // Validation for new scheduled time
    if (scheduledAt) {
      const newLessonStart = new Date(scheduledAt)
      const newLessonEnd = new Date(newLessonStart.getTime() + (duration || 60) * 60 * 1000)

      // Check for scheduling conflicts (excluding current lesson)
      const conflictingLesson = await db.lessonBooking.findFirst({
        where: {
          pgaProId: session.user.id,
          id: { not: id },
          status: { in: ["scheduled", "confirmed"] },
          OR: [
            {
              AND: [
                { scheduledAt: { lte: newLessonStart } },
                { endTime: { gt: newLessonStart } }
              ]
            },
            {
              AND: [
                { scheduledAt: { lt: newLessonEnd } },
                { endTime: { gte: newLessonEnd } }
              ]
            },
            {
              AND: [
                { scheduledAt: { gte: newLessonStart } },
                { scheduledAt: { lt: newLessonEnd } }
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
    }

    const updateData: any = {}

    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (lessonType) updateData.lessonType = lessonType
    if (duration) {
      updateData.duration = duration
      // Recalculate end time if duration changes
      const startTime = scheduledAt ? new Date(scheduledAt) : existingLesson.scheduledAt
      updateData.endTime = new Date(startTime.getTime() + duration * 60 * 1000)
    }
    if (price) updateData.price = parseFloat(price)
    if (scheduledAt) {
      updateData.scheduledAt = new Date(scheduledAt)
      // Recalculate end time if start time changes
      const durationMinutes = duration || 60
      updateData.endTime = new Date(new Date(scheduledAt).getTime() + durationMinutes * 60 * 1000)
    }
    if (timeZone) updateData.timeZone = timeZone
    if (locationType) updateData.locationType = locationType
    if (location !== undefined) updateData.location = location
    if (maxStudents) updateData.maxStudents = maxStudents
    if (status) updateData.status = status
    if (proNotes !== undefined) updateData.proNotes = proNotes
    if (rating) updateData.rating = parseFloat(rating)

    const updatedLesson = await db.lessonBooking.update({
      where: { id },
      data: updateData,
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
        },
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Log the update
    await db.activity.create({
      data: {
        userId: session.user.id,
        type: "lesson_updated",
        description: `Updated lesson: ${updatedLesson.title}`,
        metadata: {
          lessonId: updatedLesson.id,
          changes: Object.keys(updateData)
        }
      }
    })

    return NextResponse.json(updatedLesson)

  } catch (error) {
    console.error("Error updating lesson:", error)
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    )
  }
}

// DELETE /api/pga/lessons/[id] - Cancel/Delete lesson
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await await context.params

    // Check if lesson exists and user owns it
    const existingLesson = await db.lessonBooking.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      )
    }

    if (existingLesson.pgaProId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this lesson" },
        { status: 403 }
      )
    }

    // Check if lesson has students
    if (existingLesson.students.length > 0) {
      // If lesson has students, just cancel it instead of deleting
      const cancelledLesson = await db.lessonBooking.update({
        where: { id },
        data: { status: "cancelled" }
      })

      // TODO: Send cancellation emails to students
      // TODO: Process refunds if needed

      return NextResponse.json({
        message: "Lesson cancelled successfully",
        lesson: cancelledLesson
      })
    }

    // If no students, safe to delete
    await db.lessonBooking.delete({
      where: { id }
    })

    // Log the deletion
    await db.activity.create({
      data: {
        userId: session.user.id,
        type: "lesson_deleted",
        description: `Deleted lesson: ${existingLesson.title}`,
        metadata: {
          lessonId: existingLesson.id
        }
      }
    })

    return NextResponse.json({ message: "Lesson deleted successfully" })

  } catch (error) {
    console.error("Error deleting lesson:", error)
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    )
  }
}
