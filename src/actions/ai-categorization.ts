"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getAiConfig } from "@/lib/ai/config";
import { SYSTEM_TO_ML, mlLabelToSystem } from "@/lib/ai/category-map";

async function postFeedbackToMl(text: string, predicted: string, corrected: string) {
  try {
    const { url, enabled } = getAiConfig();
    if (!enabled) return;
    const clean = text.trim().slice(0, 500);
    if (!clean || !predicted || !corrected) return;
    // fire-and-forget, don't await block
    fetch(`${url}/api/v1/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: clean, predicted_label: predicted.toLowerCase(), corrected_label: corrected.toLowerCase() }),
    }).catch(() => {});
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
  postFeedbackToMl(item.expense.title, predicted, predicted);
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
    postFeedbackToMl(`${item.expense.title}`, predicted, correctedMl);
  }

  revalidatePath("/expenses/review");
  revalidatePath("/expenses");
  return { success: true };
}
