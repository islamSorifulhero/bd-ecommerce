"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import CaptchaField, { CaptchaFieldHandle } from "@/components/captcha-field";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<CaptchaFieldHandle>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaAnswer) {
      setError("যাচাইকরণ প্রশ্নের উত্তর দিন");
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      captchaToken,
      captchaAnswer,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError("ভুল ইমেইল, পাসওয়ার্ড, অথবা যাচাইকরণের উত্তর");
      captchaRef.current?.refresh();
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">লগইন করুন</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">ইমেইল</label>
          <input
            type="email"
            className="w-full border rounded-lg p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">পাসওয়ার্ড</label>
          <input
            type="password"
            className="w-full border rounded-lg p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right mt-1">
            <Link href="/forgot-password" className="text-xs text-green-700">
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
        </div>

        <CaptchaField
          ref={captchaRef}
          answer={captchaAnswer}
          onAnswerChange={setCaptchaAnswer}
          token={captchaToken}
          onTokenChange={setCaptchaToken}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "প্রসেসিং..." : "লগইন করুন"}
        </button>
      </form>

      <p className="text-sm text-center mt-4 text-gray-600">
        নতুন এখানে?{" "}
        <Link href="/register" className="text-green-700 font-medium">
          অ্যাকাউন্ট তৈরি করুন
        </Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
