// app/api/sslcommerz/ipn/route.ts
// SSLCommerz posts transaction data here (IPN) AND redirects the browser here
// via success/fail/cancel URLs. We validate the transaction server-to-server
// before trusting it, per SSLCommerz's recommended flow.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispatchOrderToCourier } from "@/lib/dispatch-order";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { sendOrderConfirmationSMS } from "@/lib/sms";

const VALIDATION_URL =
  process.env.SSLCOMMERZ_IS_LIVE === "true"
    ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
    : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

async function handleIPN(params: URLSearchParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const valId = params.get("val_id");
  const orderId = params.get("value_a");

  if (!valId || !orderId) {
    return NextResponse.redirect(`${appUrl}/checkout?error=invalid_ipn`);
  }

  const verifyUrl = `${VALIDATION_URL}?val_id=${valId}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWORD}&format=json`;
  const verifyRes = await fetch(verifyUrl);
  const verifyData = await verifyRes.json();

  if (verifyData.status !== "VALID" && verifyData.status !== "VALIDATED") {
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status: "FAILED", rawResponse: verifyData },
    });
    return NextResponse.redirect(`${appUrl}/checkout?error=payment_failed`);
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID", status: "CONFIRMED" },
    include: { items: { include: { product: true } }, user: true },
  });

  await prisma.payment.updateMany({
    where: { orderId },
    data: {
      trxId: verifyData.tran_id,
      status: "COMPLETED",
      rawResponse: verifyData,
    },
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

  try {
    await dispatchOrderToCourier(order.id);
  } catch (courierErr) {
    console.error("Steadfast auto-dispatch failed:", courierErr);
  }

  return NextResponse.redirect(`${appUrl}/account/orders/${order.id}?success=1`);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params = new URLSearchParams();
  formData.forEach((value, key) => params.append(key, value.toString()));
  return handleIPN(params);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return handleIPN(searchParams);
}
