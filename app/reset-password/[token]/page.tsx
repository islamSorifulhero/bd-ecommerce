"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "../../forgot-password/actions";

interface Props {
  params: { token: string };
}

export default function ResetPasswordPage({ params }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("পাসওয়ার্ড দুটি মিলছে না");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(params.token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold mb-3">পাসওয়ার্ড পরিবর্তন হয়েছে</h1>
        <p className="text-gray-600 text-sm">
          লগইন পেজে নিয়ে যাওয়া হচ্ছে...
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">নতুন পাসওয়ার্ড সেট করুন</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">নতুন পাসওয়ার্ড</label>
          <input
            type="password"
            required
            className="w-full border rounded-lg p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
          <input
            type="password"
            required
            className="w-full border rounded-lg p-3"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "প্রসেসিং..." : "পাসওয়ার্ড পরিবর্তন করুন"}
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
