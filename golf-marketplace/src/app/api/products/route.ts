import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

// Interfaces for type safety
interface Seller {
  id: string
  name: string
  verified: boolean
  rating?: number
  reviewCount?: number
  location?: string
  subscriptionTier?: string
  pgaVerified?: boolean
}

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductCount {
  reviews: number
  favorites: number
}

interface Product {
  id: string
  title: string
  description: string
  category: Category
  brand: string
  condition: string
  price: number
  originalPrice?: number
  negotiable: boolean
  primaryImage: string
  images: string[]
  specifications: Record<string, any>
  shipping: Record<string, any>
  location: string
  tags: string[]
  featured: boolean
  createdAt: Date
  updatedAt: Date
  seller: Seller
  status: string
  viewCount: number
  _count: ProductCount
}

interface ProductForPriority {
  seller: {
    subscriptionTier?: string
    pgaVerified?: boolean
    rating?: number
  }
  featured: boolean
  viewCount: number
  _count: { favorites: number }
  createdAt: Date
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const condition = searchParams.get('condition')
    const brand = searchParams.get('brand')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'priority' // Changed default to priority
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause for filtering
    const where: {
      status: string
      category?: { slug: string }
      condition?: string
      brand?: string
      price?: { gte?: number; lte?: number }
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
        brand?: { contains: string; mode: 'insensitive' }
      }>
    } = {
      status: 'active' // Only show active listings
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (condition) {
      where.condition = condition
    }

    if (brand) {
      where.brand = brand
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get products with seller subscription information for priority sorting
    const products = await db.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            verified: true,
            rating: true,
            reviewCount: true,
            location: true,
            subscriptionTier: true, // Include subscription tier for priority
            pgaVerified: true
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
        }
      },
      // Remove orderBy here - we'll sort after fetching to implement priority
      take: limit * 3, // Get more records to ensure we have enough after priority sorting
      skip: offset
    })

    // Function to calculate priority score
    const getPriorityScore = (product: ProductForPriority): number => {
      let score = 0

      // Subscription tier priority (highest priority)
      const subscriptionTier = product.seller.subscriptionTier || 'free'
      switch (subscriptionTier) {
        case 'pga-pro':
          score += 1000
          break
        case 'business':
          score += 800
          break
        case 'pro':
          score += 600
          break
        case 'free':
        default:
          score += 0
          break
      }

      // PGA verification bonus
      if (product.seller.pgaVerified) {
        score += 200
      }

      // Featured listing bonus
      if (product.featured) {
        score += 150
      }

      // Seller rating bonus (0-100 points)
      if (product.seller.rating) {
        score += product.seller.rating * 20
      }

      // View count bonus (diminishing returns)
      score += Math.min(product.viewCount * 0.1, 50)

      // Favorites bonus
      score += product._count.favorites * 2

      // Recency bonus (newer listings get slight boost)
      const daysSinceCreated = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceCreated < 7) {
        score += (7 - daysSinceCreated) * 10
      }

      return score
    }

    // Sort products by priority and then by selected sort method
    let sortedProducts = [...products]

    if (sort === 'priority' || sort === 'newest') {
      // Priority sort: subscription tier first, then by creation date
      sortedProducts.sort((a, b) => {
        const scoreA = getPriorityScore(a)
        const scoreB = getPriorityScore(b)

        if (scoreA !== scoreB) {
          return scoreB - scoreA // Higher score first
        }

        // If priority scores are equal, sort by creation date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    } else {
      // For other sorts, still apply priority but with secondary sorting
      sortedProducts.sort((a, b) => {
        const tierA = a.seller.subscriptionTier || 'free'
        const tierB = b.seller.subscriptionTier || 'free'

        // Group by subscription tier first
        const tierPriority = { 'pga-pro': 4, 'business': 3, 'pro': 2, 'free': 1 }
        const priorityA = tierPriority[tierA as keyof typeof tierPriority] || 1
        const priorityB = tierPriority[tierB as keyof typeof tierPriority] || 1

        if (priorityA !== priorityB) {
          return priorityB - priorityA // Higher tier first
        }

        // Within same tier, apply selected sort
        switch (sort) {
          case 'price_low':
            return a.price - b.price
          case 'price_high':
            return b.price - a.price
          case 'views':
            return b.viewCount - a.viewCount
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
      })
    }

    // Take only the requested number of products after sorting
    const finalProducts = sortedProducts.slice(0, limit)

    // Get total count for pagination
    const totalCount = await db.product.count({ where })

    // Transform products for response
    const transformedProducts = finalProducts.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category.name,
      brand: product.brand,
      condition: product.condition,
      price: product.price,
      originalPrice: product.originalPrice,
      negotiable: product.negotiable,
      primaryImage: product.primaryImage,
      images: product.images,
      specifications: product.specifications,
      shipping: product.shipping,
      location: product.location,
      tags: product.tags,
      featured: product.featured,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      seller: {
        ...product.seller,
        // Add priority indicator for UI
        hasPriority: ['pro', 'business', 'pga-pro'].includes(product.seller.subscriptionTier || 'free')
      },
      stats: {
        views: product.viewCount,
        favorites: product._count.favorites,
        reviews: product._count.reviews
      },
      // Add priority score for debugging/UI
      priorityScore: getPriorityScore(product)
    }))

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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
      title,
      description,
      category,
      brand,
      condition,
      price,
      originalPrice,
      negotiable,
      imageUrls,
      specifications,
      shipping,
      location,
      tags
    } = await request.json()

    // Validate required fields
    if (!title || !description || !category || !brand || !condition || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
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

    // Find or create category
    let categoryRecord = await db.category.findFirst({
      where: {
        OR: [
          { name: category },
          { slug: category.toLowerCase().replace(/\s+/g, '-') }
        ]
      }
    })

    if (!categoryRecord) {
      categoryRecord = await db.category.create({
        data: {
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, '-'),
          description: `${category} golf equipment`
        }
      })
    }

    // Generate unique slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    let slug = baseSlug
    let counter = 1

    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create the product
    const product = await db.product.create({
      data: {
        title,
        slug,
        description,
        brand: brand || null,
        condition,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        negotiable: negotiable || false,
        primaryImage: imageUrls[0],
        images: imageUrls,
        specifications: specifications || {},
        shipping: shipping || { included: true, methods: ['Royal Mail'] },
        location: location || '',
        tags: tags || [],
        status: 'active',
        sellerId: user.id,
        categoryId: categoryRecord.id,
        featured: false,
        viewCount: 0
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            verified: true,
            rating: true,
            reviewCount: true,
            location: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    // Create activity log entry
    await db.activity.create({
      data: {
        userId: user.id,
        type: 'product_created',
        description: `Created listing: ${title}`,
        metadata: {
          productId: product.id,
          category: categoryRecord.name,
          price: parseFloat(price)
        }
      }
    })

    return NextResponse.json({
      message: 'Product created successfully',
      product: {
        id: product.id,
        title: product.title,
        category: product.category.name,
        price: product.price,
        primaryImage: product.primaryImage,
        seller: product.seller,
        createdAt: product.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product listing' },
      { status: 500 }
    )
  }
}

// Update product (for sellers to edit their listings)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, ...updateData } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
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

    // Check if user owns the product
    const existingProduct = await db.product.findFirst({
      where: {
        id: productId,
        sellerId: user.id
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the product
    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            verified: true,
            rating: true,
            reviewCount: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    // Log the update
    await db.activity.create({
      data: {
        userId: user.id,
        type: 'product_updated',
        description: `Updated listing: ${updatedProduct.title}`,
        metadata: {
          productId: updatedProduct.id,
          changes: Object.keys(updateData)
        }
      }
    })

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct
    })

  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// Delete product (for sellers to remove their listings)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
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

    // Check if user owns the product
    const existingProduct = await db.product.findFirst({
      where: {
        id: productId,
        sellerId: user.id
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      )
    }

    // Soft delete the product (change status instead of actual deletion)
    await db.product.update({
      where: { id: productId },
      data: {
        status: 'deleted',
        updatedAt: new Date()
      }
    })

    // Log the deletion
    await db.activity.create({
      data: {
        userId: user.id,
        type: 'product_deleted',
        description: `Deleted listing: ${existingProduct.title}`,
        metadata: {
          productId: existingProduct.id
        }
      }
    })

    return NextResponse.json({
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
