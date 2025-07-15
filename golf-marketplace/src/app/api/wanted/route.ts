import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// GET /api/wanted - Fetch wanted listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const location = searchParams.get("location")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const sortBy = searchParams.get("sortBy") || "recent"

    const where: {
      status: string
      OR: Array<{ expiresAt: null } | { expiresAt: { gte: Date } }>
      category?: string
      location?: {
        contains: string
        mode: "insensitive"
      }
    } = {
      status: "active",
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } }
      ]
    }

    if (category && category !== "all") {
      where.category = category
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive"
      }
    }

    let orderBy:
      | { createdAt: "desc" | "asc" }
      | Array<{ urgent?: "desc"; createdAt?: "desc" }>
      | { budgetMax: "desc" }
      | { budgetMin: "asc" } = { createdAt: "desc" }

    if (sortBy === "urgent") {
      orderBy = [
        { urgent: "desc" },
        { createdAt: "desc" }
      ]
    } else if (sortBy === "budget-high") {
      orderBy = { budgetMax: "desc" }
    } else if (sortBy === "budget-low") {
      orderBy = { budgetMin: "asc" }
    }

    const [wantedListings, total] = await Promise.all([
      db.wantedListing.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
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
          responses: {
            select: {
              id: true,
              createdAt: true
            }
          }
        }
      }),
      db.wantedListing.count({ where })
    ])

    return NextResponse.json({
      wantedListings: wantedListings.map((listing: any) => ({
        ...listing,
        responseCount: listing.responses.length,
        responses: undefined
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching wanted listings:", error)
    return NextResponse.json(
      { error: "Failed to fetch wanted listings" },
      { status: 500 }
    )
  }
}

// POST /api/wanted - Create new wanted listing
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
      title,
      description,
      category,
      brand,
      condition,
      budgetMin,
      budgetMax,
      location,
      urgent = false,
      expiresIn = 30 // days
    } = body

    // Validation
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      )
    }

    if (budgetMin && budgetMax && budgetMin > budgetMax) {
      return NextResponse.json(
        { error: "Minimum budget cannot be higher than maximum budget" },
        { status: 400 }
      )
    }

    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresIn)

    const wantedListing = await db.wantedListing.create({
      data: {
        title,
        description,
        category,
        brand,
        condition,
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        location,
        urgent,
        expiresAt,
        userId: session.user.id
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

    return NextResponse.json(wantedListing, { status: 201 })

  } catch (error) {
    console.error("Error creating wanted listing:", error)
    return NextResponse.json(
      { error: "Failed to create wanted listing" },
      { status: 500 }
    )
  }
}
