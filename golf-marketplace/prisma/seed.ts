import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create categories
  const categories = [
    {
      name: 'Drivers',
      slug: 'drivers',
      description: 'Golf drivers for maximum distance off the tee',
      icon: '🏌️'
    },
    {
      name: 'Fairway Woods',
      slug: 'fairway-woods',
      description: 'Fairway woods for long shots from the fairway',
      icon: '🌲'
    },
    {
      name: 'Hybrids',
      slug: 'hybrids',
      description: 'Hybrid clubs combining iron and wood characteristics',
      icon: '🔧'
    },
    {
      name: 'Irons',
      slug: 'irons',
      description: 'Iron sets for precision and control',
      icon: '🔧'
    },
    {
      name: 'Wedges',
      slug: 'wedges',
      description: 'Wedges for short game and bunker play',
      icon: '⛳'
    },
    {
      name: 'Putters',
      slug: 'putters',
      description: 'Putters for precision on the green',
      icon: '⛳'
    },
    {
      name: 'Golf Bags',
      slug: 'golf-bags',
      description: 'Golf bags and cart bags',
      icon: '🎒'
    },
    {
      name: 'Apparel',
      slug: 'apparel',
      description: 'Golf clothing and accessories',
      icon: '👕'
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Golf accessories and training aids',
      icon: '🧤'
    }
  ]

  console.log('Creating categories...')
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    })
  }

  // Create sample users
  const users = [
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      location: 'Surrey, UK',
      bio: 'Golf enthusiast with 20+ years experience. Love helping others find the perfect equipment.',
      verified: true,
      pgaVerified: false,
      subscription: 'pro',
      rating: 4.8,
      reviewCount: 45,
      responseRate: 94.5
    },
    {
      email: 'sarah.golf@example.com',
      name: 'Sarah Wilson',
      location: 'London, UK',
      bio: 'PGA Professional and golf instructor. Specializing in junior development.',
      verified: true,
      pgaVerified: true,
      subscription: 'pga-pro',
      rating: 4.9,
      reviewCount: 127,
      responseRate: 98.2
    },
    {
      email: 'mike.clubs@example.com',
      name: 'Mike Johnson',
      location: 'Manchester, UK',
      bio: 'Golf shop owner with extensive knowledge of club fitting and repair.',
      verified: true,
      pgaVerified: false,
      subscription: 'business',
      rating: 4.7,
      reviewCount: 89,
      responseRate: 91.8
    }
  ]

  console.log('Creating sample users...')
  const createdUsers = []
  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    })
    createdUsers.push(createdUser)
  }

  // Get category IDs
  const driversCategory = await prisma.category.findUnique({ where: { slug: 'drivers' } })
  const ironsCategory = await prisma.category.findUnique({ where: { slug: 'irons' } })
  const puttersCategory = await prisma.category.findUnique({ where: { slug: 'putters' } })
  const bagsCategory = await prisma.category.findUnique({ where: { slug: 'golf-bags' } })

  // Create sample products
  const products = [
    {
      title: 'TaylorMade SIM2 Driver - 10.5° Regular Flex',
      slug: 'taylormade-sim2-driver-10-5-regular',
      description: `This TaylorMade SIM2 Driver is in excellent condition with minimal use. Features the latest Speed Injected technology for maximum ball speed and forgiveness. The club has been well-maintained and comes with the original headcover and adjustment tool.

Key features:
• Speed Injected Technology
• Forged Ring Construction
• Asymmetric Inertia Generator
• Thru-Slot Speed Pocket
• Original grip in great condition

Perfect for golfers looking to add distance and accuracy to their drives. No dents, scratches are minimal and purely cosmetic.`,
      brand: 'TaylorMade',
      model: 'SIM2',
      condition: 'excellent',
      price: 240,
      originalPrice: 450,
      specifications: {
        loft: '10.5°',
        shaft: 'Aldila Rogue Silver 130 MSI',
        flex: 'Regular',
        grip: 'TaylorMade Lamkin Crossline',
        length: '45.5 inches',
        weight: '460cc',
        lie: '59°',
        material: 'Titanium',
        year: '2021'
      },
      images: [
        'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop'
      ],
      primaryImage: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop',
      status: 'active',
      featured: true,
      authenticatedBy: 'ClubUp Expert',
      views: 127,
      watchers: 8,
      sellerId: createdUsers[0].id,
      categoryId: driversCategory!.id
    },
    {
      title: 'Callaway Apex Iron Set 4-PW',
      slug: 'callaway-apex-iron-set-4-pw',
      description: `Callaway Apex Iron Set in very good condition. These forged irons offer exceptional feel and workability for the skilled golfer.

Included:
• 4-PW (7 clubs total)
• All clubs have matching True Temper Dynamic Gold shafts
• Golf Pride grips in good condition
• Minor wear on faces consistent with normal use

Great for low to mid handicap golfers who appreciate the feel of forged irons.`,
      brand: 'Callaway',
      model: 'Apex',
      condition: 'very-good',
      price: 480,
      originalPrice: 899,
      specifications: {
        set: '4-PW',
        shaft: 'True Temper Dynamic Gold',
        flex: 'Stiff',
        grip: 'Golf Pride Tour Velvet',
        construction: 'Forged',
        year: '2020'
      },
      images: [
        'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop'
      ],
      primaryImage: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop',
      status: 'active',
      featured: false,
      views: 89,
      watchers: 12,
      sellerId: createdUsers[1].id,
      categoryId: ironsCategory!.id
    },
    {
      title: 'Scotty Cameron Newport 2 Putter',
      slug: 'scotty-cameron-newport-2-putter',
      description: `Scotty Cameron Newport 2 Putter in excellent condition. This is the legendary putter used by many Tour professionals.

Details:
• 34 inch length
• Right-handed
• Original grip in perfect condition
• Minimal wear on face
• Comes with original headcover
• Certificate of authenticity included

Perfect for golfers who demand precision and craftsmanship in their putting.`,
      brand: 'Titleist',
      model: 'Scotty Cameron Newport 2',
      condition: 'excellent',
      price: 360,
      originalPrice: 450,
      specifications: {
        length: '34 inches',
        hand: 'Right',
        grip: 'Scotty Cameron Pistol',
        weight: '350g',
        milling: 'Face Mill',
        year: '2022'
      },
      images: [
        'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=600&fit=crop'
      ],
      primaryImage: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=600&fit=crop',
      status: 'active',
      featured: true,
      authenticatedBy: 'ClubUp Expert',
      views: 156,
      watchers: 15,
      sellerId: createdUsers[2].id,
      categoryId: puttersCategory!.id
    },
    {
      title: 'Sun Mountain C-130 Cart Bag',
      slug: 'sun-mountain-c130-cart-bag',
      description: `Sun Mountain C-130 Cart Bag in excellent condition. Perfect for golfers who prefer to ride or use a push cart.

Features:
• 14-way full length dividers
• 9 pockets including large apparel pocket
• Cart strap pass-through
• Umbrella holder
• Towel ring
• Rain hood included

Barely used, looks almost new. Great value for a premium cart bag.`,
      brand: 'Sun Mountain',
      model: 'C-130',
      condition: 'excellent',
      price: 145,
      originalPrice: 250,
      specifications: {
        dividers: '14-way full length',
        pockets: '9 total',
        weight: '5.5 lbs',
        type: 'Cart Bag',
        year: '2023'
      },
      images: [
        'https://images.unsplash.com/photo-1551888026-e670c70b9cb1?w=800&h=600&fit=crop'
      ],
      primaryImage: 'https://images.unsplash.com/photo-1551888026-e670c70b9cb1?w=800&h=600&fit=crop',
      status: 'active',
      featured: false,
      views: 67,
      watchers: 5,
      sellerId: createdUsers[0].id,
      categoryId: bagsCategory!.id
    }
  ]

  console.log('Creating sample products...')
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product
    })
  }

  console.log('✅ Database seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
