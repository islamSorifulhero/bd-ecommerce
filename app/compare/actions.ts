"use server";

import { prisma } from "@/lib/prisma";

export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  discountPrice: number | null;
  categoryName: string;
  stock: number;
  avgRating: number;
  reviewCount: number;
  description: string;
}

export async function getCompareProducts(ids: string[]): Promise<CompareProduct[]> {
  if (ids.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { category: true, reviews: true, variants: true },
  });

  // Preserve the order the user added them in
  return ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;
      const totalStock =
        p.variants.length > 0 ? p.variants.reduce((sum, v) => sum + v.stock, 0) : p.stock;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images[0] || "/placeholder.png",
        price: Number(p.price),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        categoryName: p.category.name,
        stock: totalStock,
        avgRating,
        reviewCount: p.reviews.length,
        description: p.description,
      };
    });
}
