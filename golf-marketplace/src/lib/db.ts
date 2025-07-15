import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Create database connection with error handling
let db: PrismaClient | null = null

try {
  db = globalThis.prisma || new PrismaClient({ log: ['query'] })
  if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
} catch (error) {
  console.warn('Database connection failed, using mock data:', error)
  db = null
}

// Type definitions for better TypeScript support
export type User = {
  id: string
  email: string
  name: string | null
  image: string | null
  phone: string | null
  location: string | null
  bio: string | null
  verified: boolean
  pgaVerified: boolean
  subscription: string
  stripeCustomerId: string | null
  rating: number | null
  reviewCount: number
  responseRate: number | null
  memberSince: Date
  createdAt: Date
  updatedAt: Date
}

export type Product = {
  id: string
  title: string
  slug: string
  description: string
  brand: string
  model: string | null
  condition: string
  price: number
  originalPrice: number | null
  specifications: any
  images: any
  primaryImage: string | null
  status: string
  featured: boolean
  authenticatedBy: string | null
  views: number
  watchers: number
  bumpCount: number
  lastBumpedAt: Date | null
  sellerId: string
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  image: string | null
  parentId: string | null
  createdAt: Date
  updatedAt: Date
}

// Mock data for when database is not available
const mockProduct = {
  id: "demo-product-1",
  title: "TaylorMade SIM2 Driver",
  slug: "taylormade-sim2-driver",
  brand: "TaylorMade",
  model: null,
  condition: "Excellent",
  price: 240,
  originalPrice: 450,
  description: "Professional golf driver in excellent condition",
  specifications: {},
  images: ["https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop"],
  primaryImage: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop",
  status: "active",
  featured: true,
  authenticatedBy: "ClubUp Expert",
  views: 127,
  watchers: 8,
  bumpCount: 0,
  lastBumpedAt: null,
  sellerId: "demo-seller",
  categoryId: "demo-category",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  category: { name: "Drivers", slug: "drivers" },
  seller: {
    id: "demo-seller",
    name: "Demo Seller",
    image: null,
    location: "UK",
    verified: true,
    pgaVerified: false,
    subscription: "pro",
    rating: 4.8,
    reviewCount: 45,
    responseRate: null,
    memberSince: new Date("2023-01-01"),
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  },
  reviews: [],
}

// Helper functions for common database operations with fallbacks

export async function getUserByEmail(email: string) {
  if (!db) {
    return null
  }
  try {
    return await db.user.findUnique({
      where: { email },
      include: {
        products: {
          where: { status: 'active' },
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        receivedReviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: { name: true, image: true }
            }
          }
        }
      }
    })
  } catch (error) {
    console.warn('Database query failed:', error)
    return null
  }
}

export async function getProductById(id: string) {
  if (!db) {
    return mockProduct
  }
  try {
    return await db.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            location: true,
            verified: true,
            pgaVerified: true,
            subscription: true,
            rating: true,
            reviewCount: true,
            responseRate: true,
            memberSince: true
          }
        },
        category: true,
        reviews: {
          include: {
            author: {
              select: { name: true, image: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  } catch (error) {
    console.warn('Database query failed, returning mock data:', error)
    return mockProduct
  }
}

export async function getProductBySlug(slug: string) {
  if (!db) {
    return mockProduct
  }
  try {
    return await db.product.findUnique({
      where: { slug },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            location: true,
            verified: true,
            pgaVerified: true,
            subscription: true,
            rating: true,
            reviewCount: true,
            responseRate: true,
            memberSince: true
          }
        },
        category: true,
        reviews: {
          include: {
            author: {
              select: { name: true, image: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  } catch (error) {
    console.warn('Database query failed, returning mock data:', error)
    return mockProduct
  }
}

export async function getProducts(params: {
  category?: string
  search?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  limit?: number
  offset?: number
}) {
  if (!db) {
    return [mockProduct]
  }
  const {
    category,
    search,
    condition,
    minPrice,
    maxPrice,
    featured,
    limit = 20,
    offset = 0
  } = params

  const where: any = {
    status: 'active'
  }

  if (category) {
    where.category = {
      slug: category
    }
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (condition) {
    where.condition = condition
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) where.price.gte = minPrice
    if (maxPrice !== undefined) where.price.lte = maxPrice
  }

  if (featured) {
    where.featured = true
  }

  try {
    return await db.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            verified: true,
            subscription: true,
            rating: true
          }
        },
        category: true
      },
      orderBy: [
        { featured: 'desc' },
        { lastBumpedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })
  } catch (error) {
    console.warn('Database query failed, returning mock data:', error)
    return [mockProduct]
  }
}

export async function getCategories() {
  if (!db) {
    return [
      {
        id: "demo-category",
        name: "Drivers",
        slug: "drivers",
        description: "Golf drivers",
        icon: null,
        image: null,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { products: 1 }
      }
    ]
  }
  try {
    return await db.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.warn('Database query failed, returning mock data:', error)
    return [
      {
        id: "demo-category",
        name: "Drivers",
        slug: "drivers",
        description: "Golf drivers",
        icon: null,
        image: null,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { products: 1 }
      }
    ]
  }
}

export async function getUserCart(userId: string) {
  if (!db) {
    return []
  }
  try {
    return await db.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            seller: {
              select: { name: true, verified: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.warn('Database query failed:', error)
    return []
  }
}

export async function addToCart(userId: string, productId: string, quantity: number = 1) {
  if (!db) {
    return null
  }
  try {
    return await db.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      update: {
        quantity: {
          increment: quantity
        }
      },
      create: {
        userId,
        productId,
        quantity
      }
    })
  } catch (error) {
    console.warn('Database query failed:', error)
    return null
  }
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
  if (!db) {
    return null
  }
  try {
    if (quantity <= 0) {
      return await db.cartItem.delete({
        where: {
          userId_productId: {
            userId,
            productId
          }
        }
      })
    }

    return await db.cartItem.update({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      data: { quantity }
    })
  } catch (error) {
    console.warn('Database query failed:', error)
    return null
  }
}

export async function clearUserCart(userId: string) {
  if (!db) {
    return null
  }
  try {
    return await db.cartItem.deleteMany({
      where: { userId }
    })
  } catch (error) {
    console.warn('Database query failed:', error)
    return null
  }
}

export async function incrementProductViews(productId: string) {
  if (!db) {
    return
  }
  try {
    await db.product.update({
      where: { id: productId },
      data: {
        views: {
          increment: 1
        }
      }
    })
  } catch (error) {
    console.warn('Failed to increment views:', error)
  }
}

export { db }
export default db
