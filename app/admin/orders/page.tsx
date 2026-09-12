// app/admin/orders/page.tsx
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import OrderRowControls from "./order-row-controls";

export const dynamic = "force-dynamic";

async function getOrders() {
  return prisma.order.findMany({
    include: { user: true, shipment: true, address: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">অর্ডার ম্যানেজমেন্ট</h1>

      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">অর্ডার নং</th>
              <th className="p-3">কাস্টমার</th>
              <th className="p-3">মোট</th>
              <th className="p-3">পেমেন্ট</th>
              <th className="p-3">স্ট্যাটাস</th>
              <th className="p-3">কুরিয়ার</th>
              <th className="p-3">একশন</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t align-top">
                <td className="p-3 font-medium">{order.orderNumber}</td>
                <td className="p-3">
                  {order.user.name}
                  <br />
                  <span className="text-gray-400 text-xs">{order.user.phone}</span>
                </td>
                <td className="p-3">{formatBDT(order.totalAmount.toString())}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.paymentStatus} ({order.paymentMethod})
                  </span>
                </td>
                <td className="p-3">
                  <OrderRowControls
                    orderId={order.id}
                    currentStatus={order.status}
                    statusOptions={STATUS_OPTIONS}
                    hasShipment={!!order.shipment}
                  />
                </td>
                <td className="p-3">
                  {order.shipment ? (
                    <span className="text-xs text-gray-600">
                      {order.shipment.status}
                      <br />
                      {order.shipment.trackingCode}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">বুক করা হয়নি</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-1 items-start">
                    <OrderRowControls.DispatchButton
                      orderId={order.id}
                      hasShipment={!!order.shipment}
                    />
                    <a
                      href={`/api/orders/${order.id}/invoice`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      ইনভয়েস
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
