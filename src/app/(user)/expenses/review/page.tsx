import { getReviewQueue } from "@/actions/ai-categorization";
import { getAvailableCategories } from "@/lib/data/categories";
import { UserHeader } from "@/components/user/user-header";
import { ReviewQueue } from "@/components/expenses/review-queue";
import { checkAiHealth } from "@/lib/ai/health";

export default async function ReviewPage() {
  const [queue, categories, health] = await Promise.all([getReviewQueue(), getAvailableCategories(), checkAiHealth()]);
  return (
    <>
      <UserHeader title="Review" />
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Review Queue</h1>
          <p className="text-sm text-muted-foreground">
            {queue.length} pending • {health.ok ? "AI ai.finsight.space ready" : "⚠️ AI offline — fallback lokal active"} • confidence {health.ok ? "0.92" : "0.82"} default
          </p>
          {!health.ok && <p className="mt-2 text-xs text-muted-foreground">Health: {health.error ?? "unknown"} • Set FINSIGHT_AI_ENABLED=false to force local only.</p>}
        </div>
        <ReviewQueue items={queue as never} categories={categories} />
      </main>
    </>
  );
}
