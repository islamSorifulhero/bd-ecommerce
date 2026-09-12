// app/account/orders/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatBDT } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold mb-6">আমার অর্ডারসমূহ</h1>

      {orders.length === 0 && (
        <p className="text-gray-500">আপনার কোনো অর্ডার নেই।</p>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="block border rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">#{order.orderNumber}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("bn-BD")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatBDT(order.totalAmount.toString())}</p>
                <p className="text-xs text-gray-500">{order.status}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
