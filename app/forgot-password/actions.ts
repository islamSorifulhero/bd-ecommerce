"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";

const TOKEN_TTL_MINUTES = 30;

export async function requestPasswordReset(email: string) {
  const ip = getClientIp(headers());
  const { allowed } = rateLimit(`forgot-password:${ip}`, 5, 900);
  if (!allowed) return; // silently drop — same response either way, see below

  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same way whether or not the user exists,
  // to avoid leaking which emails are registered.
  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;
  await sendPasswordResetEmail(user.email, resetUrl);
}

export async function resetPassword(token: string, newPassword: string) {
  if (newPassword.length < 6) {
    throw new Error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw new Error("লিংকটি মেয়াদোত্তীর্ণ অথবা অবৈধ। আবার চেষ্টা করুন।");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ]);
}
