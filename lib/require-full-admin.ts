// lib/require-full-admin.ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Use at the top of a page.tsx for sections STAFF accounts shouldn't reach
 * (products, coupons, review moderation). Order management stays open to
 * both ADMIN and STAFF — only call this where it should be ADMIN-only.
 */
export async function requireFullAdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/admin/dashboard");
  }
}
