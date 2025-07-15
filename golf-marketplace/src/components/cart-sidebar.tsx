"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCart, CartItem } from "@/contexts/cart-context"
import { Plus, Minus, X, ShoppingBag, Trash2 } from "lucide-react"
import Link from "next/link"

interface CartItemComponentProps {
  item: CartItem
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex gap-3 py-4">
      <img
        src={item.image}
        alt={item.title}
        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
        <p className="text-xs text-gray-600 mt-1">{item.brand} • {item.condition}</p>
        <p className="text-xs text-gray-500">Sold by {item.sellerName}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="w-3 h-3" />
            </Button>

            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>

            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold">£{(item.price * item.quantity).toFixed(2)}</div>
            {item.quantity > 1 && (
              <div className="text-xs text-gray-500">£{item.price.toFixed(2)} each</div>
            )}
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
        onClick={() => onRemove(item.id)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}

export const CartSidebar: React.FC = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const { state, updateQuantity, removeItem, clearCart, closeCart } = useCart()
  const { items, totalItems, totalPrice, isOpen } = state

  const handleCheckout = async () => {
    if (!session) {
      closeCart()
      router.push("/auth/signin?callbackUrl=/checkout")
      return
    }

    router.push("/checkout")
    closeCart()
  }

  const handleContinueShopping = () => {
    closeCart()
    router.push("/products")
  }

  // Calculate fees
  const platformFee = totalPrice * 0.029 // 2.9% platform fee
  const shippingFee = totalPrice > 50 ? 0 : 5.99 // Free shipping over £50
  const totalWithFees = totalPrice + platformFee + shippingFee

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Shopping Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          // Empty cart state
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 text-center mb-6">
              Discover amazing golf equipment and add items to your cart
            </p>
            <Button onClick={handleContinueShopping} className="w-full max-w-xs">
              Continue Shopping
            </Button>
          </div>
        ) : (
          // Cart with items
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <CartItemComponent
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="border-t pt-4 space-y-4">
              {/* Pricing breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>£{totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Platform fee (2.9%)</span>
                  <span>£{platformFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Free
                      </Badge>
                    ) : (
                      `£${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                {totalPrice < 50 && shippingFee > 0 && (
                  <div className="text-xs text-blue-600">
                    Add £{(50 - totalPrice).toFixed(2)} more for free shipping
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>£{totalWithFees.toFixed(2)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  {session ? "Proceed to Checkout" : "Sign In to Checkout"}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleContinueShopping}
                    className="flex-1"
                  >
                    Continue Shopping
                  </Button>

                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="px-3"
                    title="Clear cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-xs text-green-800 space-y-1">
                  <div>✓ Secure checkout with Stripe</div>
                  <div>✓ 14-day return guarantee</div>
                  <div>✓ Buyer protection included</div>
                </div>
              </div>

              {/* Recently viewed or recommended */}
              <div className="text-center">
                <Button variant="link" className="text-xs" asChild>
                  <Link href="/products">Browse more equipment →</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
