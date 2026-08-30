import { NextRequest, NextResponse } from "next/server";
import { getAiJob } from "@/lib/ai/health";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "missing jobId" }, { status: 400 });
  const data = await getAiJob(jobId);
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
