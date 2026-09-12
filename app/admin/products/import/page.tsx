// app/admin/products/import/page.tsx
import { requireFullAdminPage } from "@/lib/require-full-admin";
import ImportForm from "./import-form";

export default async function ProductImportPage() {
  await requireFullAdminPage();

  return (
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">CSV থেকে পণ্য বাল্ক ইমপোর্ট</h1>
      <p className="text-sm text-gray-500 mb-6">
        কলাম হেডার (প্রথম সারি): <code>name, slug, description, price, discountPrice, stock, categorySlug, images, isFeatured</code>
        <br />
        <code>images</code> কলামে একাধিক URL সেমিকোলন (;) দিয়ে আলাদা করুন। <code>categorySlug</code> অবশ্যই বিদ্যমান ক্যাটাগরির স্লাগ হতে হবে।
        একই <code>slug</code> থাকলে সেই পণ্যটি আপডেট হবে, নতুন হলে তৈরি হবে।
      </p>
      <ImportForm />
    </main>
  );
}
