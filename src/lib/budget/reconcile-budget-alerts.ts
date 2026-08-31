import { prisma } from "@/lib/prisma";

export async function reconcileBudgetAlerts(userId: string) {
  const now = new Date();

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      isActive: true,
      periodStart: {
        lte: now,
      },
      periodEnd: {
        gte: now,
      },
    },
    include: {
      category: true,
    },
  });

  const results = [];

  for (const budget of budgets) {
    const budgetCurrency = (budget as unknown as { currency: string }).currency ?? "IDR";
    const aggregate = await prisma.expense.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        currency: budgetCurrency as never,

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

    const spentAmount = Number(aggregate._sum.amount ?? 0);

    const budgetAmount = Number(budget.amount);

    const percentage =
      budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

    const warningThreshold = Number(budget.warningThreshold);

    let currentType: "WARNING" | "EXCEEDED" | null = null;

    if (percentage >= 100) {
      currentType = "EXCEEDED";
    } else if (percentage >= warningThreshold) {
      currentType = "WARNING";
    }

    // Get active alerts
    const activeAlerts = await prisma.budgetAlert.findMany({
      where: {
        budgetId: budget.id,
        userId,
        resolvedAt: null,
      },
    });

    // ============================================
    // Resolve obsolete alerts
    // ============================================

    if (!currentType) {
      if (activeAlerts.length > 0) {
        await prisma.budgetAlert.updateMany({
          where: {
            budgetId: budget.id,
            userId,
            resolvedAt: null,
          },

          data: {
            resolvedAt: now,
          },
        });
      }

      results.push({
        budgetId: budget.id,
        status: "SAFE",
        spentAmount,
        percentage,
      });

      continue;
    }

    // ============================================
    // Resolve WARNING when EXCEEDED
    // ============================================

    if (currentType === "EXCEEDED") {
      const warningAlert = activeAlerts.find(
        (alert) => alert.type === "WARNING",
      );

      if (warningAlert) {
        await prisma.budgetAlert.update({
          where: {
            id: warningAlert.id,
          },

          data: {
            resolvedAt: now,
          },
        });
      }
    }

    // ============================================
    // Check whether current alert exists
    // ============================================

    const existingAlert = activeAlerts.find(
      (alert) => alert.type === currentType,
    );

    if (!existingAlert) {
      const budgetName = budget.name ?? budget.category?.name ?? "Budget";

      const isExceeded = currentType === "EXCEEDED";

      const message = isExceeded
        ? `${budgetName} sudah melebihi budget sebesar ${percentage.toFixed(0)}%.`
        : `${budgetName} sudah menggunakan ${percentage.toFixed(0)}% dari budget.`;

      const alert = await prisma.budgetAlert.create({
        data: {
          budgetId: budget.id,
          userId,

          type: currentType,

          spentAmount,
          budgetAmount,
          percentage,

          message,

          notified: true,
        },
      });

      await prisma.notification.create({
        data: {
          userId,

          type: isExceeded ? "BUDGET_EXCEEDED" : "BUDGET_WARNING",

          priority: isExceeded ? "HIGH" : "NORMAL",

          title: isExceeded ? "Budget terlampaui" : "Budget hampir habis",

          message,

          budgetId: budget.id,
          alertId: alert.id,

          isRead: false,
        },
      });

      results.push({
        budgetId: budget.id,
        status: currentType,
        alertCreated: true,
        spentAmount,
        percentage,
      });

      continue;
    }

    // ============================================
    // Update existing active alert snapshot
    // ============================================

    await prisma.budgetAlert.update({
      where: {
        id: existingAlert.id,
      },

      data: {
        spentAmount,
        budgetAmount,
        percentage,
      },
    });

    results.push({
      budgetId: budget.id,
      status: currentType,
      alertCreated: false,
      spentAmount,
      percentage,
    });
  }

  return results;
}
