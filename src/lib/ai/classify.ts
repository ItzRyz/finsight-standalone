import { classifyExpenseRemote } from "./remote-predictor";
import type { AiResult } from "./types";

export async function classifyExpense(text: string): Promise<AiResult> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Text empty");
  // Remote only — no local fallback, throws on any failure (429/500/503/timeout/network)
  return classifyExpenseRemote(trimmed);
}
