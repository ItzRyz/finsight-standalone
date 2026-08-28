"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

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

  await prisma.$transaction([
    prisma.expense.update({ where: { id: item.expenseId }, data: { categoryId: validCategoryId, categorizationSource: "MANUAL" } }),
    prisma.aiCategorization.update({
      where: { id: item.id },
      data: { wasCorrected: true, wasAccepted: false, categoryId: validCategoryId, rawResponse: { correctedTo: validCategoryId } as never },
    }),
  ]);

  revalidatePath("/expenses/review");
  revalidatePath("/expenses");
  return { success: true };
}
