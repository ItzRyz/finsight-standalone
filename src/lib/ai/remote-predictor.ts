import { getAiConfig } from "./config";
import { mlLabelToSystem } from "./category-map";
import { RateLimitError, type AiResult } from "./types";
import { prisma } from "@/lib/prisma";

const memCache = new Map<string, { result: AiResult; ts: number }>();
const CACHE_MS = 5 * 60 * 1000;
const MAX_TEXT = 500;
const MAX_CACHE_SIZE = 500;

export async function classifyExpenseRemote(text: string): Promise<AiResult> {
  const trimmed = text.trim().slice(0, MAX_TEXT);
  if (!trimmed) throw new Error("Text empty");

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
      throw new RateLimitError("Rate limit exceeded", retryAfter);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 422) throw new Error(`Validation 422: ${body.slice(0, 200)}`);
      if (res.status === 503) throw new Error(`Service unavailable 503: ${body.slice(0, 200)}`);
      throw new Error(`AI http ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = (await res.json()) as { predicted_label: string; text: string };
    const mlLabel = String(data.predicted_label ?? "").toLowerCase().trim();
    if (!mlLabel) throw new Error("Empty predicted_label from AI");

    const systemName = mlLabelToSystem(mlLabel);
    const category = await prisma.category.findFirst({
      where: { name: systemName, type: "SYSTEM", userId: null },
      select: { id: true },
    });
    if (!category) throw new Error(`System category not found for ${systemName} (ml:${mlLabel})`);

    const result: AiResult = {
      categoryId: category.id,
      categoryName: mlLabel,
      systemName,
      confidence: 0.92,
      provider: "finsight-ml",
      model: "1.9.0",
      rawResponse: { text: trimmed, predicted_label: mlLabel, systemName, categoryId: category.id },
    };

    memCache.set(trimmed, { result, ts: Date.now() });
    if (memCache.size > MAX_CACHE_SIZE) {
      const first = memCache.keys().next().value as string | undefined;
      if (first) memCache.delete(first);
    }
    return result;
  } catch (e) {
    if (e instanceof RateLimitError) throw e;
    if (e instanceof Error && e.name === "AbortError") throw new Error(`AI timeout ${timeout}ms`);
    throw e;
  } finally {
    clearTimeout(t);
  }
}
