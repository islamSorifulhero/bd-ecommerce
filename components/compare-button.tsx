"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
import { useCompareStore, MAX_COMPARE } from "@/lib/store/compare-store";

export default function CompareButton({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  const { toggleProduct, isComparing } = useCompareStore();
  const active = isComparing(productId);
  const [limitMsg, setLimitMsg] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const { atLimit } = toggleProduct(productId);
          if (atLimit) {
            setLimitMsg(true);
            setTimeout(() => setLimitMsg(false), 2500);
          }
        }}
        aria-label={active ? "তুলনা থেকে সরান" : "তুলনায় যোগ করুন"}
        className={className}
      >
        <Scale className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-500"}`} />
      </button>
      {limitMsg && (
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-max text-[10px] bg-black text-white px-2 py-1 rounded whitespace-nowrap z-10">
          সর্বোচ্চ {MAX_COMPARE}টি পণ্য তুলনা করা যাবে
        </span>
      )}
    </div>
  );
}
