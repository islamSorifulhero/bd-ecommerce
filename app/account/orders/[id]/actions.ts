"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { refundOrderPayment } from "@/lib/refund-order";
import { sendOrderStatusSMS } from "@/lib/sms";
import { revalidatePath } from "next/cache";

export async function cancelOrder(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("লগইন করা আবশ্যক");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });

  if (!order || order.userId !== session.user.id) {
    throw new Error("অর্ডার পাওয়া যায়নি");
  }

  // Customers may only self-cancel while the order hasn't shipped yet
  if (!["PENDING", "CONFIRMED"].includes(order.status)) {
    throw new Error("এই অর্ডারটি আর বাতিল করা সম্ভব নয়। সাপোর্টে যোগাযোগ করুন।");
  }

  let paymentStatusUpdate: "REFUNDED" | undefined;
  if (order.paymentStatus === "PAID") {
    try {
      await refundOrderPayment(orderId);
      paymentStatusUpdate = "REFUNDED";
    } catch (err) {
      console.error("Automatic refund failed — support must refund manually:", err);
      // Order still gets cancelled below; paymentStatus stays PAID so admins
      // can see it needs a manual refund.
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        ...(paymentStatusUpdate ? { paymentStatus: paymentStatusUpdate } : {}),
      },
    });

    // Restock items — variant stock when a variant was chosen, else product stock
    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  });

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/orders");

  if (order.user.phone) {
    sendOrderStatusSMS(order.user.phone, order.orderNumber, "CANCELLED").catch((err) =>
      console.error("Order cancellation SMS failed:", err)
    );
  }
}
