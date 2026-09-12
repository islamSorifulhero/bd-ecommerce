"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { getReorderItems } from "./reorder-action";

export default function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState("");

  const handleReorder = () => {
    setNotice("");
    startTransition(async () => {
      try {
        const { items, skipped } = await getReorderItems(orderId);

        items.forEach((item) => {
          addItem(
            {
              productId: item.productId,
              variantId: item.variantId,
              variantLabel: item.variantLabel,
              name: item.name,
              slug: item.slug,
              price: item.price,
              image: item.image,
              stock: item.stock,
            },
            1
          );
        });

        if (skipped.length > 0) {
          setNotice(`এগুলো এখন স্টকে নেই, কার্টে যোগ করা যায়নি: ${skipped.join(", ")}`);
        }

        if (items.length > 0) {
          router.push("/checkout");
        }
      } catch (err) {
        setNotice(err instanceof Error ? err.message : "আবার অর্ডার করা যায়নি");
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleReorder}
        disabled={isPending}
        className="text-sm border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
      >
        <RotateCcw className="w-4 h-4" />
        {isPending ? "যোগ হচ্ছে..." : "আবার অর্ডার করুন"}
      </button>
      {notice && <p className="text-xs text-amber-600 mt-1">{notice}</p>}
    </div>
  );
}
