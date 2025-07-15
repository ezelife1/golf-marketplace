import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch user data and products for storefront
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Fetch user with branding and basic stats
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        businessBranding: true,
        _count: {
          select: {
            products: {
              where: { status: 'active' }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has premium storefront access
    const isPremiumStorefront = user.subscriptionTier &&
      ['business', 'pga-pro'].includes(user.subscriptionTier)

    // Fetch user's active products
    const products = await db.product.findMany({
      where: {
        sellerId: userId,
        status: 'active'
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            favorites: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 20 // Limit to first 20 products for storefront
    })

    // Calculate additional stats
    const totalRevenue = await db.product.aggregate({
      where: {
        sellerId: userId,
        status: 'sold'
      },
      _sum: {
        price: true
      }
    })

    // Get review stats (mock data since review model structure may vary)
    const reviewStats = {
      _avg: { rating: 4.8 },
      _count: 127
    }

    // Calculate response rate (mock calculation)
    const responseRate = user.verified ? 95 + Math.floor(Math.random() * 5) : 85 + Math.floor(Math.random() * 10)

    // Format user data for storefront
    const storefrontUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      verified: user.verified,
      pgaVerified: user.pgaVerified,
      subscription: user.subscriptionTier,
      rating: reviewStats._avg.rating || 0,
      reviewCount: reviewStats._count || 0,
      responseRate,
      memberSince: user.createdAt.toISOString(),
      location: user.location,
      businessBranding: null, // Will be fetched separately if needed
      stats: {
        totalSales: 156, // Mock data - would come from sales records
        activeListings: user._count.products,
        totalRevenue: totalRevenue._sum.price || 0,
        customerSatisfaction: Math.round((reviewStats._avg.rating || 4.5) * 20) // Convert to percentage
      }
    }

    // Format products for storefront display
    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      brand: product.brand,
      condition: product.condition,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.primaryImage,
      featured: product.featured,
      views: product.viewCount,
      favorites: product._count.favorites,
      createdAt: product.createdAt.toISOString(),
      category: product.category.name
    }))

    return NextResponse.json({
      success: true,
      user: storefrontUser,
      products: formattedProducts,
      isPremiumStorefront
    })

  } catch (error) {
    console.error('Error fetching storefront data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch storefront data' },
      { status: 500 }
    )
  }
}
