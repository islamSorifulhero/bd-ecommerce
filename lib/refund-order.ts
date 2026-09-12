// lib/refund-order.ts
import { prisma } from "@/lib/prisma";
import { bkashRefundTransaction } from "@/lib/bkash";
import { sslcommerzRefund } from "@/lib/sslcommerz";

/**
 * Attempts an automatic refund through the original payment gateway.
 * COD orders have nothing to refund (no online payment was taken).
 * On any gateway error this throws — the caller decides whether to still
 * mark the order cancelled and handle the refund manually.
 */
export async function refundOrderPayment(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.paymentMethod === "COD" || order.paymentStatus !== "PAID") return null;

  const payment = order.payments.find((p) => p.status === "COMPLETED");
  if (!payment) throw new Error("কোনো সম্পন্ন পেমেন্ট পাওয়া যায়নি");

  let result;

  if (payment.gateway === "BKASH") {
    const raw = payment.rawResponse as any;
    result = await bkashRefundTransaction({
      paymentID: raw?.paymentID,
      trxID: payment.trxId!,
      amount: Number(payment.amount),
    });
  } else if (payment.gateway === "SSLCOMMERZ") {
    const raw = payment.rawResponse as any;
    result = await sslcommerzRefund({
      bankTranId: raw?.bank_tran_id,
      refundAmount: Number(payment.amount),
    });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "REFUNDED", rawResponse: { ...(payment.rawResponse as any), refund: result } },
  });

  return result;
}
