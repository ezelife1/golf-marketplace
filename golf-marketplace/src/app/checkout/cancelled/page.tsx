"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, ShoppingBag, HelpCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Checkout Cancelled</CardTitle>
            <p className="text-gray-600">Your order was not completed</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                No worries! Your cart items are still saved and waiting for you.
                You can continue shopping or try checking out again.
              </p>
            </div>

            {/* Why might this have happened */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Common reasons for cancelled checkout
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Changed your mind about the purchase</li>
                <li>• Had issues with payment method</li>
                <li>• Wanted to add more items to your cart</li>
                <li>• Decided to check other options first</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <Button className="w-full" asChild>
                <Link href="/checkout">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Return to Checkout
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/products">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>

            {/* Help section */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Need Help?</h4>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium mb-2">Payment Issues?</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    If you're having trouble with payment, try a different card or payment method.
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/help/payment">Payment Help</Link>
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium mb-2">Have Questions?</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Our support team is here to help with any questions about your order.
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Why shop with ClubUp?</h4>
              <div className="text-sm text-green-800 space-y-1">
                <div>✓ Secure checkout with Stripe</div>
                <div>✓ 14-day return guarantee</div>
                <div>✓ Authenticated equipment</div>
                <div>✓ Buyer protection included</div>
              </div>
            </div>

            {/* Alternative actions */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Your cart will be saved for 30 days
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="link" className="text-xs" asChild>
                  <Link href="/wishlist">View Wishlist →</Link>
                </Button>
                <Button variant="link" className="text-xs" asChild>
                  <Link href="/help">Help Center →</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
