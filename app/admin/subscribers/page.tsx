// app/admin/subscribers/page.tsx
import { prisma } from "@/lib/prisma";
import { requireFullAdminPage } from "@/lib/require-full-admin";
import ExportCsvButton from "./export-csv-button";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  await requireFullAdminPage();

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    orderBy: { subscribedAt: "desc" },
  });

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">নিউজলেটার সাবস্ক্রাইবার ({subscribers.length})</h1>
        <ExportCsvButton
          rows={subscribers.map((s) => ({
            email: s.email,
            subscribedAt: s.subscribedAt.toISOString(),
          }))}
        />
      </div>

      <div className="border rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">ইমেইল</th>
              <th className="p-3">সাবস্ক্রাইব করেছেন</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={2} className="p-4 text-center text-gray-400">
                  কোনো সাবস্ক্রাইবার নেই
                </td>
              </tr>
            )}
            {subscribers.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.email}</td>
                <td className="p-3 text-gray-500">
                  {s.subscribedAt.toLocaleDateString("bn-BD")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
