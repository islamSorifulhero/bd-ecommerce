"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tag, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { BD_DISTRICTS, calculateShippingCharge } from "@/lib/bd-locations";
import { formatBDT } from "@/lib/utils";
import { createOrder, validateCoupon } from "./actions";

type PaymentMethod = "COD" | "BKASH" | "SSLCOMMERZ";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();

  const [district, setDistrict] = useState("Dhaka");
  const [thana, setThana] = useState(BD_DISTRICTS["Dhaka"][0]);
  const [fullAddress, setFullAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const shippingCharge = useMemo(() => calculateShippingCharge(district), [district]);
  const subtotal = totalPrice();
  const discount = appliedCoupon?.discount || 0;
  const grandTotal = Math.max(subtotal + shippingCharge - discount, 0);

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setThana(BD_DISTRICTS[value][0]);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponInput, subtotal);
      setAppliedCoupon(result);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "কুপন প্রয়োগ করা যায়নি");
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!fullAddress.trim()) {
      setError("সম্পূর্ণ ঠিকানা লিখুন");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const order = await createOrder({
        district,
        thana,
        fullAddress,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        couponCode: appliedCoupon?.code,
      });

      if (paymentMethod === "BKASH") {
        const res = await fetch("/api/bkash/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id, amount: order.totalAmount }),
        });
        const data = await res.json();
        clearCart();
        if (data.bkashURL) {
          window.location.href = data.bkashURL;
          return;
        }
        throw new Error("bKash পেমেন্ট শুরু করা যায়নি");
      }

      if (paymentMethod === "SSLCOMMERZ") {
        const res = await fetch("/api/sslcommerz/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        const data = await res.json();
        clearCart();
        if (data.gatewayUrl) {
          window.location.href = data.gatewayUrl;
          return;
        }
        throw new Error("SSLCommerz পেমেন্ট শুরু করা যায়নি");
      }

      // COD
      clearCart();
      router.push(`/account/orders/${order.id}?success=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "কিছু একটা সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">আপনার কার্ট খালি।</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="text-xl font-bold mb-4">শিপিং তথ্য</h1>

        <label className="block text-sm font-medium mb-1">জেলা</label>
        <select
          className="w-full border rounded-lg p-3 mb-4"
          value={district}
          onChange={(e) => handleDistrictChange(e.target.value)}
        >
          {Object.keys(BD_DISTRICTS).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">থানা</label>
        <select
          className="w-full border rounded-lg p-3 mb-4"
          value={thana}
          onChange={(e) => setThana(e.target.value)}
        >
          {BD_DISTRICTS[district].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">সম্পূর্ণ ঠিকানা</label>
        <textarea
          className="w-full border rounded-lg p-3 mb-4"
          rows={3}
          placeholder="বাড়ি/রোড/এলাকা"
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
        />

        <h2 className="text-lg font-bold mb-3 mt-6">পেমেন্ট পদ্ধতি</h2>
        <div className="space-y-2">
          {[
            { id: "COD", label: "ক্যাশ অন ডেলিভারি" },
            { id: "BKASH", label: "বিকাশ" },
            { id: "SSLCOMMERZ", label: "কার্ড / নেট ব্যাংকিং (SSLCommerz)" },
          ].map((m) => (
            <label
              key={m.id}
              className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${
                paymentMethod === m.id ? "border-green-600 bg-green-50" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === m.id}
                onChange={() => setPaymentMethod(m.id as PaymentMethod)}
              />
              {m.label}
            </label>
          ))}
        </div>

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">অর্ডার সামারি</h2>
        <div className="border rounded-lg divide-y">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId || "base"}`} className="flex justify-between p-3 text-sm">
              <span>
                {item.name}
                {item.variantLabel && (
                  <span className="text-gray-400"> ({item.variantLabel})</span>
                )}{" "}
                x{item.quantity}
              </span>
              <span>{formatBDT(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Coupon input */}
        <div className="mt-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <span className="flex items-center gap-2 text-green-700">
                <Tag className="w-4 h-4" />
                কুপন <strong>{appliedCoupon.code}</strong> প্রয়োগ হয়েছে
              </span>
              <button
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponInput("");
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="কুপন কোড"
                className="flex-1 border rounded-lg p-2 text-sm uppercase"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                className="text-sm border px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {couponLoading ? "..." : "প্রয়োগ করুন"}
              </button>
            </div>
          )}
          {couponError && <p className="text-red-600 text-xs mt-1">{couponError}</p>}
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>সাবটোটাল</span>
            <span>{formatBDT(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>শিপিং চার্জ ({district === "Dhaka" ? "ঢাকা" : "ঢাকার বাইরে"})</span>
            <span>{formatBDT(shippingCharge)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>ডিসকাউন্ট</span>
              <span>-{formatBDT(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>সর্বমোট</span>
            <span>{formatBDT(grandTotal)}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full mt-6 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "প্রসেসিং..." : "অর্ডার কনফার্ম করুন"}
        </button>
      </div>
    </main>
  );
}
