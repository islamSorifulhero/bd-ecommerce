"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { useCompareStore } from "@/lib/store/compare-store";
import { useCartStore } from "@/lib/store/cart-store";
import { getCompareProducts, CompareProduct } from "./actions";
import { formatBDT } from "@/lib/utils";
import StarRating from "@/components/star-rating";

export default function ComparePage() {
  const { productIds, removeProduct } = useCompareStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCompareProducts(productIds).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [productIds]);

  if (!loading && products.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">তুলনা করার জন্য কোনো পণ্য যোগ করা হয়নি।</p>
        <Link href="/products" className="text-green-700 font-medium mt-2 inline-block">
          পণ্য ব্রাউজ করুন
        </Link>
      </main>
    );
  }

  const rows: { label: string; render: (p: CompareProduct) => React.ReactNode }[] = [
    {
      label: "দাম",
      render: (p) => (
        <div>
          <span className="text-green-700 font-semibold">
            {formatBDT(p.discountPrice ?? p.price)}
          </span>
          {p.discountPrice && (
            <span className="text-xs text-gray-400 line-through ml-2">
              {formatBDT(p.price)}
            </span>
          )}
        </div>
      ),
    },
    { label: "ক্যাটাগরি", render: (p) => p.categoryName },
    {
      label: "রেটিং",
      render: (p) =>
        p.reviewCount > 0 ? (
          <div className="flex items-center gap-1">
            <StarRating rating={p.avgRating} size={14} />
            <span className="text-xs text-gray-500">({p.reviewCount})</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">কোনো রিভিউ নেই</span>
        ),
    },
    {
      label: "স্টক",
      render: (p) =>
        p.stock > 0 ? (
          <span className="text-green-700 text-sm">স্টকে আছে ({p.stock})</span>
        ) : (
          <span className="text-red-600 text-sm">স্টক নেই</span>
        ),
    },
    {
      label: "বিবরণ",
      render: (p) => <p className="text-xs text-gray-600 line-clamp-4">{p.description}</p>,
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold mb-6">পণ্য তুলনা</h1>

      {loading ? (
        <p className="text-gray-400 text-sm">লোড হচ্ছে...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="w-32"></th>
                {products.map((p) => (
                  <th key={p.id} className="p-3 align-top text-left">
                    <div className="relative">
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="absolute -top-2 -right-2 bg-white border rounded-full p-1 shadow"
                        aria-label="তুলনা থেকে সরান"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <Link href={`/products/${p.slug}`}>
                        <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                      </Link>
                      <button
                        onClick={() =>
                          addItem(
                            {
                              productId: p.id,
                              name: p.name,
                              slug: p.slug,
                              price: p.discountPrice ?? p.price,
                              image: p.image,
                              stock: p.stock,
                            },
                            1
                          )
                        }
                        disabled={p.stock === 0}
                        className="mt-2 w-full text-xs bg-green-600 text-white py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        কার্টে যোগ করুন
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t">
                  <td className="p-3 text-sm font-medium text-gray-500 align-top">
                    {row.label}
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-3 align-top">
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
