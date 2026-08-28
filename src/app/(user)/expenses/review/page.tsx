import { getReviewQueue } from "@/actions/ai-categorization";
import { getAvailableCategories } from "@/lib/data/categories";
import { UserHeader } from "@/components/user/user-header";
import { ReviewQueue } from "@/components/expenses/review-queue";

export default async function ReviewPage() {
  const [queue, categories] = await Promise.all([getReviewQueue(), getAvailableCategories()]);
  return (
    <>
      <UserHeader title="Review" />
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Review Queue</h1>
          <p className="text-sm text-muted-foreground">
            {queue.length} pending • Accept or correct AI suggestions (local-keyword rules-v1, confidence 0.82 default).
          </p>
        </div>
        <ReviewQueue items={queue as never} categories={categories} />
      </main>
    </>
  );
}
