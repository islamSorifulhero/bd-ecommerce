// app/admin/products/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "../../product-form";
import { requireFullAdminPage } from "@/lib/require-full-admin";

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  await requireFullAdminPage();
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id }, include: { variants: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">পণ্য সম্পাদনা করুন</h1>
      <ProductForm
        categories={categories}
        initialProduct={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: Number(product.price),
          discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
          stock: product.stock,
          categoryId: product.categoryId,
          images: product.images,
          isFeatured: product.isFeatured,
          variants: product.variants.map((v) => ({
            id: v.id,
            label: v.label,
            price: v.price ? Number(v.price) : null,
            stock: v.stock,
          })),
        }}
      />
    </main>
  );
}
