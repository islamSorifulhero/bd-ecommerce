// app/admin/reviews/page.tsx
import { prisma } from "@/lib/prisma";
import StarRating from "@/components/star-rating";
import DeleteReviewButton from "./delete-review-button";
import { requireFullAdminPage } from "@/lib/require-full-admin";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireFullAdminPage();
  const reviews = await prisma.review.findMany({
    include: { user: true, product: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">রিভিউ মডারেশন</h1>

      <div className="border rounded-xl overflow-hidden bg-white divide-y">
        {reviews.length === 0 && (
          <p className="p-6 text-gray-400 text-sm">এখনো কোনো রিভিউ নেই</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="p-4 flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{r.product.name}</span>
                <StarRating rating={r.rating} size={14} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {r.user.name} &middot;{" "}
                {new Date(r.createdAt).toLocaleDateString("bn-BD")}
              </p>
              {r.comment && (
                <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
              )}
            </div>
            <DeleteReviewButton reviewId={r.id} />
          </div>
        ))}
      </div>
    </main>
  );
}
