import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

interface BrandingData {
  businessName: string
  tagline?: string
  description?: string
  website?: string
  logoUrl?: string
  bannerUrl?: string
  brandColors: {
    primary: string
    secondary: string
    accent: string
  }
  phone?: string
  email?: string
  address?: {
    street?: string
    city?: string
    postcode?: string
    country?: string
  }
  socialLinks: {
    facebook: string
    instagram: string
    twitter: string
    linkedin: string
    youtube: string
  }
  showContactInfo: boolean
  showSocialLinks: boolean
  customDomain?: string
}

const DEFAULT_BRANDING: BrandingData = {
  businessName: "",
  brandColors: {
    primary: "#16a085",
    secondary: "#2c3e50",
    accent: "#f39c12"
  },
  socialLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: ""
  },
  showContactInfo: true,
  showSocialLinks: true
}

// GET - Fetch user's branding data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        businessBranding: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has access to branding features
    const hasAccess = user.subscriptionTier &&
      ['business', 'pga-pro'].includes(user.subscriptionTier)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Business+ subscription required for branding features' },
        { status: 403 }
      )
    }

    // Return existing branding or default values
    const branding = user.businessBranding || {
      ...DEFAULT_BRANDING,
      userId: user.id,
      businessName: user.name || ""
    }

    return NextResponse.json({
      success: true,
      branding
    })

  } catch (error) {
    console.error('Error fetching branding:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branding data' },
      { status: 500 }
    )
  }
}

// POST - Create or update branding data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brandingData: BrandingData = await request.json()

    // Validate required fields
    if (!brandingData.businessName?.trim()) {
      return NextResponse.json(
        { error: 'Business name is required' },
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

    // Check if user has access to branding features
    const hasAccess = user.subscriptionTier &&
      ['business', 'pga-pro'].includes(user.subscriptionTier)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Business+ subscription required for branding features' },
        { status: 403 }
      )
    }

    // Validate color format (basic hex validation)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (!hexColorRegex.test(brandingData.brandColors.primary) ||
        !hexColorRegex.test(brandingData.brandColors.secondary) ||
        !hexColorRegex.test(brandingData.brandColors.accent)) {
      return NextResponse.json(
        { error: 'Invalid color format. Please use hex colors (e.g., #16a085)' },
        { status: 400 }
      )
    }

    // Validate URLs if provided
    const urlFields = [
      brandingData.website,
      brandingData.logoUrl,
      brandingData.bannerUrl,
      brandingData.socialLinks.facebook,
      brandingData.socialLinks.instagram,
      brandingData.socialLinks.twitter,
      brandingData.socialLinks.linkedin,
      brandingData.socialLinks.youtube
    ].filter(Boolean)

    for (const url of urlFields) {
      try {
        if (url && url.trim()) {
          new URL(url)
        }
      } catch {
        return NextResponse.json(
          { error: `Invalid URL format: ${url}` },
          { status: 400 }
        )
      }
    }

    // Create or update branding data
    const branding = await db.businessBranding.upsert({
      where: { userId: user.id },
      update: {
        businessName: brandingData.businessName.trim(),
        tagline: brandingData.tagline?.trim() || null,
        description: brandingData.description?.trim() || null,
        website: brandingData.website?.trim() || null,
        logoUrl: brandingData.logoUrl?.trim() || null,
        bannerUrl: brandingData.bannerUrl?.trim() || null,
        brandColors: brandingData.brandColors,
        phone: brandingData.phone?.trim() || null,
        email: brandingData.email?.trim() || null,
        address: brandingData.address || null,
        socialLinks: brandingData.socialLinks,
        showContactInfo: brandingData.showContactInfo,
        showSocialLinks: brandingData.showSocialLinks,
        customDomain: brandingData.customDomain?.trim() || null,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        businessName: brandingData.businessName.trim(),
        tagline: brandingData.tagline?.trim() || null,
        description: brandingData.description?.trim() || null,
        website: brandingData.website?.trim() || null,
        logoUrl: brandingData.logoUrl?.trim() || null,
        bannerUrl: brandingData.bannerUrl?.trim() || null,
        brandColors: brandingData.brandColors,
        phone: brandingData.phone?.trim() || null,
        email: brandingData.email?.trim() || null,
        address: brandingData.address || null,
        socialLinks: brandingData.socialLinks,
        showContactInfo: brandingData.showContactInfo,
        showSocialLinks: brandingData.showSocialLinks,
        customDomain: brandingData.customDomain?.trim() || null
      }
    })

    // Log the activity
    await db.activity.create({
      data: {
        userId: user.id,
        type: 'branding_updated',
        description: `Updated business branding for ${brandingData.businessName}`,
        metadata: {
          businessName: brandingData.businessName,
          hasCustomDomain: !!brandingData.customDomain,
          hasLogo: !!brandingData.logoUrl,
          hasBanner: !!brandingData.bannerUrl
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Branding updated successfully',
      branding
    })

  } catch (error) {
    console.error('Error updating branding:', error)
    return NextResponse.json(
      { error: 'Failed to update branding data' },
      { status: 500 }
    )
  }
}

// DELETE - Reset branding to defaults
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has access to branding features
    const hasAccess = user.subscriptionTier &&
      ['business', 'pga-pro'].includes(user.subscriptionTier)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Business+ subscription required for branding features' },
        { status: 403 }
      )
    }

    // Delete existing branding data
    await db.businessBranding.deleteMany({
      where: { userId: user.id }
    })

    // Log the activity
    await db.activity.create({
      data: {
        userId: user.id,
        type: 'branding_reset',
        description: 'Reset business branding to defaults',
        metadata: {}
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Branding reset to defaults successfully'
    })

  } catch (error) {
    console.error('Error resetting branding:', error)
    return NextResponse.json(
      { error: 'Failed to reset branding data' },
      { status: 500 }
    )
  }
}
