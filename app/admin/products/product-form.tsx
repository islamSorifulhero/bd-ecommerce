"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createProduct, updateProduct, VariantInput } from "./actions";
import ImageUploader from "@/components/image-uploader";

interface Category {
  id: string;
  name: string;
}

interface InitialProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  categoryId: string;
  images: string[];
  isFeatured: boolean;
  variants: { id: string; label: string; price: number | null; stock: number }[];
}

export default function ProductForm({
  categories,
  initialProduct,
}: {
  categories: Category[];
  initialProduct?: InitialProduct;
}) {
  const isEdit = !!initialProduct;

  const [form, setForm] = useState({
    name: initialProduct?.name || "",
    slug: initialProduct?.slug || "",
    description: initialProduct?.description || "",
    price: initialProduct ? String(initialProduct.price) : "",
    discountPrice: initialProduct?.discountPrice ? String(initialProduct.discountPrice) : "",
    stock: initialProduct ? String(initialProduct.stock) : "",
    categoryId: initialProduct?.categoryId || categories[0]?.id || "",
    images: initialProduct?.images || ([] as string[]),
    isFeatured: initialProduct?.isFeatured || false,
  });

  const [variants, setVariants] = useState<VariantInput[]>(
    initialProduct?.variants.map((v) => ({
      id: v.id,
      label: v.label,
      price: v.price ?? undefined,
      stock: v.stock,
    })) || []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setForm((f) => ({ ...f, name, slug: isEdit ? f.slug : slug }));
  };

  const addVariantRow = () => {
    setVariants((v) => [...v, { label: "", price: undefined, stock: 0 }]);
  };

  const updateVariantRow = (index: number, patch: Partial<VariantInput>) => {
    setVariants((v) => v.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeVariantRow = (index: number) => {
    setVariants((v) => v.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.categoryId || !form.price) {
      setError("প্রয়োজনীয় তথ্য পূরণ করুন");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        stock: parseInt(form.stock || "0", 10),
        categoryId: form.categoryId,
        images: form.images,
        isFeatured: form.isFeatured,
        variants,
      };

      if (isEdit) {
        await updateProduct(initialProduct.id, payload);
      } else {
        await createProduct(payload);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "সমস্যা হয়েছে");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">পণ্যের নাম *</label>
        <input
          className="w-full border rounded-lg p-3"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">স্লাগ (URL)</label>
        <input
          className="w-full border rounded-lg p-3 bg-gray-50"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">বিবরণ</label>
        <textarea
          rows={4}
          className="w-full border rounded-lg p-3"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            দাম (৳) * {variants.length > 0 && <span className="text-gray-400 font-normal">(কোনো ভ্যারিয়েন্ট নেই এমন ক্ষেত্রে ব্যবহৃত হয়)</span>}
          </label>
          <input
            type="number"
            className="w-full border rounded-lg p-3"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ডিসকাউন্ট দাম (৳)</label>
          <input
            type="number"
            className="w-full border rounded-lg p-3"
            value={form.discountPrice}
            onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            স্টক পরিমাণ {variants.length > 0 && <span className="text-gray-400 font-normal">(ভ্যারিয়েন্ট না থাকলে)</span>}
          </label>
          <input
            type="number"
            className="w-full border rounded-lg p-3"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ক্যাটাগরি *</label>
          <select
            className="w-full border rounded-lg p-3"
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ImageUploader
        images={form.images}
        onChange={(images) => setForm((f) => ({ ...f, images }))}
      />

      {/* Variants editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">
            ভ্যারিয়েন্ট (সাইজ/কালার ইত্যাদি — ঐচ্ছিক)
          </label>
          <button
            type="button"
            onClick={addVariantRow}
            className="text-xs flex items-center gap-1 text-green-700 font-medium"
          >
            <Plus className="w-3 h-3" /> ভ্যারিয়েন্ট যোগ করুন
          </button>
        </div>

        {variants.length === 0 && (
          <p className="text-xs text-gray-400">
            কোনো ভ্যারিয়েন্ট নেই — উপরের সাধারণ দাম ও স্টক ব্যবহৃত হবে।
          </p>
        )}

        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={v.id || i} className="flex gap-2 items-center">
              <input
                placeholder="যেমন: লাল / XL"
                className="flex-1 border rounded-lg p-2 text-sm"
                value={v.label}
                onChange={(e) => updateVariantRow(i, { label: e.target.value })}
              />
              <input
                type="number"
                placeholder="দাম (ঐচ্ছিক)"
                className="w-28 border rounded-lg p-2 text-sm"
                value={v.price ?? ""}
                onChange={(e) =>
                  updateVariantRow(i, {
                    price: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
              <input
                type="number"
                placeholder="স্টক"
                className="w-20 border rounded-lg p-2 text-sm"
                value={v.stock}
                onChange={(e) => updateVariantRow(i, { stock: parseInt(e.target.value || "0", 10) })}
              />
              <button
                type="button"
                onClick={() => removeVariantRow(i)}
                className="text-red-500 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
        />
        ফিচার্ড পণ্য হিসেবে হোমপেজে দেখান
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "সেভ হচ্ছে..." : isEdit ? "পরিবর্তন সংরক্ষণ করুন" : "পণ্য যোগ করুন"}
      </button>
    </form>
  );
}
