"use client";

import Link from "next/link";
import { ShoppingCart, Heart, Scale } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useCompareStore } from "@/lib/store/compare-store";
import ThemeToggle from "@/components/theme-toggle";

export default function Header() {
  const { totalItems, openCart } = useCartStore();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const compareCount = useCompareStore((s) => s.productIds.length);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-green-700 dark:text-green-500">
          BD Shop
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/">হোম</Link>
          <Link href="/products">সকল পণ্য</Link>
          <Link href="/track">অর্ডার ট্র্যাক</Link>
          <Link href="/account/orders">আমার অর্ডার</Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <Link href="/compare" className="relative">
            <Scale className="w-6 h-6" />
            {compareCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {compareCount}
              </span>
            )}
          </Link>

          <Link href="/wishlist" className="relative">
            <Heart className="w-6 h-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button onClick={openCart} className="relative">
            <ShoppingCart className="w-6 h-6" />
            {totalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems()}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
