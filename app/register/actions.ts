"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { verifyCaptcha, buildSolvedCaptcha } from "@/lib/captcha";

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  captchaToken: string;
  captchaAnswer: string;
}

export async function registerUser(input: RegisterInput) {
  const ip = getClientIp(headers());
  const { allowed } = rateLimit(`register:${ip}`, 5, 3600);
  if (!allowed) {
    throw new Error("অনেকবার অ্যাকাউন্ট তৈরির চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।");
  }

  if (!verifyCaptcha(input.captchaToken, input.captchaAnswer)) {
    throw new Error("ক্যাপচার উত্তর সঠিক নয়। আবার চেষ্টা করুন।");
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("এই ইমেইল দিয়ে আগে থেকেই একটি অ্যাকাউন্ট আছে");
  }

  const existingPhone = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existingPhone) {
    throw new Error("এই ফোন নম্বর দিয়ে আগে থেকেই একটি অ্যাকাউন্ট আছে");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
      role: "CUSTOMER",
    },
  });

  // Hand the client a freshly solved captcha so it can immediately complete
  // one signIn() call for auto-login, without asking the person to solve
  // another puzzle right after they just solved one to register.
  const autoLogin = buildSolvedCaptcha();

  return { id: user.id, email: user.email, autoLogin };
}
