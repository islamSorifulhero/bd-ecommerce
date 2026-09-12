// lib/dispatch-order.ts
import { prisma } from "@/lib/prisma";
import { steadfastCreateOrder } from "@/lib/steadfast";

export async function dispatchOrderToCourier(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { address: true, user: true, shipment: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.shipment) return order.shipment; // already booked

  const codAmount =
    order.paymentMethod === "COD" ? Number(order.totalAmount) : 0;

  const result = await steadfastCreateOrder({
    invoice: order.orderNumber,
    recipient_name: order.user.name,
    recipient_phone: order.user.phone || "01700000000",
    recipient_address: `${order.address.fullAddress}, ${order.address.thana}, ${order.address.district}`,
    cod_amount: codAmount,
    note: `Order ${order.orderNumber}`,
  });

  const shipment = await prisma.shipment.create({
    data: {
      orderId: order.id,
      consignmentId: result?.consignment?.consignment_id?.toString(),
      trackingCode: result?.consignment?.tracking_code,
      status: "BOOKED",
      rawResponse: result,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PROCESSING" },
  });

  return shipment;
}
