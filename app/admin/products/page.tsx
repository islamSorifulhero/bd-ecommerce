// app/admin/products/page.tsx
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import ProductRowActions from "./product-row-actions";
import { requireFullAdminPage } from "@/lib/require-full-admin";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireFullAdminPage();
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">পণ্যসমূহ</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/products/import"
            className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            CSV ইমপোর্ট
          </Link>
          <Link
            href="/admin/products/new"
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            + নতুন পণ্য
          </Link>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">পণ্য</th>
              <th className="p-3">ক্যাটাগরি</th>
              <th className="p-3">দাম</th>
              <th className="p-3">স্টক</th>
              <th className="p-3">স্ট্যাটাস</th>
              <th className="p-3">একশন</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0">
                      <Image
                        src={p.images[0] || "/placeholder.png"}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="line-clamp-1">{p.name}</span>
                  </div>
                </td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3">{formatBDT(p.price.toString())}</td>
                <td className="p-3">
                  <span className={p.stock <= 5 ? "text-red-600 font-medium" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p.isActive ? "একটিভ" : "নিষ্ক্রিয়"}
                  </span>
                </td>
                <td className="p-3">
                  <ProductRowActions productId={p.id} isActive={p.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
