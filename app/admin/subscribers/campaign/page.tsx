// app/admin/subscribers/campaign/page.tsx
import { prisma } from "@/lib/prisma";
import { requireFullAdminPage } from "@/lib/require-full-admin";
import CampaignForm from "./campaign-form";

export default async function CampaignPage() {
  await requireFullAdminPage();

  const subscriberCount = await prisma.newsletterSubscriber.count({ where: { isActive: true } });

  return (
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">প্রোমোশনাল ইমেইল পাঠান</h1>
      <p className="text-sm text-gray-500 mb-6">
        সক্রিয় সাবস্ক্রাইবার: <strong>{subscriberCount}</strong> জন। ইমেইল পাঠাতে{" "}
        <code>RESEND_API_KEY</code> এনভায়রনমেন্ট ভ্যারিয়েবল সেট থাকতে হবে — না থাকলে শুধু
        কনসোলে লগ হবে, কেউ ইমেইল পাবে না।
      </p>
      <CampaignForm />
    </main>
  );
}
