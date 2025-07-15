import { db } from '@/lib/db'

// Email notification system for payout processing
// In a real application, this would integrate with an email service like SendGrid, Resend, or AWS SES

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Mock email sending function - replace with real email service
async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // In development, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 EMAIL NOTIFICATION:')
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`HTML Preview: ${html.substring(0, 200)}...`)
      return { success: true, messageId: `mock_${Date.now()}` }
    }

    // In production, integrate with your email service
    // Example with Resend or SendGrid:
    /*
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'ClubUp <noreply@clubup.golf>',
        to,
        subject,
        html,
        text
      })
    })
    */

    return { success: true, messageId: `mock_${Date.now()}` }
  } catch (error: any) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}

// Notify seller when automatic payout is processed
export async function notifySellerPayoutProcessed({
  sellerId,
  sellerEmail,
  sellerName,
  transactionId,
  productTitle,
  netAmount,
  payoutMethod,
  transferId
}: {
  sellerId: string
  sellerEmail: string
  sellerName: string
  transactionId: string
  productTitle: string
  netAmount: number
  payoutMethod: 'stripe' | 'paypal'
  transferId?: string
}) {
  try {
    const subject = '✅ Payout Processed - ClubUp Sale'

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">💰 Payout Processed</h1>
        </div>

        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #059669; margin-top: 0;">Hi ${sellerName || 'Seller'},</h2>

          <p style="font-size: 16px; line-height: 1.6;">
            Great news! Your payout has been successfully processed for the sale of your item.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Transaction Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Product:</td>
                <td style="padding: 8px 0;">${productTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Payout Amount:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: bold;">£${netAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
                <td style="padding: 8px 0;">${payoutMethod === 'stripe' ? 'Bank Account (Stripe)' : 'PayPal'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td>
                <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${transactionId}</td>
              </tr>
              ${transferId ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Transfer ID:</td>
                <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${transferId}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #0369a1;">
              <strong>💡 What happens next?</strong><br>
              ${payoutMethod === 'stripe'
                ? 'Funds will appear in your bank account within 1-2 business days.'
                : 'Funds have been sent to your PayPal account and should be available immediately.'
              }
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/seller"
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Payout History
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            Thank you for selling on ClubUp!<br>
            <a href="${process.env.NEXTAUTH_URL}" style="color: #059669;">Continue selling →</a>
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This is an automated notification from ClubUp.<br>
          If you have questions, contact us at <a href="mailto:support@clubup.golf" style="color: #059669;">support@clubup.golf</a></p>
        </div>
      </div>
    `

    const text = `
Payout Processed - ClubUp Sale

Hi ${sellerName || 'Seller'},

Your payout has been successfully processed for: ${productTitle}

Payout Amount: £${netAmount.toFixed(2)}
Payment Method: ${payoutMethod === 'stripe' ? 'Bank Account (Stripe)' : 'PayPal'}
Transaction ID: ${transactionId}

Funds will be available within 1-2 business days.

View your payout history: ${process.env.NEXTAUTH_URL}/dashboard/seller

Thank you for selling on ClubUp!
    `

    const result = await sendEmail({
      to: sellerEmail,
      subject,
      html,
      text
    })

    // Log the notification
    if (db) {
      await db.activity.create({
        data: {
          userId: sellerId,
          type: 'payout_email_sent',
          description: `Payout notification email sent for transaction ${transactionId}`,
          metadata: {
            transactionId,
            emailTo: sellerEmail,
            netAmount,
            payoutMethod,
            emailSuccess: result.success,
            messageId: result.messageId
          }
        }
      })
    }

    return result
  } catch (error: any) {
    console.error('Error sending seller payout notification:', error)
    return { success: false, error: error.message }
  }
}

// Notify buyer when seller receives payout (for transparency)
export async function notifyBuyerPayoutCompleted({
  buyerEmail,
  buyerName,
  transactionId,
  productTitle,
  sellerName,
  payoutDate
}: {
  buyerEmail: string
  buyerName?: string
  transactionId: string
  productTitle: string
  sellerName: string
  payoutDate: Date
}) {
  try {
    const subject = '✅ Transaction Complete - ClubUp Purchase'

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✅ Transaction Complete</h1>
        </div>

        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #059669; margin-top: 0;">Hi ${buyerName || 'there'},</h2>

          <p style="font-size: 16px; line-height: 1.6;">
            Your ClubUp transaction has been completed successfully. The seller has received payment for your purchase.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Purchase Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Product:</td>
                <td style="padding: 8px 0;">${productTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Seller:</td>
                <td style="padding: 8px 0;">${sellerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td>
                <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${transactionId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Completed:</td>
                <td style="padding: 8px 0;">${payoutDate.toLocaleDateString()}</td>
              </tr>
            </table>
          </div>

          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #0369a1;">
              <strong>🛡️ ClubUp Buyer Protection</strong><br>
              Your payment was held securely until you confirmed delivery. Transaction now complete!
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/reviews/create?transaction=${transactionId}"
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Leave a Review
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            Thank you for shopping on ClubUp!<br>
            <a href="${process.env.NEXTAUTH_URL}" style="color: #059669;">Browse more golf equipment →</a>
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This is an automated notification from ClubUp.<br>
          If you have questions, contact us at <a href="mailto:support@clubup.golf" style="color: #059669;">support@clubup.golf</a></p>
        </div>
      </div>
    `

    const text = `
Transaction Complete - ClubUp Purchase

Hi ${buyerName || 'there'},

Your ClubUp transaction has been completed. The seller has received payment for your purchase of: ${productTitle}

Seller: ${sellerName}
Transaction ID: ${transactionId}
Completed: ${payoutDate.toLocaleDateString()}

Thank you for shopping on ClubUp!
    `

    const result = await sendEmail({
      to: buyerEmail,
      subject,
      html,
      text
    })

    return result
  } catch (error: any) {
    console.error('Error sending buyer completion notification:', error)
    return { success: false, error: error.message }
  }
}

// Notify seller when payout fails and manual intervention is needed
export async function notifySellerPayoutFailed({
  sellerId,
  sellerEmail,
  sellerName,
  transactionId,
  productTitle,
  attemptedAmount,
  payoutMethod,
  errorMessage
}: {
  sellerId: string
  sellerEmail: string
  sellerName: string
  transactionId: string
  productTitle: string
  attemptedAmount: number
  payoutMethod: 'stripe' | 'paypal'
  errorMessage: string
}) {
  try {
    const subject = '⚠️ Payout Issue - Action Required'

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">⚠️ Payout Issue</h1>
        </div>

        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #dc2626; margin-top: 0;">Hi ${sellerName || 'Seller'},</h2>

          <p style="font-size: 16px; line-height: 1.6;">
            We encountered an issue processing your payout for a recent sale. Please review and update your payout settings.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Transaction Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Product:</td>
                <td style="padding: 8px 0;">${productTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Payout Amount:</td>
                <td style="padding: 8px 0; color: #dc2626; font-weight: bold;">£${attemptedAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
                <td style="padding: 8px 0;">${payoutMethod === 'stripe' ? 'Bank Account (Stripe)' : 'PayPal'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Error:</td>
                <td style="padding: 8px 0; color: #dc2626;">${errorMessage}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>🔧 Next Steps:</strong><br>
              1. Check your payout account details<br>
              2. Ensure your ${payoutMethod === 'stripe' ? 'bank account' : 'PayPal account'} is active<br>
              3. Contact our support team if the issue persists
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/seller?tab=payouts"
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Update Payout Settings
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            Need help? Contact us at <a href="mailto:support@clubup.golf" style="color: #dc2626;">support@clubup.golf</a>
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This is an automated notification from ClubUp.<br>
          We'll retry the payout once you've updated your settings.</p>
        </div>
      </div>
    `

    const result = await sendEmail({
      to: sellerEmail,
      subject,
      html
    })

    // Log the notification
    if (db) {
      await db.activity.create({
        data: {
          userId: sellerId,
          type: 'payout_failed_email_sent',
          description: `Payout failure notification sent for transaction ${transactionId}`,
          metadata: {
            transactionId,
            emailTo: sellerEmail,
            attemptedAmount,
            payoutMethod,
            errorMessage,
            emailSuccess: result.success
          }
        }
      })
    }

    return result
  } catch (error: any) {
    console.error('Error sending payout failure notification:', error)
    return { success: false, error: error.message }
  }
}
