// app/admin/coupons/page.tsx
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import NewCouponForm from "./new-coupon-form";
import CouponRowActions from "./coupon-row-actions";
import { requireFullAdminPage } from "@/lib/require-full-admin";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireFullAdminPage();
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">কুপন / ডিসকাউন্ট কোড</h1>

      <NewCouponForm />

      <div className="border rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">কোড</th>
              <th className="p-3">মান</th>
              <th className="p-3">ন্যূনতম অর্ডার</th>
              <th className="p-3">ব্যবহার</th>
              <th className="p-3">মেয়াদ</th>
              <th className="p-3">স্ট্যাটাস</th>
              <th className="p-3">একশন</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-400">
                  কোনো কুপন নেই
                </td>
              </tr>
            )}
            {coupons.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-mono font-medium">{c.code}</td>
                <td className="p-3">
                  {c.type === "PERCENTAGE" ? `${c.value}%` : formatBDT(c.value.toString())}
                </td>
                <td className="p-3">{formatBDT(c.minOrderAmount.toString())}</td>
                <td className="p-3">
                  {c.usedCount}
                  {c.maxUses !== null ? ` / ${c.maxUses}` : ""}
                </td>
                <td className="p-3">
                  {c.expiresAt
                    ? new Date(c.expiresAt).toLocaleDateString("bn-BD")
                    : "কোনো মেয়াদ নেই"}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      c.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {c.isActive ? "একটিভ" : "নিষ্ক্রিয়"}
                  </span>
                </td>
                <td className="p-3">
                  <CouponRowActions couponId={c.id} isActive={c.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
