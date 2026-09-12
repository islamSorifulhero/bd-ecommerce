// components/cart-drawer.tsx
"use client";

import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart-store";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice } =
    useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeCart}
        aria-hidden
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-xl flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> আপনার কার্ট ({items.length})
          </h2>
          <button onClick={closeCart} aria-label="Close cart">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 && (
            <p className="text-center text-gray-500 mt-10">
              আপনার কার্ট খালি। কেনাকাটা শুরু করুন!
            </p>
          )}

          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId || "base"}`} className="flex gap-3 border-b dark:border-gray-800 pb-4">
              <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                {item.variantLabel && (
                  <p className="text-xs text-gray-400">{item.variantLabel}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">৳{item.price.toLocaleString()}</p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="w-6 h-6 flex items-center justify-center border dark:border-gray-700 rounded"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1, item.variantId)
                    }
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    className="w-6 h-6 flex items-center justify-center border dark:border-gray-700 rounded"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1, item.variantId)
                    }
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus className="w-3 h-3" />
                  </button>

                  <button
                    className="ml-auto text-red-500"
                    onClick={() => removeItem(item.productId, item.variantId)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t dark:border-gray-800 space-y-3">
            <div className="flex justify-between font-semibold">
              <span>সাবটোটাল</span>
              <span>৳{totalPrice().toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">শিপিং চার্জ চেকআউটে যোগ হবে</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-medium hover:bg-green-700"
            >
              চেকআউট করুন
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
