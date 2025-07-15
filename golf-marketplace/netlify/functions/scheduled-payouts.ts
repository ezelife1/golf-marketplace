export async function handler(event: any, context: any) {
  try {
    console.log('🔄 Netlify scheduled function: Processing payouts...')

    // Get the site URL from environment or construct it
    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:3000'
    const cronSecret = process.env.CRON_SECRET || 'dev-secret'

    // Call our internal API endpoint
    const response = await fetch(`${siteUrl}/api/cron/payouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`API call failed: ${result.error || 'Unknown error'}`)
    }

    console.log('✅ Scheduled payouts processed:', result)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Scheduled payouts processed successfully',
        timestamp: new Date().toISOString(),
        ...result
      })
    }

  } catch (error: any) {
    console.error('❌ Netlify scheduled function error:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Scheduled payout processing failed',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
}
