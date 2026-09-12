// app/api/bkash/execute-payment/route.ts
// bKash redirects the customer's browser here with ?paymentID=...&status=...
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bkashExecutePayment } from "@/lib/bkash";
import { dispatchOrderToCourier } from "@/lib/dispatch-order";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { sendOrderConfirmationSMS } from "@/lib/sms";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentID = searchParams.get("paymentID");
  const status = searchParams.get("status");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!paymentID) {
    return NextResponse.redirect(`${appUrl}/checkout?error=missing_payment_id`);
  }

  // User cancelled or payment failed on bKash's side
  if (status === "cancel" || status === "failure") {
    return NextResponse.redirect(`${appUrl}/checkout?error=payment_${status}`);
  }

  try {
    const result = await bkashExecutePayment(paymentID);

    if (result.transactionStatus !== "Completed") {
      return NextResponse.redirect(`${appUrl}/checkout?error=payment_incomplete`);
    }

    const orderId = result.payerReference; // we set payerReference = orderId on create
    const trxId = result.trxID;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", status: "CONFIRMED" },
      include: { items: { include: { product: true } }, user: true },
    });

    await prisma.payment.updateMany({
      where: { orderId },
      data: { trxId, status: "COMPLETED", rawResponse: result },
    });

    sendOrderConfirmationEmail(order.user.email, {
      orderNumber: order.orderNumber,
      items: order.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: Number(i.price),
      })),
      totalAmount: Number(order.totalAmount),
      orderUrl: `${appUrl}/account/orders/${order.id}`,
    }).catch((err) => console.error("Order confirmation email failed:", err));

    if (order.user.phone) {
      sendOrderConfirmationSMS(order.user.phone, order.orderNumber, Number(order.totalAmount)).catch(
        (err) => console.error("Order confirmation SMS failed:", err)
      );
    }

    // Automatically book courier shipment now that payment is confirmed
    try {
      await dispatchOrderToCourier(order.id);
    } catch (courierErr) {
      // Payment succeeded even if courier booking fails — log for manual dispatch
      console.error("Steadfast auto-dispatch failed:", courierErr);
    }

    return NextResponse.redirect(
      `${appUrl}/account/orders/${order.id}?success=1`
    );
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(`${appUrl}/checkout?error=payment_execute_failed`);
  }
}
