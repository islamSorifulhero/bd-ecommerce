// app/products/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatBDT } from "@/lib/utils";
import WishlistButton from "@/components/wishlist-button";
import CompareButton from "@/components/compare-button";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { category?: string; q?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  if (searchParams.q) {
    return { title: `"${searchParams.q}" এর ফলাফল — BD Shop` };
  }
  if (searchParams.category) {
    const category = await prisma.category.findUnique({
      where: { slug: searchParams.category },
    });
    if (category) return { title: `${category.name} — BD Shop` };
  }
  return { title: "সকল পণ্য — BD Shop" };
}

async function getData(searchParams: Props["searchParams"]) {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(searchParams.category ? { category: { slug: searchParams.category } } : {}),
        ...(searchParams.q
          ? { name: { contains: searchParams.q, mode: "insensitive" } }
          : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
  ]);
  return { categories, products };
}

export default async function ProductsPage({ searchParams }: Props) {
  const { categories, products } = await getData(searchParams);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="md:w-56 shrink-0">
          <form action="/products" method="get" className="mb-6">
            <input
              type="text"
              name="q"
              placeholder="পণ্য খুঁজুন..."
              defaultValue={searchParams.q}
              className="w-full border dark:border-gray-700 dark:bg-gray-900 rounded-lg p-2 text-sm"
            />
          </form>

          <h3 className="font-semibold mb-3">ক্যাটাগরি</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href="/products"
                className={`block px-2 py-1 rounded ${
                  !searchParams.category ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400" : ""
                }`}
              >
                সকল পণ্য
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/products?category=${c.slug}`}
                  className={`block px-2 py-1 rounded ${
                    searchParams.category === c.slug
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                      : ""
                  }`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-6">
            {searchParams.q
              ? `"${searchParams.q}" এর ফলাফল`
              : categories.find((c) => c.slug === searchParams.category)?.name ||
                "সকল পণ্য"}{" "}
            <span className="text-gray-400 font-normal text-sm">
              ({products.length} টি পণ্য)
            </span>
          </h1>

          {products.length === 0 && (
            <p className="text-gray-500">কোনো পণ্য পাওয়া যায়নি।</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((p) => {
              const price = p.discountPrice ?? p.price;
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="border dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={p.images[0] || "/placeholder.png"}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                    {p.stock === 0 && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                        স্টক নেই
                      </span>
                    )}
                    <WishlistButton
                      product={{
                        productId: p.id,
                        name: p.name,
                        slug: p.slug,
                        price: Number(price),
                        image: p.images[0] || "/placeholder.png",
                      }}
                      className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 rounded-full p-1.5 shadow"
                    />
                    <CompareButton
                      productId={p.id}
                      className="absolute top-2 right-11 bg-white/90 dark:bg-gray-900/90 rounded-full p-1.5 shadow"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-400">{p.category.name}</p>
                    <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-green-700 dark:text-green-500 font-semibold">
                        {formatBDT(price.toString())}
                      </span>
                      {p.discountPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatBDT(p.price.toString())}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
