"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteReview } from "./actions";

export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("এই রিভিউটি মুছে ফেলতে চান?")) return;
    startTransition(() => deleteReview(reviewId));
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 disabled:opacity-50 shrink-0"
      aria-label="Delete review"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
