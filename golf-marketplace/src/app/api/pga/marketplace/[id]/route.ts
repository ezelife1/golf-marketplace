import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"

// GET /api/pga/marketplace/[id] - Get specific pro marketplace item
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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

    const { id } = await context.params

    const proItem = await db.proMarketplace.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                pgaVerified: true,
                rating: true,
                memberSince: true,
                businessBranding: {
                  select: {
                    businessName: true,
                    logoUrl: true,
                    description: true,
                    website: true,
                    phone: true,
                    email: true
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
            reviews: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    pgaVerified: true
                  }
                }
              },
              orderBy: { createdAt: "desc" },
              take: 5
            },
            _count: {
              select: {
                reviews: true,
                favorites: true
              }
            }
          }
        }
      }
    })

    if (!proItem) {
      return NextResponse.json(
        { error: "Pro marketplace item not found" },
        { status: 404 }
      )
    }

    // Increment view count
    await db.product.update({
      where: { id: proItem.productId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    // Calculate average rating
    const avgRating = proItem.product.reviews.length > 0
      ? proItem.product.reviews.reduce((sum, review) => sum + review.rating, 0) / proItem.product.reviews.length
      : null

    return NextResponse.json({
      ...proItem,
      product: {
        ...proItem.product,
        averageRating: avgRating,
        stats: {
          views: proItem.product.viewCount + 1,
          favorites: proItem.product._count.favorites,
          reviews: proItem.product._count.reviews
        }
      }
    })

  } catch (error) {
    console.error("Error fetching pro marketplace item:", error)
    return NextResponse.json(
      { error: "Failed to fetch pro marketplace item" },
      { status: 500 }
    )
  }
}

// PUT /api/pga/marketplace/[id] - Update pro marketplace item
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

    // Check if pro marketplace item exists
    const existingItem = await db.proMarketplace.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            sellerId: true,
            title: true,
            price: true
          }
        }
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: "Pro marketplace item not found" },
        { status: 404 }
      )
    }

    // Check if user owns the product
    if (existingItem.product.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this item" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      category,
      priority,
      earlyAccess,
      proPrice,
      requiresPGAVerification
    } = body

    // Validate pro price
    if (proPrice && proPrice >= existingItem.product.price) {
      return NextResponse.json(
        { error: "Pro price must be lower than regular price" },
        { status: 400 }
      )
    }

    const updatedItem = await db.proMarketplace.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(priority !== undefined && { priority }),
        ...(earlyAccess !== undefined && { earlyAccess }),
        ...(proPrice !== undefined && { proPrice: proPrice ? parseFloat(proPrice) : null }),
        ...(requiresPGAVerification !== undefined && { requiresPGAVerification })
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
        type: "pro_marketplace_updated",
        description: `Updated pro marketplace item: ${existingItem.product.title}`,
        metadata: {
          itemId: id,
          changes: Object.keys(body)
        }
      }
    })

    return NextResponse.json(updatedItem)

  } catch (error) {
    console.error("Error updating pro marketplace item:", error)
    return NextResponse.json(
      { error: "Failed to update pro marketplace item" },
      { status: 500 }
    )
  }
}

// DELETE /api/pga/marketplace/[id] - Remove from pro marketplace
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

    // Check if pro marketplace item exists
    const existingItem = await db.proMarketplace.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            sellerId: true,
            title: true
          }
        }
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: "Pro marketplace item not found" },
        { status: 404 }
      )
    }

    // Check if user owns the product
    if (existingItem.product.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to remove this item" },
        { status: 403 }
      )
    }

    await db.proMarketplace.delete({
      where: { id }
    })

    // Log activity
    await db.activity.create({
      data: {
        userId: session.user.id,
        type: "pro_marketplace_removed",
        description: `Removed from pro marketplace: ${existingItem.product.title}`,
        metadata: {
          itemId: id,
          productId: existingItem.productId
        }
      }
    })

    return NextResponse.json({ message: "Item removed from pro marketplace successfully" })

  } catch (error) {
    console.error("Error removing from pro marketplace:", error)
    return NextResponse.json(
      { error: "Failed to remove from pro marketplace" },
      { status: 500 }
    )
  }
}
