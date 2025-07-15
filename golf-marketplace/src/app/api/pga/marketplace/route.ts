import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// GET /api/pga/marketplace - Get PGA Pro exclusive marketplace items
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
    const category = searchParams.get("category") // demo, new_release, professional_only
    const earlyAccess = searchParams.get("earlyAccess") === "true"
    const brand = searchParams.get("brand")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Build where clause for pro marketplace items
    const where: {
      isProExclusive: boolean
      requiresPGAVerification: boolean
      earlyAccess?: boolean
      category?: string
      product: {
        status: string
        brand?: string
      }
    } = {
      isProExclusive: true,
      requiresPGAVerification: true,
      product: {
        status: "active"
      }
    }

    if (earlyAccess) {
      where.earlyAccess = true
    }

    if (category) {
      where.category = category
    }

    if (brand) {
      where.product.brand = brand
    }

    const [proItems, total] = await Promise.all([
      db.proMarketplace.findMany({
        where,
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  pgaVerified: true,
                  rating: true,
                  businessBranding: {
                    select: {
                      businessName: true,
                      logoUrl: true
                    }
                  }
                }
              },
              category: {
                select: {
                  name: true,
                  slug: true
                }
              },
              _count: {
                select: {
                  reviews: true,
                  favorites: true
                }
              }
            }
          }
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" }
        ],
        take: limit,
        skip: offset
      }),
      db.proMarketplace.count({ where })
    ])

    // Get marketplace statistics
    const stats = {
      totalItems: await db.proMarketplace.count({
        where: {
          requiresPGAVerification: true,
          product: { status: "active" }
        }
      }),
      earlyAccessItems: await db.proMarketplace.count({
        where: {
          earlyAccess: true,
          product: { status: "active" }
        }
      }),
      demoItems: await db.proMarketplace.count({
        where: {
          category: "demo",
          product: { status: "active" }
        }
      }),
      newReleases: await db.proMarketplace.count({
        where: {
          category: "new_release",
          product: { status: "active" }
        }
      })
    }

    return NextResponse.json({
      items: proItems.map(item => ({
        id: item.id,
        category: item.category,
        priority: item.priority,
        isProExclusive: item.isProExclusive,
        earlyAccess: item.earlyAccess,
        proPrice: item.proPrice,
        product: {
          ...item.product,
          stats: {
            views: item.product.viewCount,
            favorites: item.product._count.favorites,
            reviews: item.product._count.reviews
          }
        }
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
    console.error("Error fetching PGA marketplace items:", error)
    return NextResponse.json(
      { error: "Failed to fetch PGA marketplace items" },
      { status: 500 }
    )
  }
}

// POST /api/pga/marketplace - Add product to PGA Pro marketplace (for manufacturers/dealers)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user is a verified PGA Pro or Business member
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        pgaVerified: true,
        subscriptionTier: true
      }
    })

    if (!user?.pgaVerified && user?.subscriptionTier !== "business") {
      return NextResponse.json(
        { error: "PGA Professional verification or Business membership required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      productId,
      category = "professional_only",
      priority = 0,
      earlyAccess = false,
      proPrice,
      requiresPGAVerification = true
    } = body

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Check if product exists and user owns it
    const product = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        sellerId: true,
        title: true,
        price: true,
        status: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    if (product.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only add your own products to the pro marketplace" },
        { status: 403 }
      )
    }

    if (product.status !== "active") {
      return NextResponse.json(
        { error: "Only active products can be added to the pro marketplace" },
        { status: 400 }
      )
    }

    // Check if product is already in pro marketplace
    const existingProItem = await db.proMarketplace.findUnique({
      where: { productId }
    })

    if (existingProItem) {
      return NextResponse.json(
        { error: "Product is already in the pro marketplace" },
        { status: 400 }
      )
    }

    // Validate pro price
    if (proPrice && proPrice >= product.price) {
      return NextResponse.json(
        { error: "Pro price must be lower than regular price" },
        { status: 400 }
      )
    }

    const proMarketplaceItem = await db.proMarketplace.create({
      data: {
        productId,
        category,
        priority,
        earlyAccess,
        proPrice: proPrice ? parseFloat(proPrice) : null,
        requiresPGAVerification
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            primaryImage: true
          }
        }
      }
    })

    // Log activity
    await db.activity.create({
      data: {
        userId: session.user.id,
        type: "pro_marketplace_added",
        description: `Added product to PGA Pro marketplace: ${product.title}`,
        metadata: {
          productId,
          category,
          earlyAccess,
          proPrice
        }
      }
    })

    return NextResponse.json(proMarketplaceItem, { status: 201 })

  } catch (error) {
    console.error("Error adding to PGA marketplace:", error)
    return NextResponse.json(
      { error: "Failed to add product to PGA marketplace" },
      { status: 500 }
    )
  }
}
