"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ImportRow {
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stock?: number;
  categorySlug: string;
  images?: string; // semicolon-separated URLs
  isFeatured?: boolean;
}

export interface ImportResult {
  createdOrUpdated: number;
  errors: { row: number; message: string }[];
}

export async function bulkImportProducts(rows: ImportRow[]): Promise<ImportResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");

  const categories = await prisma.category.findMany();
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  const errors: ImportResult["errors"] = [];
  let count = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +1 for 0-index, +1 for the CSV header row

    if (!row.name || !row.slug || !row.price || !row.categorySlug) {
      errors.push({ row: rowNum, message: "নাম, স্লাগ, দাম, ক্যাটাগরি স্লাগ আবশ্যক" });
      continue;
    }

    const category = categoryBySlug.get(row.categorySlug.trim());
    if (!category) {
      errors.push({ row: rowNum, message: `ক্যাটাগরি "${row.categorySlug}" পাওয়া যায়নি` });
      continue;
    }

    try {
      await prisma.product.upsert({
        where: { slug: row.slug.trim() },
        update: {
          name: row.name,
          description: row.description || "",
          price: row.price,
          discountPrice: row.discountPrice || null,
          stock: row.stock ?? 0,
          categoryId: category.id,
          images: row.images ? row.images.split(";").map((s) => s.trim()).filter(Boolean) : [],
          isFeatured: !!row.isFeatured,
        },
        create: {
          name: row.name,
          slug: row.slug.trim(),
          description: row.description || "",
          price: row.price,
          discountPrice: row.discountPrice || null,
          stock: row.stock ?? 0,
          categoryId: category.id,
          images: row.images ? row.images.split(";").map((s) => s.trim()).filter(Boolean) : [],
          isFeatured: !!row.isFeatured,
        },
      });
      count++;
    } catch (err) {
      errors.push({ row: rowNum, message: err instanceof Error ? err.message : "অজানা ত্রুটি" });
    }
  }

  revalidatePath("/admin/products");
  return { createdOrUpdated: count, errors };
}
