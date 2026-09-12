"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateShippingCharge } from "@/lib/bd-locations";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { sendOrderConfirmationSMS } from "@/lib/sms";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";

export interface CheckoutInput {
  district: string;
  thana: string;
  fullAddress: string;
  paymentMethod: "COD" | "BKASH" | "SSLCOMMERZ";
  items: { productId: string; variantId?: string; quantity: number }[];
  couponCode?: string;
}

export async function validateCoupon(code: string, subtotal: number) {
  const ip = getClientIp(headers());
  const { allowed } = rateLimit(`coupon:${ip}`, 15, 300);
  if (!allowed) {
    throw new Error("অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।");
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon || !coupon.isActive) throw new Error("কুপন কোডটি সঠিক নয়");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new Error("কুপনের মেয়াদ শেষ হয়ে গেছে");
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new Error("কুপনটি আর ব্যবহার করা যাবে না");
  }
  if (subtotal < Number(coupon.minOrderAmount)) {
    throw new Error(`এই কুপন ব্যবহার করতে ন্যূনতম ৳${Number(coupon.minOrderAmount)} কেনাকাটা করতে হবে`);
  }

  const discount =
    coupon.type === "PERCENTAGE"
      ? Math.round((subtotal * Number(coupon.value)) / 100)
      : Number(coupon.value);

  return {
    code: coupon.code,
    discount: Math.min(discount, subtotal), // never exceed subtotal
  };
}

export async function createOrder(input: CheckoutInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("লগইন করা আবশ্যক");
  }

  // Throttle checkout submissions: 8 orders / 10 min per IP is generous for
  // a real shopper but stops scripted spam/stock-drain attempts.
  const ip = getClientIp(headers());
  const { allowed } = rateLimit(`checkout:${ip}`, 8, 600);
  if (!allowed) {
    throw new Error("অনেকবার অর্ডার করার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।");
  }

  if (input.items.length === 0) {
    throw new Error("কার্ট খালি");
  }

  // Re-fetch products + variants server-side to avoid trusting client-sent prices
  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) } },
    include: { variants: true },
  });

  let subtotal = 0;
  const orderItemsData = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error("পণ্য পাওয়া যায়নি");

    let price: number;
    let variantLabel: string | undefined;

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) throw new Error(`${product.name} এর ভ্যারিয়েন্ট পাওয়া যায়নি`);
      if (variant.stock < item.quantity) {
        throw new Error(`${product.name} (${variant.label}) এর জন্য পর্যাপ্ত স্টক নেই`);
      }
      price = variant.price ? Number(variant.price) : Number(product.discountPrice ?? product.price);
      variantLabel = variant.label;
    } else {
      if (product.stock < item.quantity) {
        throw new Error(`${product.name} এর জন্য পর্যাপ্ত স্টক নেই`);
      }
      price = Number(product.discountPrice ?? product.price);
    }

    subtotal += price * item.quantity;
    return {
      productId: product.id,
      variantId: item.variantId || null,
      variantLabel: variantLabel || null,
      quantity: item.quantity,
      price,
    };
  });

  const shippingCharge = calculateShippingCharge(input.district);

  let couponId: string | null = null;
  let discountAmount = 0;

  if (input.couponCode) {
    const result = await validateCoupon(input.couponCode, subtotal);
    discountAmount = result.discount;
    const coupon = await prisma.coupon.findUnique({ where: { code: result.code } });
    couponId = coupon!.id;
  }

  const totalAmount = Math.max(subtotal + shippingCharge - discountAmount, 0);

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      district: input.district,
      thana: input.thana,
      fullAddress: input.fullAddress,
    },
  });

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        totalAmount,
        shippingCharge,
        discountAmount,
        couponId,
        paymentMethod: input.paymentMethod,
        addressId: address.id,
        items: { create: orderItemsData },
      },
    });

    // Decrement stock — variant stock when a variant was chosen, else product stock
    for (const item of orderItemsData) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return created;
  });

  // COD orders are confirmed immediately — email/SMS now.
  // Online payments (bKash/SSLCommerz) get notified once payment actually
  // succeeds (see the execute-payment / ipn route handlers).
  if (input.paymentMethod === "COD") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    sendOrderConfirmationEmail(session.user.email!, {
      orderNumber: order.orderNumber,
      items: orderItemsData.map((i) => ({
        name:
          (products.find((p) => p.id === i.productId)?.name || "") +
          (i.variantLabel ? ` (${i.variantLabel})` : ""),
        quantity: i.quantity,
        price: i.price,
      })),
      totalAmount,
      orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}`,
    }).catch((err) => console.error("Order confirmation email failed:", err));

    if (user?.phone) {
      sendOrderConfirmationSMS(user.phone, order.orderNumber, totalAmount).catch((err) =>
        console.error("Order confirmation SMS failed:", err)
      );
    }
  }

  return order;
}
