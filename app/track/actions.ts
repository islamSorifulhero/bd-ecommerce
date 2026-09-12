"use server";

import { prisma } from "@/lib/prisma";

export interface TrackResult {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: { name: string; variantLabel: string | null; quantity: number }[];
  shipment: { status: string; trackingCode: string | null; courierName: string } | null;
}

export async function trackOrder(orderNumber: string, phone: string): Promise<TrackResult> {
  const cleanOrderNumber = orderNumber.trim().toUpperCase();
  const cleanPhone = phone.replace(/\D/g, "").slice(-10); // match last 10 digits

  const order = await prisma.order.findUnique({
    where: { orderNumber: cleanOrderNumber },
    include: {
      user: true,
      items: { include: { product: true } },
      shipment: true,
    },
  });

  if (!order || !order.user.phone || !order.user.phone.replace(/\D/g, "").endsWith(cleanPhone)) {
    throw new Error("অর্ডার নম্বর ও ফোন নম্বর মিলছে না। আবার চেষ্টা করুন।");
  }

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      name: i.product.name,
      variantLabel: i.variantLabel,
      quantity: i.quantity,
    })),
    shipment: order.shipment
      ? {
          status: order.shipment.status,
          trackingCode: order.shipment.trackingCode,
          courierName: order.shipment.courierName,
        }
      : null,
  };
}
