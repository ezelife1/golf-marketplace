import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reviewType = searchParams.get('type') // 'product' | 'seller' | 'all'
    const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : null
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    // Filter by review type
    if (reviewType && reviewType !== 'all') {
      where.reviewType = reviewType
    }

    // Filter by rating
    if (rating !== null) {
      where.rating = { gte: rating }
    }

    // Search in comment
    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Get reviews with related data
    const reviews = await db.review.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            verified: true
          }
        },
        targetUser: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            primaryImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Get review statistics
    const totalReviews = await db.review.count({ where })

    const ratingCounts = await db.review.groupBy({
      by: ['rating'],
      where,
      _count: {
        rating: true
      }
    })

    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }

    ratingCounts.forEach(item => {
      ratingBreakdown[item.rating as keyof typeof ratingBreakdown] = item._count.rating
    })

    const averageRating = await db.review.aggregate({
      where,
      _avg: {
        rating: true
      }
    })

    const stats = {
      averageRating: averageRating._avg.rating || 0,
      totalReviews,
      ratingBreakdown
    }

    return NextResponse.json({
      reviews,
      stats,
      pagination: {
        limit,
        offset,
        total: totalReviews,
        hasMore: offset + limit < totalReviews
      }
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      rating,
      comment,
      reviewType,
      targetUserId,
      productId
    } = await request.json()

    if (!rating || !comment || !reviewType) {
      return NextResponse.json(
        { error: 'Rating, comment, and review type are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get current user
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate review type requirements
    if (reviewType === 'seller' && !targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required for seller reviews' },
        { status: 400 }
      )
    }

    if (reviewType === 'product' && !productId) {
      return NextResponse.json(
        { error: 'Product ID is required for product reviews' },
        { status: 400 }
      )
    }

    // Check if target user exists (for seller reviews)
    if (targetUserId) {
      const targetUser = await db.user.findUnique({
        where: { id: targetUserId }
      })

      if (!targetUser) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
      }

      // Prevent self-review
      if (targetUserId === user.id) {
        return NextResponse.json(
          { error: 'You cannot review yourself' },
          { status: 400 }
        )
      }
    }

    // Check if product exists (for product reviews)
    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
    }

    // Create the review
    const review = await db.review.create({
      data: {
        rating,
        comment,
        reviewType,
        authorId: user.id,
        targetUserId: targetUserId || null,
        productId: productId || null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            verified: true
          }
        },
        targetUser: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
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

    // Update target user's rating (for seller reviews)
    if (targetUserId) {
      const userReviews = await db.review.findMany({
        where: {
          targetUserId,
          reviewType: 'seller'
        }
      })

      const averageRating = userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length
      const reviewCount = userReviews.length

      await db.user.update({
        where: { id: targetUserId },
        data: {
          rating: averageRating,
          reviewCount
        }
      })
    }

    return NextResponse.json({ review })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
