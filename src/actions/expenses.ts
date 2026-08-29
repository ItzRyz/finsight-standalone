"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

import { expenseSchema } from "@/lib/validators/expense";

import { getZodErrors } from "@/lib/validators/utils";

import { reconcileBudgetAlerts } from "@/lib/budget/reconcile-budget-alerts";
import { classifyExpense } from "@/lib/ai/classify";
import type { ActionResult } from "@/types/action";

export async function getExpenses() {
  const { dbUser } = await getCurrentUser();

  const expenses = await prisma.expense.findMany({
    where: {
      userId: dbUser.id,
    },

    include: {
      category: true,
    },

    orderBy: [
      {
        expenseDate: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }));
}

export async function createExpense(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const validated = expenseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    amount: Number(formData.get("amount")),
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    expenseDate: new Date(formData.get("expenseDate") as string),
    merchant: formData.get("merchant"),
    location: formData.get("location"),
    receiptUrl: formData.get("receiptUrl"),
    currency: (formData.get("currency") as string) || undefined,
  });

  if (!validated.success) {
    return {
      success: false,
      fieldErrors: getZodErrors(validated.error),
    };
  }

  try {
    const { dbUser } = await getCurrentUser();

    const {
      title,
      description,
      amount,
      type,
      categoryId,
      expenseDate,
      merchant,
      location,
      receiptUrl,
      currency,
    } = validated.data;

    /*
     * Verify category belongs to:
     *
     * 1. System category
     * OR
     * 2. Current user
     */
    let validCategoryId: string | null = null;

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [
            {
              type: "SYSTEM",
              userId: null,
            },
            {
              type: "CUSTOM",
              userId: dbUser.id,
            },
          ],
        },
        select: {
          id: true,
        },
      });

      if (!category) {
        return {
          success: false,
          error: "Kategori tidak valid.",
        };
      }

      validCategoryId = category.id;
    }

    const classification = validCategoryId
      ? null
      : await classifyExpense(`${title} ${description ?? ""} ${merchant ?? ""}`);
    const finalCategoryId = validCategoryId ?? classification?.categoryId ?? null;

    const expense = await prisma.expense.create({
      data: {
        userId: dbUser.id,

        categoryId: finalCategoryId,

        title,

        description: description || null,

        amount,
        currency: currency ?? dbUser.currency ?? "IDR",

        type,

        expenseDate,

        merchant: merchant || null,

        location: location || null,

        receiptUrl: receiptUrl || null,

        /*
         * User manually created
         * this expense.
         */
        categorizationSource: classification ? "AI" : "MANUAL",
      },

      select: {
        id: true,
      },
    });

    if (classification) {
      const startMark = Date.now();
      await prisma.aiCategorization.create({
        data: {
          expenseId: expense.id,
          userId: dbUser.id,
          categoryId: classification.categoryId,
          status: "COMPLETED",
          confidence: classification.confidence,
          provider: (classification as unknown as { provider: string }).provider ?? "local-keyword",
          model: (classification as unknown as { model: string }).model ?? "rules-v1",
          rawResponse: (classification as unknown as { rawResponse: unknown }).rawResponse as never ?? ({ text: `${title} ${description ?? ""} ${merchant ?? ""}`.trim(), matchedCategory: classification.categoryName } as never),
          processingTimeMs: Date.now() - startMark,
          wasAccepted: false,
        },
      });
      // Notify user about AI categorization (for review queue)
      try {
        await prisma.notification.create({
          data: {
            userId: dbUser.id,
            type: "EXPENSE_CATEGORIZED",
            priority: "LOW",
            title: "AI categorization",
            message: `"${title}" auto-categorized as ${classification.categoryName} (${Number(classification.confidence).toFixed(2)}) — review in Expenses → Review`,
            expenseId: expense.id,
          },
        });
      } catch {}
    }

    await reconcileBudgetAlerts(dbUser.id);

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/budgets");
    revalidatePath("/expenses/review");

    return {
      success: true,
      data: {
        id: expense.id,
      },
    };
  } catch (error) {
    console.error("createExpense:", error);

    return {
      success: false,
      error: "Gagal membuat expense.",
    };
  }
}

export async function updateExpense(
  id: string,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const validated = expenseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    amount: Number(formData.get("amount")),
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    expenseDate: new Date(String(formData.get("expenseDate"))),
    merchant: formData.get("merchant"),
    location: formData.get("location"),
    receiptUrl: formData.get("receiptUrl"),
    currency: (formData.get("currency") as string) || undefined,
  });

  if (!validated.success) {
    return {
      success: false,
      fieldErrors: getZodErrors(validated.error),
    };
  }

  try {
    const { dbUser } = await getCurrentUser();

    // ==========================================
    // Verify ownership
    // ==========================================

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!existingExpense) {
      return {
        success: false,
        error: "Expense tidak ditemukan.",
      };
    }

    // ==========================================
    // Validate category
    // ==========================================

    let validCategoryId: string | null = null;

    if (validated.data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: validated.data.categoryId,

          OR: [
            {
              type: "SYSTEM",
              userId: null,
            },
            {
              type: "CUSTOM",
              userId: dbUser.id,
            },
          ],
        },

        select: {
          id: true,
        },
      });

      if (!category) {
        return {
          success: false,
          error: "Kategori tidak valid.",
        };
      }

      validCategoryId = category.id;
    }

    // ==========================================
    // Update
    // ==========================================

    const expense = await prisma.expense.update({
      where: {
        id: existingExpense.id,
      },

      data: {
        title: validated.data.title,

        description: validated.data.description || null,

        amount: validated.data.amount,
        currency: validated.data.currency ?? existingExpense.currency ?? "IDR",

        type: validated.data.type,

        categoryId: validCategoryId,

        expenseDate: validated.data.expenseDate,

        merchant: validated.data.merchant || null,

        location: validated.data.location || null,

        receiptUrl: validated.data.receiptUrl || null,

        /*
         * User manually changed
         * the expense.
         *
         * Keep source as MANUAL.
         */
        categorizationSource: "MANUAL",
      },

      select: {
        id: true,
      },
    });

    // Mark AI categorization as corrected if user changed category that was AI
    if (existingExpense.categorizationSource === "AI" && validCategoryId !== existingExpense.categoryId) {
      try {
        await prisma.aiCategorization.updateMany({
          where: { expenseId: existingExpense.id, userId: dbUser.id, wasCorrected: false },
          data: { wasCorrected: true, categoryId: validCategoryId, rawResponse: { correctedTo: validCategoryId } as never },
        });
      } catch {}
    }

    // ==========================================
    // Recalculate budgets
    // ==========================================

    await reconcileBudgetAlerts(dbUser.id);

    revalidatePath("/expenses");
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    revalidatePath("/expenses/review");

    return {
      success: true,
      data: {
        id: expense.id,
      },
    };
  } catch (error) {
    console.error("updateExpense:", error);

    return {
      success: false,
      error: "Gagal mengubah expense.",
    };
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    const { dbUser } = await getCurrentUser();

    // ==========================================
    // Verify ownership
    // ==========================================

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!expense) {
      return {
        success: false,
        error: "Expense tidak ditemukan.",
      };
    }

    // ==========================================
    // Delete
    // ==========================================

    await prisma.expense.delete({
      where: {
        id: expense.id,
      },
    });

    // ==========================================
    // Recalculate budgets
    // ==========================================

    await reconcileBudgetAlerts(dbUser.id);

    revalidatePath("/expenses");
    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("deleteExpense:", error);

    return {
      success: false,
      error: "Gagal menghapus expense.",
    };
  }
}
