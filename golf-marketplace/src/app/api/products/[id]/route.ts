import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Fetch product from database with all related data
    const product = await db.product.findFirst({
      where: {
        id: id,
        status: 'active' // Only return active products
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            verified: true,
            rating: true,
            reviewCount: true,
            location: true,
            subscriptionTier: true,
            pgaVerified: true,
            memberSince: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            reviews: true,
            favorites: true
          }
        },
        // reviews: {
        //   take: 5,
        //   orderBy: {
        //     createdAt: 'desc'
        //   },
        //   include: {
        //     user: {
        //       select: {
        //         name: true,
        //         verified: true
        //       }
        //     }
        //   }
        // }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Increment view count
    await db.product.update({
      where: { id: id },
      data: { viewCount: { increment: 1 } }
    })

    // Transform the data for frontend consumption
    const transformedProduct = {
      id: product.id,
      title: product.title,
      description: product.description,
      brand: product.brand,
      model: product.model || '',
      category: (product.category as any)?.name || 'Golf Equipment',
      condition: product.condition,
      price: product.price,
      originalPrice: product.originalPrice,
      negotiable: product.negotiable,
      images: (product.images as string[]) || [],
      primaryImage: product.primaryImage,
      specifications: product.specifications,
      shipping: product.shipping,
      location: product.location,
      tags: (product.tags as string[]) || [],
      featured: product.featured,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      seller: {
        id: (product.seller as any)?.id || '',
        name: (product.seller as any)?.name || 'Unknown Seller',
        rating: (product.seller as any)?.rating || 4.5,
        reviewCount: (product.seller as any)?.reviewCount || 0,
        location: (product.seller as any)?.location || 'UK',
        memberSince: (product.seller as any)?.memberSince || new Date().getFullYear().toString(),
        verified: (product.seller as any)?.verified || false,
        subscription: (product.seller as any)?.subscriptionTier || 'free',
        pgaVerified: (product.seller as any)?.pgaVerified || false
      },
      views: product.viewCount,
      watchers: (product._count as any)?.favorites || 0,
      reviews: [], // Will implement reviews later
      stats: {
        views: product.viewCount,
        favorites: (product._count as any)?.favorites || 0,
        reviews: (product._count as any)?.reviews || 0
      },
      isFeatured: product.featured,
      authenticatedBy: (product.seller as any)?.pgaVerified ? 'PGA Professional' : 'ClubUp Expert'
    }

    return NextResponse.json({ product: transformedProduct })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
