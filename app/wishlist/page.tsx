"use client";

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useCartStore } from "@/lib/store/cart-store";
import { formatBDT } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">আপনার উইশলিস্ট খালি।</p>
        <Link href="/products" className="text-green-700 font-medium mt-2 inline-block">
          কেনাকাটা শুরু করুন
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold mb-6">আমার উইশলিস্ট ({items.length})</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 border rounded-lg p-3"
          >
            <Link href={`/products/${item.slug}`} className="relative w-16 h-16 shrink-0 rounded overflow-hidden bg-gray-100">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.slug}`} className="text-sm font-medium line-clamp-2">
                {item.name}
              </Link>
              <p className="text-sm text-green-700 font-semibold mt-1">
                {formatBDT(item.price)}
              </p>
            </div>

            <button
              onClick={() =>
                addItem(
                  {
                    productId: item.productId,
                    name: item.name,
                    slug: item.slug,
                    price: item.price,
                    image: item.image,
                    stock: 999, // detail page enforces real stock at checkout time
                  },
                  1
                )
              }
              className="text-xs bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 shrink-0"
            >
              কার্টে যোগ করুন
            </button>

            <button
              onClick={() => removeItem(item.productId)}
              className="text-gray-400 hover:text-red-500 shrink-0"
              aria-label="Remove from wishlist"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
