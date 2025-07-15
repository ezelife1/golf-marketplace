import { NextRequest, NextResponse } from 'next/server'
import { processScheduledPayouts } from '@/lib/payment-hold'

// This endpoint processes scheduled payouts (to be called by cron job)
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Processing scheduled payouts...')

    const result = await processScheduledPayouts()

    console.log('✅ Scheduled payout processing completed:', result)

    return NextResponse.json({
      success: true,
      message: 'Scheduled payouts processed successfully',
      ...result
    })

  } catch (error: any) {
    console.error('❌ Error processing scheduled payouts:', error)

    return NextResponse.json(
      {
        error: 'Failed to process scheduled payouts',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Also allow GET for testing/manual triggering
export async function GET(request: NextRequest) {
  try {
    // In development, allow GET without auth for testing
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Method not allowed in production' }, { status: 405 })
    }

    console.log('🔄 [DEV] Manually processing scheduled payouts...')

    const result = await processScheduledPayouts()

    console.log('✅ [DEV] Manual payout processing completed:', result)

    return NextResponse.json({
      success: true,
      message: 'Scheduled payouts processed successfully (dev mode)',
      ...result
    })

  } catch (error: any) {
    console.error('❌ [DEV] Error processing scheduled payouts:', error)

    return NextResponse.json(
      {
        error: 'Failed to process scheduled payouts',
        details: error.message
      },
      { status: 500 }
    )
  }
}
