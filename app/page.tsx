// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { formatBDT } from "@/lib/utils";
import NewsletterForm from "@/components/newsletter-form";

export const revalidate = 60; // ISR: refresh every 60s

async function getHomeData() {
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({ take: 8 }),
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { categories, featuredProducts };
}

export default async function HomePage() {
  const { categories, featuredProducts } = await getHomeData();

  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-green-700 to-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              বাংলাদেশের বিশ্বস্ত অনলাইন শপ
            </h1>
            <p className="mt-4 text-white/90 text-lg">
              সারাদেশে দ্রুত ডেলিভারি, ক্যাশ অন ডেলিভারি সুবিধা, এবং সেরা দামে
              পণ্য কিনুন।
            </p>
            <Link
              href="/products"
              className="inline-block mt-6 bg-white text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100"
            >
              এখনই কেনাকাটা করুন
            </Link>
          </div>
          <div className="relative h-64 md:h-80">
            <Image
              src="/hero-banner.jpg"
              alt="Hero banner"
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">ক্যাটাগরি সমূহ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group border dark:border-gray-800 rounded-lg p-4 text-center hover:shadow-md transition"
            >
              <div className="relative w-full h-24 mb-2">
                <Image
                  src={cat.image || "/placeholder.png"}
                  alt={cat.name}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="font-medium group-hover:text-green-700 dark:group-hover:text-green-500">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">জনপ্রিয় পণ্য</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((p) => {
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
                </div>
                <div className="p-3">
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
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Truck, label: "দ্রুত ডেলিভারি" },
            { icon: ShieldCheck, label: "নিরাপদ পেমেন্ট" },
            { icon: RotateCcw, label: "সহজ রিটার্ন" },
            { icon: Headphones, label: "২৪/৭ সাপোর্ট" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-8 h-8 text-green-700 dark:text-green-500" />
              <p className="font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="text-white font-semibold mb-3">আমাদের শপ</h3>
            <p>বাংলাদেশ জুড়ে বিশ্বস্ত ই-কমার্স সেবা।</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">লিংকসমূহ</h3>
            <ul className="space-y-1">
              <li><Link href="/products">সকল পণ্য</Link></li>
              <li><Link href="/about">আমাদের সম্পর্কে</Link></li>
              <li><Link href="/contact">যোগাযোগ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">যোগাযোগ</h3>
            <p>ইমেইল: support@example.com</p>
            <p>ফোন: +৮৮০১XXXXXXXXX</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">নিউজলেটার</h3>
            <p className="mb-2">নতুন পণ্য ও অফারের খবর পেতে সাবস্ক্রাইব করুন।</p>
            <NewsletterForm />
          </div>
        </div>
        <p className="text-center text-xs mt-8 text-gray-500">
          &copy; {new Date().getFullYear()} সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </main>
  );
}
