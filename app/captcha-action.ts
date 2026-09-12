"use server";

import { buildCaptcha, CaptchaChallenge } from "@/lib/captcha";

export async function getCaptchaChallenge(): Promise<CaptchaChallenge> {
  return buildCaptcha();
}
