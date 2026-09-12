"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { subscribeToNewsletter } from "@/app/newsletter-actions";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await subscribeToNewsletter(email);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "সাবস্ক্রাইব করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return <p className="text-sm text-green-400">ধন্যবাদ! আপনি সাবস্ক্রাইব করেছেন।</p>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="আপনার ইমেইল"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm text-gray-900"
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="সাবস্ক্রাইব করুন"
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-2 disabled:opacity-50 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
