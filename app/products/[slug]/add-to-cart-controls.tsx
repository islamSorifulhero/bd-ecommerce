"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { formatBDT } from "@/lib/utils";

interface Variant {
  id: string;
  label: string;
  price: number | null; // null = use base product price
  stock: number;
}

interface ProductInput {
  id: string;
  name: string;
  slug: string;
  price: number; // base/effective price when there are no variants
  image: string;
  stock: number;
  variants: Variant[];
}

export default function AddToCartControls({ product }: { product: ProductInput }) {
  const hasVariants = product.variants.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    hasVariants ? product.variants[0].id : ""
  );
  const [qty, setQty] = useState(1);
  const router = useRouter();
  const { addItem } = useCartStore();

  const selectedVariant = hasVariants
    ? product.variants.find((v) => v.id === selectedVariantId)
    : undefined;

  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveStock = hasVariants ? selectedVariant?.stock ?? 0 : product.stock;
  const inStock = effectiveStock > 0;

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) return;
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id,
        variantLabel: selectedVariant?.label,
        name: product.name,
        slug: product.slug,
        price: effectivePrice,
        image: product.image,
        stock: effectiveStock,
      },
      qty
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="mt-8">
      {hasVariants && (
        <div className="mb-4">
          <span className="text-sm font-medium block mb-2">ভ্যারিয়েন্ট নির্বাচন করুন:</span>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setSelectedVariantId(v.id);
                  setQty(1);
                }}
                disabled={v.stock === 0}
                className={`text-sm px-3 py-2 rounded-lg border ${
                  selectedVariantId === v.id
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-gray-300"
                } ${v.stock === 0 ? "opacity-40 cursor-not-allowed line-through" : ""}`}
              >
                {v.label}
                {v.price !== null && ` — ${formatBDT(v.price)}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">পরিমাণ:</span>
        <div className="flex items-center border rounded-lg">
          <button
            className="p-2"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={!inStock}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center">{qty}</span>
          <button
            className="p-2"
            onClick={() => setQty((q) => Math.min(effectiveStock, q + 1))}
            disabled={!inStock}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex-1 border-2 border-green-600 text-green-700 font-semibold py-3 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          কার্টে যোগ করুন
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!inStock}
          className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          এখনই কিনুন
        </button>
      </div>
    </div>
  );
}
