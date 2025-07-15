"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Search, Menu, X, User, Heart, ShoppingCart, Bell, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { CartSidebar } from "@/components/cart-sidebar"
import { PWAStatus } from "@/components/pwa-status"
import { CountrySelectorCompact } from "@/components/country-selector"
import { LanguageSelectorCompact } from "@/components/language-selector"
import { useLocale } from "@/contexts/locale-context"

export function Navigation() {
  const { data: session, status } = useSession()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const { state: cartState, toggleCart } = useCart()
  const { t } = useLocale()

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 luxury-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold">ClubUp</span>
          </Link>



          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="sm" className="relative">
              <MessageCircle className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                2
              </Badge>
            </Button>

            {/* Favorites */}
            <Button variant="ghost" size="sm" className="relative">
              <Heart className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
                5
              </Badge>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="sm" className="relative" onClick={toggleCart}>
              <ShoppingCart className="w-5 h-5" />
              {cartState.totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  {cartState.totalItems}
                </Badge>
              )}
            </Button>

            {/* PWA Status */}
            <PWAStatus />

            {/* Country/Currency Selector */}
            <CountrySelectorCompact />

            {/* Language Selector */}
            <LanguageSelectorCompact />

            {/* Services & Revenue Features */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/services">Services</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/featured">Featured</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/wanted">Wanted</Link>
            </Button>
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/swap">
                Swap
                <Badge className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                  +
                </Badge>
              </Link>
            </Button>

            {/* Sell Button */}
            <Button variant="outline" asChild>
              <Link href="/sell">Sell Equipment</Link>
            </Button>

            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    {session.user?.name || session.user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/subscription">Subscription</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Order History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/listings">My Listings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help">Help & Support</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search equipment..."
                      className="pl-10 h-12"
                    />
                  </div>

                  {/* Mobile Menu Links */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="justify-start relative">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs">3</Badge>
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start relative">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Messages
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white text-xs">2</Badge>
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start relative">
                        <Heart className="w-4 h-4 mr-2" />
                        Favorites
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-xs">5</Badge>
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start relative" onClick={toggleCart}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Cart
                        {cartState.totalItems > 0 && (
                          <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs">
                            {cartState.totalItems}
                          </Badge>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/services">Professional Services</Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/featured">Featured Listings</Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start relative" asChild>
                        <Link href="/swap">
                          Equipment Swap
                          <Badge className="absolute right-4 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                            Pro+
                          </Badge>
                        </Link>
                      </Button>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                      <Link href="/sell">Sell Equipment</Link>
                    </Button>

                    <div className="border-t pt-4 space-y-2">
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/profile">Profile</Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/orders">Order History</Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/listings">My Listings</Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/subscription">Membership</Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/settings">Settings</Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/help">Help & Support</Link>
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <Button variant="outline" className="w-full">
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="hidden lg:flex items-center justify-between py-3 border-t">
          <div className="flex items-center space-x-8">
            <Link href="/categories/drivers" className="text-sm font-medium hover:text-primary transition-colors">
              {t('category.drivers')}
            </Link>
            <Link href="/categories/irons" className="text-sm font-medium hover:text-primary transition-colors">
              {t('category.irons')}
            </Link>
            <Link href="/categories/putters" className="text-sm font-medium hover:text-primary transition-colors">
              {t('category.putters')}
            </Link>
            <Link href="/categories/bags" className="text-sm font-medium hover:text-primary transition-colors">
              {t('category.golf-bags')}
            </Link>
            <Link href="/categories/apparel" className="text-sm font-medium hover:text-primary transition-colors">
              {t('category.apparel')}
            </Link>
            <Link href="/categories/accessories" className="text-sm font-medium hover:text-primary transition-colors">
              {t('category.accessories')}
            </Link>
            <Link href="/new" className="text-sm font-medium text-primary">
              {t('category.newEquipment')}
            </Link>
            <Link href="/used" className="text-sm font-medium text-green-600">
              {t('category.usedEquipment')}
            </Link>
          </div>

          {/* Search in Category Navigation */}
          <div className="flex-1 max-w-md ml-8">
            <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('nav.search') + ' golf equipment...'}
                className="pl-9 pr-4 h-10 text-sm border-2 focus:border-primary"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <Button
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 h-8 px-3 text-xs"
              >
                {t('common.search')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar />
    </nav>
  )
}
