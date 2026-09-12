"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "./actions";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCancel = () => {
    if (!confirm("আপনি কি নিশ্চিত এই অর্ডারটি বাতিল করতে চান?")) return;
    setError("");

    startTransition(async () => {
      try {
        await cancelOrder(orderId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "বাতিল করা যায়নি");
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="text-sm border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? "বাতিল হচ্ছে..." : "অর্ডার বাতিল করুন"}
      </button>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
