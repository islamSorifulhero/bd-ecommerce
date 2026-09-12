"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface ReorderItem {
  productId: string;
  variantId?: string;
  variantLabel?: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  stock: number;
}

export interface ReorderResult {
  items: ReorderItem[];
  skipped: string[]; // names of items that are now out of stock / removed
}

export async function getReorderItems(orderId: string): Promise<ReorderResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("লগইন করা আবশ্যক");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true, variant: true } } },
  });

  if (!order || order.userId !== session.user.id) {
    throw new Error("অর্ডার পাওয়া যায়নি");
  }

  const items: ReorderItem[] = [];
  const skipped: string[] = [];

  for (const item of order.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      skipped.push(product?.name || "একটি পণ্য");
      continue;
    }

    if (item.variantId) {
      const variant = item.variant;
      if (!variant || variant.stock === 0) {
        skipped.push(`${product.name}${item.variantLabel ? ` (${item.variantLabel})` : ""}`);
        continue;
      }
      items.push({
        productId: product.id,
        variantId: variant.id,
        variantLabel: variant.label,
        name: product.name,
        slug: product.slug,
        price: variant.price ? Number(variant.price) : Number(product.discountPrice ?? product.price),
        image: product.images[0] || "/placeholder.png",
        stock: variant.stock,
      });
    } else {
      if (product.stock === 0) {
        skipped.push(product.name);
        continue;
      }
      items.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.discountPrice ?? product.price),
        image: product.images[0] || "/placeholder.png",
        stock: product.stock,
      });
    }
  }

  return { items, skipped };
}
