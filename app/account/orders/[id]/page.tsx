// app/account/orders/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { formatBDT } from "@/lib/utils";
import { CheckCircle2, Download } from "lucide-react";
import CancelOrderButton from "./cancel-order-button";
import ReorderButton from "./reorder-button";

interface Props {
  params: { id: string };
  searchParams: { success?: string };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "পেন্ডিং",
  CONFIRMED: "কনফার্মড",
  PROCESSING: "প্রসেসিং",
  SHIPPED: "শিপড",
  DELIVERED: "ডেলিভারড",
  CANCELLED: "বাতিল",
  RETURNED: "রিটার্ন করা হয়েছে",
};

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/account/orders/${params.id}`);

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: true } },
      address: true,
      shipment: true,
      payments: true,
    },
  });

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {searchParams.success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">অর্ডার #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString("bn-BD", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <a
          href={`/api/orders/${order.id}/invoice`}
          className="text-sm border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> ইনভয়েস ডাউনলোড করুন
        </a>
        <ReorderButton orderId={order.id} />
        {["PENDING", "CONFIRMED"].includes(order.status) && (
          <CancelOrderButton orderId={order.id} />
        )}
      </div>

      <div className="border rounded-lg divide-y mb-6">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between p-4 text-sm">
            <div>
              <p className="font-medium">{item.product.name}</p>
              {item.variantLabel && (
                <p className="text-gray-400 text-xs">{item.variantLabel}</p>
              )}
              <p className="text-gray-500">পরিমাণ: {item.quantity}</p>
            </div>
            <span>{formatBDT(Number(item.price) * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-2">শিপিং ঠিকানা</h2>
          <p className="text-sm text-gray-700">
            {order.address.fullAddress}, {order.address.thana}, {order.address.district}
          </p>

          {order.shipment && (
            <>
              <h2 className="font-semibold mb-2 mt-4">কুরিয়ার তথ্য</h2>
              <p className="text-sm text-gray-700">
                স্ট্যাটাস: {order.shipment.status}
                <br />
                ট্র্যাকিং কোড: {order.shipment.trackingCode || "—"}
              </p>
            </>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-2">পেমেন্ট</h2>
          <p className="text-sm text-gray-700">
            পদ্ধতি: {order.paymentMethod}
            <br />
            স্ট্যাটাস: {order.paymentStatus}
          </p>

          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>সাবটোটাল</span>
              <span>
                {formatBDT(
                  Number(order.totalAmount) -
                    Number(order.shippingCharge) +
                    Number(order.discountAmount)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>শিপিং চার্জ</span>
              <span>{formatBDT(order.shippingCharge.toString())}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-700">
                <span>ডিসকাউন্ট</span>
                <span>-{formatBDT(order.discountAmount.toString())}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-1">
              <span>সর্বমোট</span>
              <span>{formatBDT(order.totalAmount.toString())}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
