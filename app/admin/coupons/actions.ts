"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
}

export interface NewCouponInput {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  expiresAt: string | null; // ISO date string
}

export async function createCoupon(input: NewCouponInput) {
  await requireAdmin();

  await prisma.coupon.create({
    data: {
      code: input.code.trim().toUpperCase(),
      type: input.type,
      value: input.value,
      minOrderAmount: input.minOrderAmount,
      maxUses: input.maxUses,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  });

  revalidatePath("/admin/coupons");
}

export async function toggleCouponActive(couponId: string, isActive: boolean) {
  await requireAdmin();
  await prisma.coupon.update({ where: { id: couponId }, data: { isActive } });
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(couponId: string) {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id: couponId } });
  revalidatePath("/admin/coupons");
}
