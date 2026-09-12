"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dispatchOrderToCourier } from "@/lib/dispatch-order";
import { refundOrderPayment } from "@/lib/refund-order";
import { sendOrderStatusEmail } from "@/lib/mail";
import { sendOrderStatusSMS } from "@/lib/sms";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
    throw new Error("Forbidden");
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, items: true },
  });
  if (!order) throw new Error("Order not found");

  const isCancelling = ["CANCELLED", "RETURNED"].includes(status);
  let paymentStatusUpdate: "REFUNDED" | undefined;

  if (isCancelling && order.paymentStatus === "PAID") {
    try {
      await refundOrderPayment(orderId);
      paymentStatusUpdate = "REFUNDED";
    } catch (err) {
      console.error("Automatic refund failed — handle manually:", err);
      // Status still updates below; payment stays PAID so it's visible for manual refund.
    }
  }

  if (isCancelling && order.status !== "CANCELLED" && order.status !== "RETURNED") {
    // Restock items once, only on the transition into a cancelled/returned state
    for (const item of order.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      } else {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as any,
      ...(paymentStatusUpdate ? { paymentStatus: paymentStatusUpdate } : {}),
    },
  });

  sendOrderStatusEmail(order.user.email, {
    orderNumber: order.orderNumber,
    status,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}`,
  }).catch((err) => console.error("Order status email failed:", err));

  if (order.user.phone) {
    sendOrderStatusSMS(order.user.phone, order.orderNumber, status).catch((err) =>
      console.error("Order status SMS failed:", err)
    );
  }

  revalidatePath("/admin/orders");
}

export async function dispatchOrder(orderId: string) {
  await requireAdmin();
  await dispatchOrderToCourier(orderId);
  revalidatePath("/admin/orders");
}
