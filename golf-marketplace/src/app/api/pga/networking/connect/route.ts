import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// POST /api/pga/networking/connect - Send connection request to another PGA Professional
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
      select: { pgaVerified: true, subscriptionTier: true, name: true }
    })

    if (!user?.pgaVerified || user.subscriptionTier !== "pga-pro") {
      return NextResponse.json(
        { error: "PGA Professional verification required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { professionalId } = body

    if (!professionalId) {
      return NextResponse.json(
        { error: "Professional ID is required" },
        { status: 400 }
      )
    }

    if (professionalId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot connect to yourself" },
        { status: 400 }
      )
    }

    // Check if target user is a verified PGA Pro
    const targetUser = await db.user.findUnique({
      where: { id: professionalId },
      select: { pgaVerified: true, subscriptionTier: true, name: true }
    })

    if (!targetUser?.pgaVerified || targetUser.subscriptionTier !== "pga-pro") {
      return NextResponse.json(
        { error: "Target user is not a verified PGA Professional" },
        { status: 400 }
      )
    }

    // Check if connection already exists
    const existingConnection = await db.pGAConnection.findFirst({
      where: {
        OR: [
          { fromUserId: session.user.id, toUserId: professionalId },
          { fromUserId: professionalId, toUserId: session.user.id }
        ]
      }
    })

    if (existingConnection) {
      if (existingConnection.status === "accepted") {
        return NextResponse.json(
          { error: "Already connected to this professional" },
          { status: 400 }
        )
      }
      if (existingConnection.status === "pending") {
        return NextResponse.json(
          { error: "Connection request already pending" },
          { status: 400 }
        )
      }
    }

    // Create connection record
    const connection = await db.pGAConnection.create({
      data: {
        fromUserId: session.user.id,
        toUserId: professionalId,
        status: "accepted", // For demo purposes, auto-accept connections
        connectedAt: new Date()
      }
    })

    // Log activity for both users
    await Promise.all([
      db.activity.create({
        data: {
          userId: session.user.id,
          type: "pga_connection_sent",
          description: `Connected with ${targetUser.name}`,
          metadata: {
            targetUserId: professionalId,
            connectionId: connection.id
          }
        }
      }),
      db.activity.create({
        data: {
          userId: professionalId,
          type: "pga_connection_received",
          description: `Connected with ${user.name}`,
          metadata: {
            fromUserId: session.user.id,
            connectionId: connection.id
          }
        }
      })
    ])

    return NextResponse.json({
      message: "Successfully connected",
      connection: {
        id: connection.id,
        status: connection.status,
        connectedAt: connection.connectedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating PGA connection:", error)
    return NextResponse.json(
      { error: "Failed to create connection" },
      { status: 500 }
    )
  }
}

// GET /api/pga/networking/connect - Get connection requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get pending connection requests
    const pendingRequests = await db.pGAConnection.findMany({
      where: {
        toUserId: session.user.id,
        status: "pending"
      },
      include: {
        fromUser: {
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
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      pendingRequests: pendingRequests.map((req: any) => ({
        id: req.id,
        fromUser: {
          id: req.fromUser.id,
          name: req.fromUser.name,
          businessName: req.fromUser.businessBranding?.businessName,
          logoUrl: req.fromUser.businessBranding?.logoUrl
        },
        createdAt: req.createdAt
      }))
    })

  } catch (error) {
    console.error("Error fetching connection requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch connection requests" },
      { status: 500 }
    )
  }
}
