// app/api/bkash/create-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bkashCreatePayment } from "@/lib/bkash";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    const callbackURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/bkash/execute-payment`;

    const payment = await bkashCreatePayment({
      amount: Number(order.totalAmount),
      orderId: order.id,
      callbackURL,
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        gateway: "BKASH",
        status: "INITIATED",
        rawResponse: payment,
      },
    });

    // bKash returns `bkashURL` for the client to redirect the user to
    return NextResponse.json({ bkashURL: payment.bkashURL, paymentID: payment.paymentID });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "bKash payment initiation failed" }, { status: 500 });
  }
}
