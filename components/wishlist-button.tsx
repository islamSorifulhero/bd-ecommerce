"use client";

import { Heart } from "lucide-react";
import { useWishlistStore, WishlistItem } from "@/lib/store/wishlist-store";

export default function WishlistButton({
  product,
  className = "",
}: {
  product: WishlistItem;
  className?: string;
}) {
  const { toggleItem, isWishlisted } = useWishlistStore();
  const active = isWishlisted(product.productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault(); // avoid triggering parent <Link> navigation on cards
        e.stopPropagation();
        toggleItem(product);
      }}
      aria-label={active ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে যোগ করুন"}
      className={className}
    >
      <Heart
        className={`w-5 h-5 ${active ? "fill-red-500 text-red-500" : "text-gray-500"}`}
      />
    </button>
  );
}
