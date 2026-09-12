"use client";

import { useState } from "react";
import { Search, Package, Truck } from "lucide-react";
import { trackOrder, TrackResult } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "পেন্ডিং",
  CONFIRMED: "কনফার্মড",
  PROCESSING: "প্রসেসিং",
  SHIPPED: "শিপড",
  DELIVERED: "ডেলিভারড",
  CANCELLED: "বাতিল",
  RETURNED: "রিটার্ন করা হয়েছে",
};

const STATUS_STEPS = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!orderNumber.trim() || !phone.trim()) {
      setError("অর্ডার নম্বর ও ফোন নম্বর দিন");
      return;
    }

    setLoading(true);
    try {
      const res = await trackOrder(orderNumber, phone);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "খুঁজে পাওয়া যায়নি");
    } finally {
      setLoading(false);
    }
  };

  const activeStepIndex = result ? STATUS_STEPS.indexOf(result.status) : -1;
  const isTerminalNegative = result && ["CANCELLED", "RETURNED"].includes(result.status);

  return (
    <main className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <Package className="w-10 h-10 text-green-700 mx-auto mb-3" />
        <h1 className="text-2xl font-bold">অর্ডার ট্র্যাক করুন</h1>
        <p className="text-sm text-gray-500 mt-1">
          অর্ডার নম্বর ও অর্ডারে ব্যবহৃত ফোন নম্বর দিয়ে আপনার অর্ডারের অবস্থা দেখুন
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="অর্ডার নম্বর (যেমন: ORD-20260910-1234)"
          className="w-full border rounded-lg p-3"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
        <input
          type="tel"
          placeholder="ফোন নম্বর"
          className="w-full border rounded-lg p-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          {loading ? "খোঁজা হচ্ছে..." : "ট্র্যাক করুন"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}

      {result && (
        <div className="mt-8 border rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">#{result.orderNumber}</span>
            <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              {STATUS_LABELS[result.status] || result.status}
            </span>
          </div>

          {!isTerminalNegative && (
            <div className="flex items-center mb-6">
              {STATUS_STEPS.map((step, idx) => (
                <div key={step} className="flex-1 flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      idx <= activeStepIndex
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        idx < activeStepIndex ? "bg-green-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1 mb-4">
            {result.items.map((item, i) => (
              <p key={i} className="text-sm text-gray-700">
                {item.name}
                {item.variantLabel && ` (${item.variantLabel})`} x{item.quantity}
              </p>
            ))}
          </div>

          {result.shipment && (
            <div className="flex items-center gap-2 text-sm text-gray-600 border-t pt-3">
              <Truck className="w-4 h-4" />
              {result.shipment.courierName}: {result.shipment.status}
              {result.shipment.trackingCode && ` — ${result.shipment.trackingCode}`}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
