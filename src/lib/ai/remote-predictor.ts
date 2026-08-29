import { getAiConfig } from "./config";
import { mlLabelToSystem } from "./category-map";
import { RateLimitError, type AiResult } from "./types";
import { prisma } from "@/lib/prisma";

const memCache = new Map<string, { result: AiResult | null; ts: number }>();
const CACHE_MS = 5 * 60 * 1000;
const MAX_TEXT = 500;

export async function classifyExpenseRemote(text: string): Promise<AiResult | null> {
  const trimmed = text.trim().slice(0, MAX_TEXT);
  if (!trimmed) return null;

  const cached = memCache.get(trimmed);
  if (cached && Date.now() - cached.ts < CACHE_MS) return cached.result;

  const { url, timeout } = getAiConfig();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${url}/api/v1/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Request-ID": crypto.randomUUID().slice(0, 8) },
      body: JSON.stringify({ text: trimmed }),
      signal: controller.signal,
    });

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After") ?? "60");
      throw new RateLimitError("Rate limit", retryAfter);
    }

    if (!res.ok) return null;

    const data = (await res.json()) as { predicted_label: string; text: string };
    const mlLabel = String(data.predicted_label ?? "").toLowerCase().trim();
    if (!mlLabel) return null;

    const systemName = mlLabelToSystem(mlLabel);
    const category = await prisma.category.findFirst({
      where: { name: systemName, type: "SYSTEM", userId: null },
      select: { id: true },
    });

    // confidence: ML model has no prob → hardcode 0.92 (higher than local 0.82) to indicate remote
    const result: AiResult = {
      categoryId: category?.id ?? null,
      categoryName: mlLabel,
      systemName,
      confidence: category ? 0.92 : 0.82,
      provider: "finsight-ml",
      model: "1.9.0",
      rawResponse: { text: trimmed, predicted_label: mlLabel, systemName, categoryId: category?.id ?? null },
    };

    memCache.set(trimmed, { result, ts: Date.now() });
    return result;
  } catch (e) {
    if (e instanceof RateLimitError) throw e;
    return null;
  } finally {
    clearTimeout(t);
  }
}
