// app/api/sslcommerz/init/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const SSLCOMMERZ_BASE_URL =
  process.env.SSLCOMMERZ_IS_LIVE === "true"
    ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
    : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { address: true, user: true },
  });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const payload = new URLSearchParams({
    store_id: process.env.SSLCOMMERZ_STORE_ID!,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD!,
    total_amount: order.totalAmount.toString(),
    currency: "BDT",
    tran_id: order.orderNumber,
    success_url: `${appUrl}/api/sslcommerz/ipn?status=success`,
    fail_url: `${appUrl}/api/sslcommerz/ipn?status=fail`,
    cancel_url: `${appUrl}/api/sslcommerz/ipn?status=cancel`,
    ipn_url: `${appUrl}/api/sslcommerz/ipn`,
    cus_name: order.user.name,
    cus_email: order.user.email,
    cus_phone: order.user.phone || "01700000000",
    cus_add1: order.address.fullAddress,
    cus_city: order.address.district,
    cus_country: "Bangladesh",
    shipping_method: "Courier",
    product_name: `Order ${order.orderNumber}`,
    product_category: "General",
    product_profile: "general",
    value_a: order.id, // pass our internal orderId through for the IPN handler
  });

  try {
    const res = await fetch(SSLCOMMERZ_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload.toString(),
    });
    const data = await res.json();

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        gateway: "SSLCOMMERZ",
        status: "INITIATED",
        rawResponse: data,
      },
    });

    return NextResponse.json({ gatewayUrl: data.GatewayPageURL });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "SSLCommerz init failed" }, { status: 500 });
  }
}
