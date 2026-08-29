import { getAiConfig } from "./config";
import { classifyExpenseRemote } from "./remote-predictor";
import { classifyExpense as classifyLocal } from "./local-categorize";
import type { AiResult } from "./types";

let fallbackOnlyUntil = 0;

export async function classifyExpense(text: string): Promise<AiResult | null> {
  const { enabled } = getAiConfig();
  if (!enabled) return toAiResult(await classifyLocal(text));

  if (Date.now() < fallbackOnlyUntil) return toAiResult(await classifyLocal(text));

  let failures = 0;
  try {
    const remote = await classifyExpenseRemote(text);
    if (remote) return remote;
    // null from remote (not found) → fallback
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("RateLimit")) {
      // don't spam, go fallback briefly
      fallbackOnlyUntil = Date.now() + 60_000;
    } else {
      failures++;
      if (failures >= 3) fallbackOnlyUntil = Date.now() + 5 * 60_000;
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
