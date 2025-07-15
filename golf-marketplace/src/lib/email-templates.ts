// Email template utility functions for ClubUp

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface UserData {
  name: string
  email: string
}

interface ProductData {
  title: string
  price: number
  id: string
}

interface OrderData {
  id: string
  total: number
  items: ProductData[]
}

// Base email template wrapper
const emailWrapper = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #16a085, #1e8449); color: white; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .footer { background-color: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .button { display: inline-block; background-color: #16a085; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .button:hover { background-color: #138d75; }
        .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 15px 0; }
        .success { background-color: #d4edda; border: 1px solid #c3e6cb; }
        .logo { width: 40px; height: 40px; background-color: #16a085; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="display: flex; align-items: center; justify-content: center;">
                <div class="logo">C</div>
                <h1>ClubUp</h1>
            </div>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">The Premier Golf Equipment Marketplace</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© 2025 ClubUp. The premier golf equipment marketplace.</p>
            <p>123 Golf Course Drive, St Andrews, Scotland KY16 9BA</p>
            <p>Questions? Contact us at <a href="mailto:support@clubup.com" style="color: #3498db;">support@clubup.com</a></p>
        </div>
    </div>
</body>
</html>
`

// Welcome email for new users
export const welcomeEmail = (user: UserData): EmailTemplate => ({
  subject: "Welcome to ClubUp - Start Your Golf Journey! 🏌️‍♂️",
  html: emailWrapper(`
    <h2>Welcome to ClubUp, ${user.name}! 🎉</h2>
    <p>Thank you for joining the premier golf equipment marketplace. You're now part of a community of 50,000+ golf enthusiasts!</p>

    <div class="alert success">
        <strong>🎯 Your account is ready!</strong> You can now start buying and selling golf equipment.
    </div>

    <h3>What's next?</h3>
    <ul>
        <li><strong>Browse Equipment:</strong> Discover premium golf gear from trusted sellers</li>
        <li><strong>Set Up Your Profile:</strong> Add your details and preferences</li>
        <li><strong>Start Selling:</strong> List your equipment and earn money</li>
        <li><strong>Upgrade:</strong> Try Pro membership free for 1 month</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://clubup.com/search" class="button">Start Browsing Equipment</a>
        <a href="https://clubup.com/sell/new" class="button" style="background-color: #3498db;">List Your First Item</a>
    </div>

    <h3>🏆 Pro Membership Benefits</h3>
    <p>Upgrade to Pro and save 40% on commissions plus get enhanced features:</p>
    <ul>
        <li>Only 3% commission (vs 5% free)</li>
        <li>Priority customer support</li>
        <li>Advanced analytics dashboard</li>
        <li>Free listing bumps (2/month)</li>
    </ul>

    <div style="text-align: center; margin: 20px 0;">
        <a href="https://clubup.com/auth/signup?trial=pro" class="button">Start FREE Pro Trial</a>
    </div>

    <p>Need help? Check out our <a href="https://clubup.com/contact">support center</a> or reply to this email.</p>

    <p>Happy golfing!<br>The ClubUp Team</p>
  `, "Welcome to ClubUp"),
  text: `Welcome to ClubUp, ${user.name}!\n\nThank you for joining the premier golf equipment marketplace. You're now part of a community of 50,000+ golf enthusiasts!\n\nWhat's next?\n- Browse Equipment: Discover premium golf gear\n- Set Up Your Profile: Add your details\n- Start Selling: List your equipment\n- Upgrade: Try Pro membership free\n\nStart browsing: https://clubup.com/search\nList your first item: https://clubup.com/sell/new\n\nThe ClubUp Team`
})

