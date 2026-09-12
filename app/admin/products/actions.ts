"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export interface VariantInput {
  id?: string; // present when editing an existing variant
  label: string;
  price?: number;
  stock: number;
}

export interface NewProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  categoryId: string;
  images: string[];
  isFeatured: boolean;
  variants: VariantInput[];
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
}

export async function createProduct(input: NewProductInput) {
  await requireAdmin();

  await prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: input.price,
      discountPrice: input.discountPrice || null,
      stock: input.stock,
      categoryId: input.categoryId,
      images: input.images,
      isFeatured: input.isFeatured,
      variants: {
        create: input.variants
          .filter((v) => v.label.trim())
          .map((v) => ({ label: v.label, price: v.price ?? null, stock: v.stock })),
      },
    },
  });

  redirect("/admin/products");
}

export async function updateProduct(productId: string, input: NewProductInput) {
  await requireAdmin();

  const existingVariants = await prisma.productVariant.findMany({
    where: { productId },
    select: { id: true },
  });
  const existingIds = new Set(existingVariants.map((v) => v.id));
  const keepIds = new Set(input.variants.filter((v) => v.id).map((v) => v.id!));
  const toDelete = [...existingIds].filter((id) => !keepIds.has(id));

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        price: input.price,
        discountPrice: input.discountPrice || null,
        stock: input.stock,
        categoryId: input.categoryId,
        images: input.images,
        isFeatured: input.isFeatured,
      },
    }),
    ...(toDelete.length > 0
      ? [prisma.productVariant.deleteMany({ where: { id: { in: toDelete } } })]
      : []),
    ...input.variants
      .filter((v) => v.label.trim())
      .map((v) =>
        v.id
          ? prisma.productVariant.update({
              where: { id: v.id },
              data: { label: v.label, price: v.price ?? null, stock: v.stock },
            })
          : prisma.productVariant.create({
              data: {
                productId,
                label: v.label,
                price: v.price ?? null,
                stock: v.stock,
              },
            })
      ),
  ]);

  redirect("/admin/products");
}

export async function getProductForEdit(productId: string) {
  await requireAdmin();
  return prisma.product.findUnique({ where: { id: productId }, include: { variants: true } });
}
