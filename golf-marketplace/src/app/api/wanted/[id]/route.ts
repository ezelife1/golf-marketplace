import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"


// GET /api/wanted/[id] - Get wanted listing details
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const wantedListing = await db.wantedListing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            location: true,
            rating: true,
            pgaVerified: true,
            memberSince: true,
            responseRate: true
          }
        },
        responses: {
          include: {
            responder: {
              select: {
                id: true,
                name: true,
                image: true,
                location: true,
                rating: true,
                pgaVerified: true,
                memberSince: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    if (!wantedListing) {
      return NextResponse.json(
        { error: "Wanted listing not found" },
        { status: 404 }
      )
    }

    // Check if listing is expired
    if (wantedListing.expiresAt && wantedListing.expiresAt < new Date()) {
      // Auto-expire the listing
      await db.wantedListing.update({
        where: { id },
        data: { status: "expired" }
      })

      wantedListing.status = "expired"
    }

    return NextResponse.json(wantedListing)

  } catch (error) {
    console.error("Error fetching wanted listing:", error)
    return NextResponse.json(
      { error: "Failed to fetch wanted listing" },
      { status: 500 }
    )
  }
}

// PUT /api/wanted/[id] - Update wanted listing
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
    const body = await request.json()

    // Check if user owns the listing
    const existingListing = await db.wantedListing.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: "Wanted listing not found" },
        { status: 404 }
      )
    }

    if (existingListing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this listing" },
        { status: 403 }
      )
    }

    const {
      title,
      description,
      category,
      brand,
      condition,
      budgetMin,
      budgetMax,
      location,
      urgent,
      status
    } = body

    const updatedListing = await db.wantedListing.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(brand !== undefined && { brand }),
        ...(condition !== undefined && { condition }),
        ...(budgetMin !== undefined && { budgetMin: budgetMin ? parseFloat(budgetMin) : null }),
        ...(budgetMax !== undefined && { budgetMax: budgetMax ? parseFloat(budgetMax) : null }),
        ...(location !== undefined && { location }),
        ...(urgent !== undefined && { urgent }),
        ...(status && { status })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            location: true,
            rating: true,
            pgaVerified: true
          }
        }
      }
    })

    return NextResponse.json(updatedListing)

  } catch (error) {
    console.error("Error updating wanted listing:", error)
    return NextResponse.json(
      { error: "Failed to update wanted listing" },
      { status: 500 }
    )
  }
}

// DELETE /api/wanted/[id] - Delete wanted listing
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

    // Check if user owns the listing
    const existingListing = await db.wantedListing.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: "Wanted listing not found" },
        { status: 404 }
      )
    }

    if (existingListing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this listing" },
        { status: 403 }
      )
    }

    await db.wantedListing.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Wanted listing deleted successfully" })

  } catch (error) {
    console.error("Error deleting wanted listing:", error)
    return NextResponse.json(
      { error: "Failed to delete wanted listing" },
      { status: 500 }
    )
  }
}
