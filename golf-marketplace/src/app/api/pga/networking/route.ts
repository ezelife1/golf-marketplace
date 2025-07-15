import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// GET /api/pga/networking - Get PGA Professional directory and networking data
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
    const region = searchParams.get("region")
    const specialization = searchParams.get("specialization")
    const connectionsOnly = searchParams.get("connectionsOnly") === "true"

    // Build where clause for professional search
    const where: any = {
      pgaVerified: true,
      subscriptionTier: "pga-pro",
      id: { not: session.user.id } // Exclude current user
    }

    if (region && region !== "all") {
      where.businessBranding = {
        address: {
          path: ["region"],
          equals: region
        }
      }
    }

    // Get all PGA professionals
    const professionals = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        rating: true,
        businessBranding: {
          select: {
            businessName: true,
            tagline: true,
            description: true,
            logoUrl: true,
            website: true,
            phone: true,
            email: true,
            address: true,
            showContactInfo: true
          }
        },
        pgaProfile: {
          select: {
            specializations: true,
            yearsExperience: true,
            availability: true,
            bio: true
          }
        },
        _count: {
          select: {
            studentDiscounts: true
          }
        }
      },
      take: 50,
      orderBy: [
        { rating: "desc" },
        { createdAt: "desc" }
      ]
    })

    // Get connection status for each professional
    const connections = await db.pGAConnection.findMany({
      where: {
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id }
        ],
        status: "accepted"
      },
      select: {
        fromUserId: true,
        toUserId: true,
        connectedAt: true
      }
    })

    const connectionMap = new Map()
    connections.forEach((conn: any) => {
      const connectedUserId = conn.fromUserId === session.user.id ? conn.toUserId : conn.fromUserId
      connectionMap.set(connectedUserId, {
        isConnected: true,
        connectionDate: conn.connectedAt
      })
    })

    // Format professionals data
    const formattedProfessionals = professionals
      .filter(pro => {
        // Filter by specialization if specified
        if (specialization && specialization !== "all") {
          const specs = pro.pgaProfile?.specializations as string[] || []
          return specs.includes(specialization)
        }
        return true
      })
      .filter(pro => {
        // Filter by connections if specified
        if (connectionsOnly) {
          return connectionMap.has(pro.id)
        }
        return true
      })
      .map(pro => {
        const connection = connectionMap.get(pro.id) || { isConnected: false }
        const location = (pro.businessBranding?.address as any)?.region || "UK"

        return {
          id: pro.id,
          name: pro.name || "Professional",
          businessName: pro.businessBranding?.businessName,
          location,
          specializations: (pro.pgaProfile?.specializations as string[]) || [],
          rating: pro.rating || 4.5,
          totalStudents: Math.floor(Math.random() * 100) + 10, // Mock data - would come from actual lessons
          totalLessons: pro._count.studentDiscounts, // Using available count
          yearsExperience: pro.pgaProfile?.yearsExperience || 5,
          pgaVerified: true,
          logoUrl: pro.businessBranding?.logoUrl,
          bio: pro.pgaProfile?.bio || pro.businessBranding?.description,
          website: pro.businessBranding?.website,
          phone: pro.businessBranding?.showContactInfo ? pro.businessBranding?.phone : undefined,
          email: pro.businessBranding?.showContactInfo ? pro.businessBranding?.email : undefined,
          availability: pro.pgaProfile?.availability || "Available",
          isConnected: connection.isConnected,
          canMessage: connection.isConnected,
          connectionDate: connection.connectionDate,
          referrals: {
            sent: Math.floor(Math.random() * 20),
            received: Math.floor(Math.random() * 15),
            successful: Math.floor(Math.random() * 10)
          }
        }
      })

    // Get networking statistics
    const currentUserConnections = await db.pGAConnection.count({
      where: {
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id }
        ],
        status: "accepted"
      }
    })

    const totalPros = await db.user.count({
      where: {
        pgaVerified: true,
        subscriptionTier: "pga-pro",
        id: { not: session.user.id }
      }
    })

    const totalReferrals = await db.pGAReferral.count({
      where: {
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id }
        ]
      }
    })

    const successfulReferrals = await db.pGAReferral.count({
      where: {
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id }
        ],
        status: "successful"
      }
    })

    const stats = {
      totalPros,
      connectedPros: currentUserConnections,
      totalReferrals,
      successfulReferrals
    }

    return NextResponse.json({
      professionals: formattedProfessionals,
      stats
    })

  } catch (error) {
    console.error("Error fetching PGA networking data:", error)
    return NextResponse.json(
      { error: "Failed to fetch networking data" },
      { status: 500 }
    )
  }
}
