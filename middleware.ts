// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const LOGIN_PATH = "/api/auth/callback/credentials";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Basic brute-force throttle on the login endpoint: 10 attempts / 5 min / IP.
  // This is a blunt first line of defense — pair it with account lockouts or
  // a CAPTCHA if you see real abuse.
  if (pathname === LOGIN_PATH && req.method === "POST") {
    const ip = getClientIp(req.headers);
    const { allowed, retryAfterSeconds } = rateLimit(`login:${ip}`, 10, 300);
    if (!allowed) {
      return NextResponse.json(
        { error: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }
    return NextResponse.next();
  }

  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAdminRoute = pathname.startsWith("/admin");
  const isCustomerRoute =
    pathname.startsWith("/checkout") || pathname.startsWith("/account");

  // Admin routes -> must be logged in AND role === ADMIN/STAFF
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + pathname, req.url));
    }
    if (role !== "ADMIN" && role !== "STAFF") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Customer-only routes -> must be logged in (any role)
  if (isCustomerRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login?callbackUrl=" + pathname, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/account/:path*", "/api/auth/callback/credentials"],
};
