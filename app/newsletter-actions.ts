"use server";

import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function subscribeToNewsletter(email: string) {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    throw new Error("সঠিক ইমেইল দিন");
  }

  const ip = getClientIp(headers());
  const { allowed } = rateLimit(`newsletter:${ip}`, 5, 3600);
  if (!allowed) {
    throw new Error("অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।");
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: trimmed },
    update: { isActive: true },
    create: { email: trimmed },
  });
}
