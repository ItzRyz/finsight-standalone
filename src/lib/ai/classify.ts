import { getAiConfig } from "./config";
import { classifyExpenseRemote } from "./remote-predictor";
import { classifyExpense as classifyLocal } from "./local-categorize";
import type { AiResult } from "./types";

let fallbackOnlyUntil = 0;
let consecutiveFailures = 0;

export async function classifyExpense(text: string): Promise<AiResult | null> {
  const { enabled } = getAiConfig();
  if (!enabled) return toAiResult(await classifyLocal(text));

  if (Date.now() < fallbackOnlyUntil) return toAiResult(await classifyLocal(text));

  try {
    const remote = await classifyExpenseRemote(text);
    if (remote) {
      consecutiveFailures = 0;
      return remote;
    }
    // null from remote (not found) → fallback, reset failures
    consecutiveFailures = 0;
  } catch (e) {
    if (e instanceof Error && e.name === "RateLimitError") {
      const retryAfter = (e as unknown as { retryAfter?: number }).retryAfter ?? 60;
      fallbackOnlyUntil = Date.now() + retryAfter * 1000;
      consecutiveFailures = 0;
    } else {
      consecutiveFailures++;
      if (consecutiveFailures >= 3) {
        fallbackOnlyUntil = Date.now() + 5 * 60_000;
        consecutiveFailures = 0;
      }
    }
  }

  return toAiResult(await classifyLocal(text));
}

function toAiResult(local: { categoryId: string; confidence: number; categoryName: string } | null): AiResult | null {
  if (!local) return null;
  return {
    categoryId: local.categoryId,
    categoryName: local.categoryName,
    systemName: local.categoryName,
    confidence: local.confidence,
    provider: "local-keyword",
    model: "rules-v1",
    rawResponse: { text: local.categoryName, source: "local" },
  };
}
