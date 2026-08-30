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
            {queue.length} pending • {health.ok && health.model_loaded ? "AI ai.finsight.space ready • confidence 0.92" : "AI unavailable — queued/failed will retry"} • {health.latencyMs ?? 0}ms
          </p>
          {health.error && <p className="mt-2 text-xs text-destructive">Health: {health.error}</p>}
          {!health.ok && <p className="mt-1 text-xs text-muted-foreground">Remote only — expenses saved uncategorized when AI 429/503/timeout, retry via Review.</p>}
        </div>
        <ReviewQueue items={queue as never} categories={categories} />
      </main>
    </>
  );
}
