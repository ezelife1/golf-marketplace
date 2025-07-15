import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 images allowed' }, { status: 400 })
    }

    const uploadPromises = files.map(async (file) => {
      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Upload to Cloudinary
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'clubup-golf', // Organize uploads in folder
            transformation: [
              { width: 1200, height: 800, crop: 'limit', quality: 'auto', format: 'webp' },
              { flags: 'progressive' }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })
    })

    const uploadResults = await Promise.all(uploadPromises)

    // Extract URLs from upload results
    const imageUrls = uploadResults.map((result: any) => result.secure_url)

    console.log(`✅ Uploaded ${imageUrls.length} images for user ${session.user.email}`)

    return NextResponse.json({
      success: true,
      imageUrls,
      message: `${imageUrls.length} images uploaded successfully`
    })

  } catch (error: any) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload images',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check upload status
export async function GET() {
  return NextResponse.json({
    message: 'Image upload endpoint ready',
    maxImages: 10,
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    cloudinary: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
    }
  })
}
