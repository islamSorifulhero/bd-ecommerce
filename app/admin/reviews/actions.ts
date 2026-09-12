"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteReview(reviewId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");

  await prisma.review.delete({ where: { id: reviewId } });
  revalidatePath("/admin/reviews");
}
