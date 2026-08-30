import { getAiConfig } from "./config";

export type AiHealth = { ok: boolean; model_loaded?: boolean; latencyMs?: number; error?: string };
export type AiLive = { ok: boolean; status?: string; latencyMs?: number; error?: string };
export type AiPending = { pending_feedback?: number; retrain_threshold?: number; error?: string };
export type AiJob = { job_id: string; status: string; pending_feedback?: number; result?: unknown; error?: string } | null;

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

export async function checkAiLive(): Promise<AiLive> {
  const { url, enabled, timeout } = getAiConfig();
  if (!enabled) return { ok: false, error: "disabled" };
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), Math.min(timeout, 3000));
  const start = Date.now();
  try {
    const res = await fetch(`${url}/api/v1/health/live`, { signal: controller.signal, cache: "no-store" });
    const latencyMs = Date.now() - start;
    if (!res.ok) return { ok: false, error: `http ${res.status}`, latencyMs };
    const data = (await res.json()) as { status?: string };
    return { ok: data.status === "alive", status: data.status, latencyMs };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(t);
  }
}

export async function getAiPending(): Promise<AiPending> {
  const { url, enabled, timeout } = getAiConfig();
  if (!enabled) return { error: "disabled" };
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), Math.min(timeout, 3000));
  try {
    const res = await fetch(`${url}/api/v1/feedback/pending`, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return { error: `http ${res.status}` };
    return (await res.json()) as AiPending;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(t);
  }
}

export async function getAiJob(jobId: string): Promise<AiJob> {
  const { url, enabled, timeout } = getAiConfig();
  if (!enabled || !jobId) return null;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), Math.min(timeout, 3000));
  try {
    const res = await fetch(`${url}/api/v1/feedback/job/${encodeURIComponent(jobId)}`, { signal: controller.signal, cache: "no-store" });
    if (res.status === 404) return { job_id: jobId, status: "not_found" };
    if (!res.ok) return { job_id: jobId, status: "error", error: `http ${res.status}` };
    return (await res.json()) as AiJob;
  } catch (e) {
    return { job_id: jobId, status: "error", error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(t);
  }
}
