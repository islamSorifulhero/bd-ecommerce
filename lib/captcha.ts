// lib/captcha.ts
// Self-contained math CAPTCHA — no external API/keys needed. The "answer" is
// embedded in a signed token handed to the client, so no server-side session
// storage is required; verification just re-checks the HMAC signature.
import crypto from "crypto";

const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 minutes
const SECRET = process.env.AUTH_SECRET || "dev-fallback-secret-change-me";

function sign(payload: string) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

function buildInternal() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const answer = a + b;
  const expiresAt = Date.now() + CAPTCHA_TTL_MS;

  const payload = `${answer}:${expiresAt}`;
  const signature = sign(payload);
  const token = Buffer.from(`${payload}:${signature}`).toString("base64");

  return { question: `${a} + ${b} = ?`, token, answer: String(answer) };
}

export interface CaptchaChallenge {
  question: string;
  token: string;
}

export function buildCaptcha(): CaptchaChallenge {
  const { question, token } = buildInternal();
  return { question, token };
}

/**
 * Server-internal only — e.g. auto-login right after a successful
 * registration. Never expose the returned `answer` in a context an
 * unauthenticated request could replay as a generic login bypass; it's only
 * meant to complete one immediate, server-initiated signIn() call.
 */
export function buildSolvedCaptcha(): { token: string; answer: string } {
  const { token, answer } = buildInternal();
  return { token, answer };
}

export function verifyCaptcha(token: string, userAnswer: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const [answer, expiresAtStr, signature] = decoded.split(":");
    const expiresAt = parseInt(expiresAtStr, 10);

    if (Date.now() > expiresAt) return false;
    if (sign(`${answer}:${expiresAtStr}`) !== signature) return false;

    return parseInt(userAnswer, 10) === parseInt(answer, 10);
  } catch {
    return false;
  }
}
