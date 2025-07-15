import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"


// POST /api/wanted/[id]/responses - Create response to wanted listing
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id: wantedListingId } = await context.params
    const body = await request.json()
    const {
      message,
      offeredPrice,
      productImageUrl,
      contactInfo
    } = body

    // Validation
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Check if wanted listing exists and is active
    const wantedListing = await db.wantedListing.findUnique({
      where: { id: wantedListingId },
      select: {
        id: true,
        status: true,
        userId: true,
        expiresAt: true,
        title: true
      }
    })

    if (!wantedListing) {
      return NextResponse.json(
        { error: "Wanted listing not found" },
        { status: 404 }
      )
    }

    if (wantedListing.status !== "active") {
      return NextResponse.json(
        { error: "This wanted listing is no longer active" },
        { status: 400 }
      )
    }

    if (wantedListing.expiresAt && wantedListing.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This wanted listing has expired" },
        { status: 400 }
      )
    }

    // Prevent users from responding to their own listings
    if (wantedListing.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot respond to your own wanted listing" },
        { status: 400 }
      )
    }

    // Check if user already responded
    const existingResponse = await db.wantedResponse.findFirst({
      where: {
        wantedListingId,
        responderId: session.user.id
      }
    })

    if (existingResponse) {
      return NextResponse.json(
        { error: "You have already responded to this wanted listing" },
        { status: 400 }
      )
    }

    // Create the response
    const response = await db.wantedResponse.create({
      data: {
        message,
        offeredPrice: offeredPrice ? parseFloat(offeredPrice) : null,
        productImageUrl,
        contactInfo,
        wantedListingId,
        responderId: session.user.id
      },
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
        },
        wantedListing: {
          select: {
            id: true,
            title: true,
            user: {
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

    // TODO: Send email notification to wanted listing owner
    // This would integrate with the email template system we created

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error("Error creating wanted response:", error)
    return NextResponse.json(
      { error: "Failed to create response" },
      { status: 500 }
    )
  }
}

// GET /api/wanted/[id]/responses - Get responses for wanted listing
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    const { id: wantedListingId } = await context.params

    // Check if wanted listing exists
    const wantedListing = await db.wantedListing.findUnique({
      where: { id: wantedListingId },
      select: {
        id: true,
        userId: true,
        title: true
      }
    })

    if (!wantedListing) {
      return NextResponse.json(
        { error: "Wanted listing not found" },
        { status: 404 }
      )
    }

    // Only the listing owner can see all responses
    if (!session?.user?.id || wantedListing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to view responses" },
        { status: 403 }
      )
    }

    const responses = await db.wantedResponse.findMany({
      where: { wantedListingId },
      include: {
        responder: {
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
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(responses)

  } catch (error) {
    console.error("Error fetching wanted responses:", error)
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    )
  }
}
