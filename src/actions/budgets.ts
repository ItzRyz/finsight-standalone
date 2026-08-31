"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth/get-current-user";

import { budgetSchema } from "@/lib/validators/budget";

import { getZodErrors } from "@/lib/validators/utils";

import { getBudgetPeriod } from "@/lib/budget/get-budget-period";
import { reconcileBudgetAlerts } from "@/lib/budget/reconcile-budget-alerts";
import type { ActionResult } from "@/types/action";

export async function createBudget(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const amount = Number(formData.get("amount"));

  const warningThreshold = Number(formData.get("warningThreshold"));

  const validated = budgetSchema.safeParse({
    name: formData.get("name"),

    amount,

    categoryId: formData.get("categoryId"),

    period: formData.get("period"),

    warningThreshold,

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

    const { name, categoryId, period, currency } = validated.data;

    // ---------------------------------------------
    // Validate category ownership
    // ---------------------------------------------

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

    // ---------------------------------------------
    // Calculate period
    // ---------------------------------------------

    const { start, end } = getBudgetPeriod(period);

    // ---------------------------------------------
    // Check duplicate active budget
    // ---------------------------------------------

    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: dbUser.id,

        categoryId: validCategoryId,

        period,

        periodStart: start,

        periodEnd: end,

        currency: currency ?? dbUser.currency ?? "IDR",

        isActive: true,
      },
    });

    if (existingBudget) {
      return {
        success: false,
        error: "Budget untuk periode dan kategori tersebut sudah ada.",
      };
    }

    // ---------------------------------------------
    // Create
    // ---------------------------------------------

    const budget = await prisma.budget.create({
      data: {
        userId: dbUser.id,

        categoryId: validCategoryId,

        name: name || null,

        amount: validated.data.amount,
        currency: currency ?? dbUser.currency ?? "IDR",

        period,

        periodStart: start,

        periodEnd: end,

        warningThreshold: validated.data.warningThreshold,

        isActive: true,
      },

      select: {
        id: true,
      },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return {
      success: true,

      data: {
        id: budget.id,
      },
    };
  } catch (error) {
    console.error("createBudget:", error);

    return {
      success: false,
      error: "Gagal membuat budget.",
    };
  }
}

export async function getBudgets() {
  const { dbUser } = await getCurrentUser();

  const budgets = await prisma.budget.findMany({
    where: {
      userId: dbUser.id,
      isActive: true,
    },

    include: {
      category: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return Promise.all(
    budgets.map(async (budget) => {
      const result = await prisma.expense.aggregate({
        where: {
          userId: dbUser.id,

          type: "EXPENSE",
          // Only count same currency (real multi-currency budget)
          currency: ((budget as unknown as { currency: string }).currency ?? "IDR") as never,

          expenseDate: {
            gte: budget.periodStart,
            lte: budget.periodEnd,
          },

          ...(budget.categoryId
            ? {
                categoryId: budget.categoryId,
              }
            : {}),
        },

        _sum: {
          amount: true,
        },
      });

      const spent = Number((result._sum as unknown as { amount: unknown })?.amount ?? 0);

      const budgetAmount = Number(budget.amount);

      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      const remaining = Math.max(budgetAmount - spent, 0);

      let status: "SAFE" | "WARNING" | "EXCEEDED";

      if (percentage >= 100) {
        status = "EXCEEDED";
      } else if (percentage >= Number(budget.warningThreshold)) {
        status = "WARNING";
      } else {
        status = "SAFE";
      }

      return {
        id: budget.id,

        name: budget.name,

        amount: budgetAmount,
        currency: (budget as unknown as { currency: string }).currency ?? "IDR",

        warningThreshold: Number(budget.warningThreshold),

        period: budget.period,

        periodStart: budget.periodStart,

        periodEnd: budget.periodEnd,

        spent,

        percentage,

        remaining,

        status,

        category: budget.category,
      };
    }),
  );
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  const { dbUser } = await getCurrentUser();
  const budget = await prisma.budget.findFirst({ where: { id, userId: dbUser.id }, select: { id: true } });
  if (!budget) return { success: false, error: "Budget tidak ditemukan." };
  await prisma.budget.delete({ where: { id: budget.id } });
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBudget(
  id: string,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const validated = budgetSchema.safeParse({
    name: formData.get("name"),
    amount: Number(formData.get("amount")),
    categoryId: formData.get("categoryId"),
    period: formData.get("period"),
    warningThreshold: Number(formData.get("warningThreshold")),
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

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingBudget) {
      return {
        success: false,
        error: "Budget tidak ditemukan.",
      };
    }

    const { name, categoryId, period, currency } = validated.data;

    // ---------------------------------------------
    // Validate category ownership
    // ---------------------------------------------

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

    // ---------------------------------------------
    // Recalculate period when the period changes.
    // Budget periods are always based on the current
    // month/year, just like createBudget.
    // ---------------------------------------------

    const { start, end } = getBudgetPeriod(period);

    // ---------------------------------------------
    // Prevent duplicate active budgets after changing
    // category and/or period.
    // ---------------------------------------------

    const duplicateBudget = await prisma.budget.findFirst({
      where: {
        userId: dbUser.id,
        categoryId: validCategoryId,
        period,
        periodStart: start,
        periodEnd: end,
        currency: currency ?? dbUser.currency ?? "IDR",
        isActive: true,
        NOT: {
          id: existingBudget.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicateBudget) {
      return {
        success: false,
        error: "Budget untuk periode dan kategori tersebut sudah ada.",
      };
    }

    // ---------------------------------------------
    // Update
    // ---------------------------------------------

    await prisma.budget.update({
      where: {
        id: existingBudget.id,
      },
      data: {
        name: name || null,
        categoryId: validCategoryId,
        amount: validated.data.amount,
        currency: currency ?? dbUser.currency ?? "IDR",
        period,
        periodStart: start,
        periodEnd: end,
        warningThreshold: validated.data.warningThreshold,
      },
    });

    // Recalculate current budget alerts because the
    // category, period, amount, or threshold may have changed.
    await reconcileBudgetAlerts(dbUser.id);

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        id: existingBudget.id,
      },
    };
  } catch (error) {
    console.error("updateBudget:", error);

    return {
      success: false,
      error: "Gagal mengubah budget.",
    };
  }
}
