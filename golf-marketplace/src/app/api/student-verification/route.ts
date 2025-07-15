import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// GET /api/student-verification - Get current user's student verification status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const verification = await db.studentVerification.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!verification) {
      return NextResponse.json(
        { verified: false, status: "not_applied" }
      )
    }

    // Check if verification has expired
    const isExpired = verification.expiresAt < new Date()

    return NextResponse.json({
      verified: verification.verificationStatus === "verified" && !isExpired,
      status: isExpired ? "expired" : verification.verificationStatus,
      verification: {
        ...verification,
        documentUrl: undefined // Don't expose document URL in GET response
      }
    })

  } catch (error) {
    console.error("Error fetching student verification:", error)
    return NextResponse.json(
      { error: "Failed to fetch verification status" },
      { status: 500 }
    )
  }
}

// POST /api/student-verification - Submit student verification application
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
    const {
      studentId,
      institution,
      courseOfStudy,
      academicYear,
      graduationDate,
      documentUrl
    } = body

    // Validation
    if (!studentId || !institution) {
      return NextResponse.json(
        { error: "Student ID and institution are required" },
        { status: 400 }
      )
    }

    if (!documentUrl) {
      return NextResponse.json(
        { error: "Student verification document is required" },
        { status: 400 }
      )
    }

    // Check if user already has a verification
    const existingVerification = await db.studentVerification.findUnique({
      where: { userId: session.user.id }
    })

    if (existingVerification) {
      // If existing verification is pending or verified and not expired, don't allow new submission
      if (existingVerification.verificationStatus === "pending" ||
          (existingVerification.verificationStatus === "verified" &&
           existingVerification.expiresAt > new Date())) {
        return NextResponse.json(
          { error: "You already have a pending or active student verification" },
          { status: 400 }
        )
      }
    }

    // Calculate expiration date (1 year from graduation or current date + 4 years)
    const expirationDate = graduationDate
      ? new Date(graduationDate)
      : new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000) // 4 years from now

    const verificationData = {
      studentId,
      institution,
      courseOfStudy,
      academicYear,
      graduationDate: graduationDate ? new Date(graduationDate) : null,
      documentUrl,
      expiresAt: expirationDate,
      verificationStatus: "pending"
    }

    let verification

    if (existingVerification) {
      // Update existing verification
      verification = await db.studentVerification.update({
        where: { userId: session.user.id },
        data: verificationData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    } else {
      // Create new verification
      verification = await db.studentVerification.create({
        data: {
          ...verificationData,
          userId: session.user.id
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    }

    // Log activity
    await db.activity.create({
      data: {
        userId: session.user.id,
        type: "student_verification_submitted",
        description: `Student verification submitted for ${institution}`,
        metadata: {
          institution,
          studentId: studentId.substring(0, 4) + "****" // Partial student ID for privacy
        }
      }
    })

    return NextResponse.json({
      message: "Student verification submitted successfully",
      verification: {
        ...verification,
        documentUrl: undefined // Don't expose document URL in response
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error submitting student verification:", error)
    return NextResponse.json(
      { error: "Failed to submit student verification" },
      { status: 500 }
    )
  }
}

// PUT /api/student-verification - Update student verification (for resubmission)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user has a verification that can be updated
    const existingVerification = await db.studentVerification.findUnique({
      where: { userId: session.user.id }
    })

    if (!existingVerification) {
      return NextResponse.json(
        { error: "No student verification found to update" },
        { status: 404 }
      )
    }

    if (existingVerification.verificationStatus === "verified" &&
        existingVerification.expiresAt > new Date()) {
      return NextResponse.json(
        { error: "Cannot update an active verified student status" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      studentId,
      institution,
      courseOfStudy,
      academicYear,
      graduationDate,
      documentUrl
    } = body

    // Validation
    if (!studentId || !institution) {
      return NextResponse.json(
        { error: "Student ID and institution are required" },
        { status: 400 }
      )
    }

    // Calculate new expiration date
    const expirationDate = graduationDate
      ? new Date(graduationDate)
      : new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000)

    const updatedVerification = await db.studentVerification.update({
      where: { userId: session.user.id },
      data: {
        studentId,
        institution,
        courseOfStudy,
        academicYear,
        graduationDate: graduationDate ? new Date(graduationDate) : null,
        ...(documentUrl && { documentUrl }),
        expiresAt: expirationDate,
        verificationStatus: "pending", // Reset to pending
        verifiedBy: null,
        verifiedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Student verification updated successfully",
      verification: {
        ...updatedVerification,
        documentUrl: undefined
      }
    })

  } catch (error) {
    console.error("Error updating student verification:", error)
    return NextResponse.json(
      { error: "Failed to update student verification" },
      { status: 500 }
    )
  }
}
