"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toggleProductActive, deleteProduct } from "./list-actions";

export default function ProductRowActions({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => toggleProductActive(productId, !isActive));
  };

  const handleDelete = () => {
    if (!confirm("এই পণ্যটি মুছে ফেলতে চান?")) return;
    startTransition(() => deleteProduct(productId));
  };

  return (
    <div className="flex gap-2 text-xs">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="border px-2 py-1 rounded hover:bg-gray-50"
      >
        এডিট
      </Link>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="border px-2 py-1 rounded hover:bg-gray-50 disabled:opacity-50"
      >
        {isActive ? "নিষ্ক্রিয় করুন" : "একটিভ করুন"}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="border border-red-300 text-red-600 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
      >
        মুছুন
      </button>
    </div>
  );
}
