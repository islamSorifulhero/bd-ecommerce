"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerUser } from "./actions";
import CaptchaField, { CaptchaFieldHandle } from "@/components/captcha-field";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<CaptchaFieldHandle>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("সব ফিল্ড পূরণ করুন");
      return;
    }
    if (form.password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    if (!captchaAnswer) {
      setError("যাচাইকরণ প্রশ্নের উত্তর দিন");
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({ ...form, captchaToken, captchaAnswer });

      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        captchaToken: result.autoLogin.token,
        captchaAnswer: result.autoLogin.answer,
        redirect: false,
      });

      if (res?.error) {
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
      captchaRef.current?.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">অ্যাকাউন্ট তৈরি করুন</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">পুরো নাম</label>
          <input
            className="w-full border rounded-lg p-3"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ইমেইল</label>
          <input
            type="email"
            className="w-full border rounded-lg p-3"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ফোন নম্বর</label>
          <input
            type="tel"
            placeholder="01XXXXXXXXX"
            className="w-full border rounded-lg p-3"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">পাসওয়ার্ড</label>
          <input
            type="password"
            className="w-full border rounded-lg p-3"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
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
          {loading ? "প্রসেসিং..." : "রেজিস্টার করুন"}
        </button>
      </form>

      <p className="text-sm text-center mt-4 text-gray-600">
        আগে থেকেই অ্যাকাউন্ট আছে?{" "}
        <Link href="/login" className="text-green-700 font-medium">
          লগইন করুন
        </Link>
      </p>
    </main>
  );
}