// Order confirmation email
export const orderConfirmationEmail = (user: UserData, order: OrderData): EmailTemplate => ({
  subject: `Order Confirmation #${order.id} - ClubUp`,
  html: emailWrapper(`
    <h2>Order Confirmed! 🎉</h2>
    <p>Hi ${user.name},</p>
    <p>Thank you for your purchase! Your order has been confirmed and is being processed.</p>

    <div class="alert success">
        <strong>Order #${order.id}</strong><br>
        Total: <strong>£${order.total.toFixed(2)}</strong>
    </div>

    <h3>Order Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
            <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Item</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Price</th>
            </tr>
        </thead>
        <tbody>
            ${order.items.map(item => `
                <tr>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">${item.title}</td>
                    <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">£${item.price.toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
        <tfoot>
            <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td style="padding: 12px; border: 1px solid #dee2e6;">Total</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">£${order.total.toFixed(2)}</td>
            </tr>
        </tfoot>
    </table>

    <h3>What happens next?</h3>
    <ol>
        <li>Seller will prepare your item(s)</li>
        <li>You'll receive shipping notification</li>
        <li>Track your package</li>
        <li>Enjoy your new golf equipment!</li>
    </ol>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://clubup.com/orders/${order.id}" class="button">Track Your Order</a>
    </div>

    <p>Questions about your order? <a href="https://clubup.com/contact">Contact our support team</a>.</p>

    <p>Thank you for choosing ClubUp!</p>
  `, "Order Confirmation"),
  text: `Order Confirmed! #${order.id}\n\nHi ${user.name},\n\nThank you for your purchase! Your order has been confirmed.\n\nOrder Total: £${order.total.toFixed(2)}\n\nTrack your order: https://clubup.com/orders/${order.id}\n\nThe ClubUp Team`
})

// Payment confirmation email
export const paymentConfirmationEmail = (user: UserData, amount: number, subscription: string): EmailTemplate => ({
  subject: `Payment Confirmed - ${subscription} Membership`,
  html: emailWrapper(`
    <h2>Payment Confirmed ✅</h2>
    <p>Hi ${user.name},</p>
    <p>Your payment has been successfully processed. Welcome to ${subscription} membership!</p>

    <div class="alert success">
        <strong>Payment Details</strong><br>
        Amount: <strong>£${amount.toFixed(2)}</strong><br>
        Plan: <strong>${subscription} Membership</strong><br>
        Status: <strong>Active</strong>
    </div>

    <h3>Your ${subscription} Benefits Include:</h3>
    ${subscription === 'Pro' ? `
        <ul>
            <li>3% commission on sales (save 40%)</li>
            <li>Enhanced listings with priority placement</li>
            <li>Priority customer support</li>
            <li>Advanced analytics dashboard</li>
            <li>Free listing bumps (2/month)</li>
            <li>Advanced search filters</li>
            <li>Price tracking alerts</li>
        </ul>
    ` : subscription === 'Business' ? `
        <ul>
            <li>3% commission on sales</li>
            <li>Premium branded storefront</li>
            <li>Comprehensive business analytics</li>
            <li>API access for integrations</li>
            <li>Bulk listing management tools</li>
            <li>Inventory management system</li>
            <li>Custom business reporting</li>
        </ul>
    ` : `
        <ul>
            <li>1% commission on sales (lowest rate)</li>
            <li>Verified PGA Professional badge</li>
            <li>Exclusive Pro-only marketplace access</li>
            <li>Direct messaging with students</li>
            <li>Student discount management</li>
            <li>Professional lesson booking integration</li>
            <li>White-label business tools</li>
        </ul>
    `}

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://clubup.com/dashboard/subscription" class="button">Manage Subscription</a>
        <a href="https://clubup.com/sell/new" class="button" style="background-color: #3498db;">Start Selling</a>
    </div>

    <p>Your subscription will automatically renew monthly. You can cancel anytime from your subscription dashboard.</p>

    <p>Questions? <a href="https://clubup.com/contact">Contact our support team</a>.</p>

    <p>Thank you for upgrading!<br>The ClubUp Team</p>
  `, "Payment Confirmation"),
  text: `Payment Confirmed - ${subscription} Membership\n\nHi ${user.name},\n\nYour payment of £${amount.toFixed(2)} has been processed. Welcome to ${subscription} membership!\n\nManage subscription: https://clubup.com/dashboard/subscription\n\nThe ClubUp Team`
})

// Password reset email
export const passwordResetEmail = (user: UserData, resetToken: string): EmailTemplate => ({
  subject: "Reset Your ClubUp Password",
  html: emailWrapper(`
    <h2>Reset Your Password 🔒</h2>
    <p>Hi ${user.name},</p>
    <p>We received a request to reset your ClubUp password. Click the button below to create a new password.</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://clubup.com/auth/reset-password?token=${resetToken}" class="button">Reset Password</a>
    </div>

    <div class="alert">
        <strong>Security Notice:</strong> This link will expire in 1 hour for your security.
    </div>

    <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>

    <p>For security reasons:</p>
    <ul>
        <li>This link can only be used once</li>
        <li>It expires in 1 hour</li>
        <li>Only you have access to this email</li>
    </ul>

    <p>Need help? <a href="https://clubup.com/contact">Contact our support team</a>.</p>

    <p>Stay secure,<br>The ClubUp Team</p>
  `, "Password Reset"),
  text: `Reset Your ClubUp Password\n\nHi ${user.name},\n\nClick this link to reset your password:\nhttps://clubup.com/auth/reset-password?token=${resetToken}\n\nThis link expires in 1 hour.\n\nThe ClubUp Team`
})

// Item sold notification
export const itemSoldEmail = (user: UserData, product: ProductData, buyerName: string): EmailTemplate => ({
  subject: `Great News! Your ${product.title} Sold on ClubUp! 🎉`,
  html: emailWrapper(`
    <h2>Congratulations! Your item sold! 🎉</h2>
    <p>Hi ${user.name},</p>
    <p>Great news! Your listing has been purchased and payment has been processed.</p>

    <div class="alert success">
        <strong>Item Sold:</strong> ${product.title}<br>
        <strong>Sale Price:</strong> £${product.price.toFixed(2)}<br>
        <strong>Buyer:</strong> ${buyerName}
    </div>

    <h3>Next Steps:</h3>
    <ol>
        <li><strong>Package your item</strong> securely for shipping</li>
        <li><strong>Print shipping label</strong> from your seller dashboard</li>
        <li><strong>Ship within 2 business days</strong> to maintain good seller rating</li>
        <li><strong>Update tracking</strong> when shipped</li>
    </ol>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://clubup.com/dashboard/seller" class="button">View Seller Dashboard</a>
        <a href="https://clubup.com/products/${product.id}/shipping" class="button" style="background-color: #3498db;">Print Shipping Label</a>
    </div>

    <h3>💰 Payment Information</h3>
    <p>Your earnings will be deposited to your account within 2-3 business days after the buyer confirms receipt.</p>

    <p>Need shipping help? Check our <a href="https://clubup.com/help/shipping">shipping guide</a> or <a href="https://clubup.com/contact">contact support</a>.</p>

    <p>Keep up the great selling!<br>The ClubUp Team</p>
  `, "Item Sold"),
  text: `Your ${product.title} sold for £${product.price.toFixed(2)}!\n\nNext steps:\n1. Package securely\n2. Print shipping label\n3. Ship within 2 days\n4. Update tracking\n\nSeller dashboard: https://clubup.com/dashboard/seller\n\nThe ClubUp Team`
})

// PGA verification approved
export const pgaVerificationEmail = (user: UserData): EmailTemplate => ({
  subject: "🏆 PGA Verification Approved - Welcome to Elite Status!",
  html: emailWrapper(`
    <h2>🏆 PGA Verification Approved!</h2>
    <p>Hi ${user.name},</p>
    <p>Congratulations! Your PGA Professional verification has been approved. You now have access to exclusive PGA Pro features.</p>

    <div class="alert success">
        <strong>Status:</strong> PGA Professional ✅<br>
        <strong>Commission Rate:</strong> 1% (lowest available)<br>
        <strong>Badge:</strong> Verified PGA Professional
    </div>

    <h3>🌟 Your Exclusive PGA Pro Benefits:</h3>
    <ul>
        <li><strong>1% commission</strong> - lowest rate on ClubUp</li>
        <li><strong>PGA Professional badge</strong> on all your listings</li>
        <li><strong>Exclusive Pro marketplace</strong> access</li>
        <li><strong>Direct student messaging</strong> system</li>
        <li><strong>Student discount management</strong> tools</li>
        <li><strong>Lesson booking integration</strong></li>
        <li><strong>White-label business tools</strong></li>
        <li><strong>Unlimited listing bumps</strong></li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
        <a href="https://clubup.com/pga/dashboard" class="button">Access PGA Pro Dashboard</a>
        <a href="https://clubup.com/sell/new" class="button" style="background-color: #f39c12;">Start Selling</a>
    </div>

    <h3>🎯 Maximize Your PGA Pro Status</h3>
    <p>Take advantage of your professional status:</p>
    <ul>
        <li>List equipment with your PGA Pro badge</li>
        <li>Offer student discounts to attract buyers</li>
        <li>Use lesson booking integration</li>
        <li>Access the exclusive Pro marketplace</li>
    </ul>

    <p>Questions about your PGA Pro features? <a href="https://clubup.com/contact">Contact our PGA support team</a>.</p>

    <p>Welcome to the elite!<br>The ClubUp Team</p>
  `, "PGA Verification Approved"),
  text: `PGA Verification Approved!\n\nCongratulations ${user.name}! You're now a verified PGA Professional with 1% commission and exclusive features.\n\nAccess your dashboard: https://clubup.com/pga/dashboard\n\nThe ClubUp Team`
})
