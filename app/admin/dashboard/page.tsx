// app/admin/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import { DollarSign, Clock, AlertTriangle, Package } from "lucide-react";
import SalesChart, { SalesPoint } from "./sales-chart";

const TREND_DAYS = 14;

async function getStats() {
  const trendStart = new Date();
  trendStart.setDate(trendStart.getDate() - (TREND_DAYS - 1));
  trendStart.setHours(0, 0, 0, 0);

  const [
    revenueAgg,
    pendingOrders,
    lowStockProducts,
    totalOrders,
    recentPaidOrders,
    topProductRows,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    prisma.order.count(),
    prisma.order.findMany({
      where: { paymentStatus: "PAID", createdAt: { gte: trendStart } },
      select: { totalAmount: true, createdAt: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  // Build a day-by-day revenue trend for the last TREND_DAYS days
  const dayBuckets = new Map<string, number>();
  for (let i = 0; i < TREND_DAYS; i++) {
    const d = new Date(trendStart);
    d.setDate(d.getDate() + i);
    dayBuckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const order of recentPaidOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    dayBuckets.set(key, (dayBuckets.get(key) || 0) + Number(order.totalAmount));
  }
  const salesTrend: SalesPoint[] = Array.from(dayBuckets.entries()).map(([key, revenue]) => {
    const d = new Date(key);
    return {
      date: d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
      revenue,
    };
  });

  const topProductIds = topProductRows.map((r) => r.productId);
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
  });
  const topProducts = topProductRows.map((r) => ({
    product: topProductDetails.find((p) => p.id === r.productId),
    sold: r._sum.quantity || 0,
  }));

  return {
    totalRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
    pendingOrders,
    lowStockProducts,
    totalOrders,
    salesTrend,
    topProducts,
  };
}

export default async function AdminDashboardPage() {
  const { totalRevenue, pendingOrders, lowStockProducts, totalOrders, salesTrend, topProducts } =
    await getStats();

  const cards = [
    {
      label: "মোট আয়",
      value: formatBDT(totalRevenue),
      icon: DollarSign,
      color: "bg-green-100 text-green-700",
    },
    {
      label: "পেন্ডিং অর্ডার",
      value: pendingOrders,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "মোট অর্ডার",
      value: totalOrders,
      icon: Package,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "লো স্টক পণ্য",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: "bg-red-100 text-red-700",
    },
  ];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">ড্যাশবোর্ড</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border rounded-xl p-5 bg-white">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold mt-3">{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border rounded-xl bg-white p-5">
        <h2 className="text-lg font-semibold mb-3">
          বিক্রয়ের ধারা (গত {TREND_DAYS} দিন)
        </h2>
        <SalesChart data={salesTrend} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div>
          <h2 className="text-lg font-semibold mb-3">সবচেয়ে বেশি বিক্রিত পণ্য</h2>
          <div className="border rounded-xl overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">পণ্যের নাম</th>
                  <th className="p-3">বিক্রি হয়েছে</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={2} className="p-3 text-gray-400 text-center">
                      এখনো কোনো বিক্রি নেই
                    </td>
                  </tr>
                )}
                {topProducts.map((t) => (
                  <tr key={t.product?.id} className="border-t">
                    <td className="p-3">{t.product?.name || "মুছে ফেলা পণ্য"}</td>
                    <td className="p-3 font-medium">{t.sold} পিস</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">লো স্টক এলার্ট</h2>
          <div className="border rounded-xl overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">পণ্যের নাম</th>
                  <th className="p-3">বর্তমান স্টক</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.length === 0 && (
                  <tr>
                    <td colSpan={2} className="p-3 text-gray-400 text-center">
                      কোনো লো স্টক পণ্য নেই
                    </td>
                  </tr>
                )}
                {lowStockProducts.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3 text-red-600 font-medium">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
