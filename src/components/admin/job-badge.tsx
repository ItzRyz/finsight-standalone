"use client";

import { useEffect, useState } from "react";

type JobData = { job_id?: string; status?: string; pending_feedback?: number; result?: unknown; error?: string } | null;

export function JobBadge({ jobId }: { jobId: string }) {
  const [data, setData] = useState<JobData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchJob() {
      try {
        const res = await fetch(`/api/ai/job?jobId=${encodeURIComponent(jobId)}`, { cache: "no-store" });
        const json = (await res.json()) as JobData;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ job_id: jobId, status: "error" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchJob();
    const id = setInterval(fetchJob, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [jobId]);

  if (loading) return <span className="text-xs text-muted-foreground">…{jobId.slice(0, 6)}</span>;
  const status = (data as { status?: string })?.status ?? "unknown";
  const color =
    status === "done" || status === "completed" ? "bg-emerald-500/10 text-emerald-600" : status === "running" || status === "queued" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${color}`} title={jobId}>
      {status} • {jobId.slice(0, 6)}
    </span>
  );
}
