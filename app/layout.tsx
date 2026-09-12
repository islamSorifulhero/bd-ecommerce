// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import CartDrawer from "@/components/cart-drawer";
import Providers from "@/components/providers";
import WhatsAppButton from "@/components/whatsapp-button";

export const metadata: Metadata = {
  title: "BD Shop — বাংলাদেশের অনলাইন শপ",
  description: "সারাদেশে দ্রুত ডেলিভারি সহ অনলাইন শপিং",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <Providers>
          <Header />
          {children}
          <CartDrawer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
