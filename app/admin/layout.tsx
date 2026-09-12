// app/admin/layout.tsx
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package, PlusCircle, Star, Tag, Mail } from "lucide-react";
import { auth } from "@/auth";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard, adminOnly: false },
  { href: "/admin/orders", label: "অর্ডারসমূহ", icon: ShoppingBag, adminOnly: false },
  { href: "/admin/products", label: "পণ্যসমূহ", icon: Package, adminOnly: true },
  { href: "/admin/products/new", label: "নতুন পণ্য", icon: PlusCircle, adminOnly: true },
  { href: "/admin/coupons", label: "কুপন", icon: Tag, adminOnly: true },
  { href: "/admin/reviews", label: "রিভিউ", icon: Star, adminOnly: true },
  { href: "/admin/subscribers", label: "নিউজলেটার", icon: Mail, adminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isFullAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r bg-white hidden md:block">
        <div className="h-16 flex items-center px-6 font-bold text-lg border-b">
          অ্যাডমিন প্যানেল
        </div>
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.filter((item) => isFullAdmin || !item.adminOnly).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 bg-gray-50">{children}</div>
    </div>
  );
}
