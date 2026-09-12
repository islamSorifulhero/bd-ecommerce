// app/admin/products/new/page.tsx
import { prisma } from "@/lib/prisma";
import ProductForm from "../product-form";
import { requireFullAdminPage } from "@/lib/require-full-admin";

export default async function NewProductPage() {
  await requireFullAdminPage();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">নতুন পণ্য যোগ করুন</h1>
      <ProductForm categories={categories} />
    </main>
  );
}
