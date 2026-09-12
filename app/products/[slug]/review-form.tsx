"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { submitReview } from "./review-actions";

export default function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("একটি রেটিং দিন");
      return;
    }

    setLoading(true);
    try {
      await submitReview(productId, rating, comment);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "রিভিউ জমা দেওয়া যায়নি");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
        ধন্যবাদ! আপনার রিভিউ জমা হয়েছে।
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3">
      <p className="font-medium text-sm">এই পণ্যের রিভিউ দিন</p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <Star
              className={`w-6 h-6 ${
                n <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        placeholder="আপনার অভিজ্ঞতা লিখুন (ঐচ্ছিক)"
        className="w-full border rounded-lg p-2 text-sm"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {error && <p className="text-red-600 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        রিভিউ জমা দিন
      </button>
    </form>
  );
}
