import { getAiConfig } from "./config";

export type AiHealth = { ok: boolean; model_loaded?: boolean; latencyMs?: number; error?: string };

export async function checkAiHealth(): Promise<AiHealth> {
  const { url, enabled, timeout } = getAiConfig();
  if (!enabled) return { ok: false, error: "disabled" };
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), Math.min(timeout, 3000));
  const start = Date.now();
  try {
    const res = await fetch(`${url}/api/v1/health/ready`, { signal: controller.signal, cache: "no-store" });
    const latencyMs = Date.now() - start;
    if (!res.ok) return { ok: false, error: `http ${res.status}`, latencyMs };
    const data = (await res.json()) as { model_loaded?: boolean; status?: string };
    const ok = !!data.model_loaded || data.status === "ready";
    return { ok, model_loaded: !!data.model_loaded, latencyMs };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(t);
  }
}
