"use client";

import { useState } from "react";
import { createCoupon } from "./actions";

export default function NewCouponForm() {
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.code || !form.value) {
      setError("কোড ও মান দিন");
      return;
    }

    setLoading(true);
    try {
      await createCoupon({
        code: form.code,
        type: form.type,
        value: parseFloat(form.value),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : 0,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
        expiresAt: form.expiresAt || null,
      });
      setForm({
        code: "",
        type: "PERCENTAGE",
        value: "",
        minOrderAmount: "",
        maxUses: "",
        expiresAt: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "কুপন তৈরি করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl bg-white p-4 space-y-3 mb-8">
      <h2 className="font-semibold">নতুন কুপন তৈরি করুন</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">কুপন কোড</label>
          <input
            className="w-full border rounded-lg p-2 text-sm uppercase"
            placeholder="EID50"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">ধরন</label>
          <select
            className="w-full border rounded-lg p-2 text-sm"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
          >
            <option value="PERCENTAGE">শতাংশ (%)</option>
            <option value="FIXED">নির্দিষ্ট টাকা (৳)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">
            মান {form.type === "PERCENTAGE" ? "(%)" : "(৳)"}
          </label>
          <input
            type="number"
            className="w-full border rounded-lg p-2 text-sm"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">ন্যূনতম অর্ডার (৳)</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2 text-sm"
            value={form.minOrderAmount}
            onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">সর্বোচ্চ ব্যবহার (ঐচ্ছিক)</label>
          <input
            type="number"
            className="w-full border rounded-lg p-2 text-sm"
            value={form.maxUses}
            onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">মেয়াদ শেষ (ঐচ্ছিক)</label>
          <input
            type="date"
            className="w-full border rounded-lg p-2 text-sm"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "তৈরি হচ্ছে..." : "কুপন তৈরি করুন"}
      </button>
    </form>
  );
}
