"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
    } finally {
      setLoading(false);
      setSent(true); // always show success, regardless of whether the email exists
    }
  };

  if (sent) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-3">ইমেইল পাঠানো হয়েছে</h1>
        <p className="text-gray-600 text-sm">
          যদি <strong>{email}</strong> দিয়ে কোনো অ্যাকাউন্ট থাকে, তাহলে একটি
          পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। ইনবক্স চেক করুন।
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">পাসওয়ার্ড ভুলে গেছেন?</h1>
      <p className="text-sm text-gray-600 mb-6">
        আপনার ইমেইল দিন, আমরা একটি রিসেট লিংক পাঠাবো।
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="আপনার ইমেইল"
          className="w-full border rounded-lg p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
        </button>
      </form>

      <p className="text-sm text-center mt-4 text-gray-600">
        <Link href="/login" className="text-green-700 font-medium">
          লগইনে ফিরে যান
        </Link>
      </p>
    </main>
  );
}
