"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitReview(
  productId: string,
  rating: number,
  comment: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("লগইন করা আবশ্যক");

  if (rating < 1 || rating > 5) throw new Error("রেটিং ১ থেকে ৫ এর মধ্যে হতে হবে");

  // Only customers who have an order containing this product may review it
  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId: session.user.id, paymentStatus: { in: ["PAID"] } },
    },
  });

  const codPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId: session.user.id,
        paymentMethod: "COD",
        status: { in: ["DELIVERED", "SHIPPED", "PROCESSING", "CONFIRMED"] },
      },
    },
  });

  if (!purchased && !codPurchased) {
    throw new Error("রিভিউ দেওয়ার জন্য আগে পণ্যটি কিনতে হবে");
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("পণ্য পাওয়া যায়নি");

  await prisma.review.upsert({
    where: { productId_userId: { productId, userId: session.user.id } },
    update: { rating, comment },
    create: { productId, userId: session.user.id, rating, comment },
  });

  revalidatePath(`/products/${product.slug}`);
}
