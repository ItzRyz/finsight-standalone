"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getAiConfig } from "@/lib/ai/config";
import { SYSTEM_TO_ML, mlLabelToSystem } from "@/lib/ai/category-map";

async function postFeedbackToMl(text: string, predicted: string, corrected: string): Promise<string | null> {
  try {
    const { url, enabled, timeout } = getAiConfig();
    if (!enabled) return null;
    const clean = text.trim().slice(0, 500);
    if (!clean || !predicted || !corrected) return null;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), Math.min(timeout, 5000));
    const res = await fetch(`${url}/api/v1/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Request-ID": crypto.randomUUID().slice(0, 8) },
      body: JSON.stringify({ text: clean, predicted_label: predicted.toLowerCase(), corrected_label: corrected.toLowerCase() }),
      signal: controller.signal,
    }).finally(() => clearTimeout(t));
    if (!res.ok) {
      if (res.status === 429) {
        const retry = res.headers.get("Retry-After");
        console.warn("feedback 429", retry);
      }
      return null;
    }
    const data = (await res.json().catch(() => null)) as { job_id?: string | null; jobId?: string | null } | null;
    const jobId = data?.job_id ?? data?.jobId ?? null;
    return jobId ?? null;
  } catch {
    return null;
  }
}

async function saveRetrainJobId(aiId: string, jobId: string | null) {
  if (!jobId) return;
  try {
    await prisma.aiCategorization.update({ where: { id: aiId }, data: { retrainJobId: jobId } });
  } catch {}
}

export async function getReviewQueue() {
  const { dbUser } = await getCurrentUser();
  return prisma.aiCategorization.findMany({
    where: { userId: dbUser.id, wasAccepted: false, wasCorrected: false, status: "COMPLETED" },
    include: { expense: { include: { category: true } }, category: true },
    orderBy: [{ confidence: "asc" }, { createdAt: "desc" }],
    take: 50,
  });
}

export async function acceptAiCategorization(id: string) {
  const { dbUser } = await getCurrentUser();
  const item = await prisma.aiCategorization.findFirst({ where: { id, userId: dbUser.id }, include: { expense: true, category: true } });
  if (!item) return { success: false, error: "Not found" };
  await prisma.aiCategorization.update({ where: { id: item.id }, data: { wasAccepted: true } });
  try {
    await prisma.notification.create({
      data: {
        userId: dbUser.id,
        type: "EXPENSE_CATEGORIZED",
        priority: "LOW",
        title: "Category accepted",
        message: `"${item.expense.title}" kept as ${item.category?.name ?? "Uncategorized"} (${Number(item.confidence ?? 0).toFixed(2)})`,
        expenseId: item.expenseId,
      },
    });
  } catch {}
  // Feedback to ML is_correct=true (no retrain trigger, but log)
  const raw = item.rawResponse as unknown as { predicted_label?: string } | null;
  const predicted = raw?.predicted_label ?? item.category?.name?.toLowerCase() ?? "other";
  postFeedbackToMl(item.expense.title, predicted, predicted).then((jid) => saveRetrainJobId(item.id, jid));
  revalidatePath("/expenses/review");
  return { success: true };
}

export async function correctAiCategorization(id: string, newCategoryId: string | null) {
  const { dbUser } = await getCurrentUser();
  const item = await prisma.aiCategorization.findFirst({ where: { id, userId: dbUser.id }, include: { expense: true } });
  if (!item) return { success: false, error: "Not found" };

  let validCategoryId: string | null = null;
  if (newCategoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: newCategoryId, OR: [{ type: "SYSTEM", userId: null }, { type: "CUSTOM", userId: dbUser.id }] },
      select: { id: true },
    });
    if (!cat) return { success: false, error: "Kategori tidak valid." };
    validCategoryId = cat.id;
  }

  // Need names for feedback
  let newCategoryName: string | null = null;
  if (validCategoryId) {
    const nc = await prisma.category.findUnique({ where: { id: validCategoryId }, select: { name: true } });
    newCategoryName = nc?.name ?? null;
  }

  await prisma.$transaction([
    prisma.expense.update({ where: { id: item.expenseId }, data: { categoryId: validCategoryId, categorizationSource: "MANUAL" } }),
    prisma.aiCategorization.update({
      where: { id: item.id },
      data: { wasCorrected: true, wasAccepted: false, categoryId: validCategoryId, rawResponse: { correctedTo: validCategoryId, correctedName: newCategoryName } as never },
    }),
  ]);

  // Feedback is_correct=false → pending increment in ML, may trigger retrain at 10
  if (newCategoryName) {
    const raw = item.rawResponse as unknown as { predicted_label?: string } | null;
    const predicted = raw?.predicted_label ?? "other";
    const correctedMl = SYSTEM_TO_ML[newCategoryName] ?? newCategoryName.toLowerCase();
    postFeedbackToMl(`${item.expense.title}`, predicted, correctedMl).then((jid) => saveRetrainJobId(item.id, jid));
  }

  revalidatePath("/expenses/review");
  revalidatePath("/expenses");
  return { success: true };
}
