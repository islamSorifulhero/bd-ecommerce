// app/products/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductGallery from "./product-gallery";
import AddToCartControls from "./add-to-cart-controls";
import ReviewForm from "./review-form";
import StarRating from "@/components/star-rating";
import WishlistButton from "@/components/wishlist-button";
import CompareButton from "@/components/compare-button";
import { formatBDT } from "@/lib/utils";
import { auth } from "@/auth";
import Link from "next/link";
import Image from "next/image";

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });
  return product;
}

async function getRelatedProducts(categoryId: string, excludeId: string) {
  return prisma.product.findMany({
    where: { categoryId, id: { not: excludeId }, isActive: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return { title: "পণ্য পাওয়া যায়নি" };

  const description = product.description.slice(0, 155);
  const image = product.images[0];

  return {
    title: `${product.name} — BD Shop`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const [product, session] = await Promise.all([getProduct(params.slug), auth()]);
  if (!product || !product.isActive) notFound();

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  const hasVariants = product.variants.length > 0;
  const price = product.discountPrice ?? product.price;

  // When variants exist, total stock/status is the sum across variants;
  // the exact price/stock per variant is shown in AddToCartControls.
  const totalStock = hasVariants
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;
  const inStock = totalStock > 0;

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const myReview = session?.user?.id
    ? product.reviews.find((r) => r.userId === session.user.id)
    : undefined;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <ProductGallery images={product.images} name={product.name} />

      <div>
        <p className="text-sm text-gray-500">{product.category.name}</p>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.name}</h1>
          <div className="flex gap-2 shrink-0 mt-1">
            <CompareButton productId={product.id} className="border rounded-full p-2" />
            <WishlistButton
              product={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: Number(price),
                image: product.images[0] || "/placeholder.png",
              }}
              className="border rounded-full p-2"
            />
          </div>
        </div>

        {product.reviews.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={avgRating} />
            <span className="text-sm text-gray-500">
              {avgRating.toFixed(1)} ({product.reviews.length} টি রিভিউ)
            </span>
          </div>
        )}

        {!hasVariants && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-green-700">
              {formatBDT(price.toString())}
            </span>
            {product.discountPrice && (
              <span className="text-gray-400 line-through">
                {formatBDT(product.price.toString())}
              </span>
            )}
          </div>
        )}

        <div className="mt-3">
          {inStock ? (
            !hasVariants && (
              <span className="inline-block text-sm px-3 py-1 rounded-full bg-green-100 text-green-700">
                স্টকে আছে ({product.stock} পিস)
              </span>
            )
          ) : (
            <span className="inline-block text-sm px-3 py-1 rounded-full bg-red-100 text-red-700">
              স্টক নেই
            </span>
          )}
        </div>

        <p className="mt-6 text-gray-700 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>

        <AddToCartControls
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: Number(price),
            image: product.images[0] || "/placeholder.png",
            stock: product.stock,
            variants: product.variants.map((v) => ({
              id: v.id,
              label: v.label,
              price: v.price ? Number(v.price) : null,
              stock: v.stock,
            })),
          }}
        />
      </div>

      {/* Reviews section spans full width below the two columns */}
      <section className="md:col-span-2 border-t pt-8">
        <h2 className="text-lg font-bold mb-4">
          কাস্টমার রিভিউ ({product.reviews.length})
        </h2>

        {session?.user?.id ? (
          <div className="mb-6 max-w-md">
            <ReviewForm productId={product.id} />
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-6">
            রিভিউ দিতে হলে{" "}
            <Link href="/login" className="text-green-700 font-medium">
              লগইন
            </Link>{" "}
            করুন।
          </p>
        )}

        {myReview && (
          <p className="text-xs text-gray-400 mb-4">
            আপনি ইতিমধ্যে এই পণ্যের রিভিউ দিয়েছেন — উপরের ফর্ম আবার জমা দিলে তা আপডেট হবে।
          </p>
        )}

        <div className="space-y-4 max-w-2xl">
          {product.reviews.length === 0 && (
            <p className="text-sm text-gray-400">এখনো কোনো রিভিউ নেই।</p>
          )}
          {product.reviews.map((r) => (
            <div key={r.id} className="border-b pb-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{r.user.name}</span>
                <StarRating rating={r.rating} size={14} />
              </div>
              {r.comment && (
                <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(r.createdAt).toLocaleDateString("bn-BD")}
              </p>
            </div>
          ))}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="md:col-span-2 border-t pt-8">
          <h2 className="text-lg font-bold mb-4">আপনি এটাও পছন্দ করতে পারেন</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const rp = p.discountPrice ?? p.price;
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="relative w-full h-40 bg-gray-100">
                    <Image
                      src={p.images[0] || "/placeholder.png"}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                    <span className="text-green-700 font-semibold text-sm">
                      {formatBDT(rp.toString())}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
