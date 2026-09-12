"use client";

import { useTransition } from "react";
import { toggleCouponActive, deleteCoupon } from "./actions";

export default function CouponRowActions({
  couponId,
  isActive,
}: {
  couponId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2 text-xs">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => toggleCouponActive(couponId, !isActive))}
        className="border px-2 py-1 rounded hover:bg-gray-50 disabled:opacity-50"
      >
        {isActive ? "নিষ্ক্রিয় করুন" : "একটিভ করুন"}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (confirm("এই কুপনটি মুছে ফেলতে চান?")) {
            startTransition(() => deleteCoupon(couponId));
          }
        }}
        className="border border-red-300 text-red-600 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
      >
        মুছুন
      </button>
    </div>
  );
}
