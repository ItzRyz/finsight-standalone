import type { BudgetPeriod } from "@/generated/prisma/client";

export function getBudgetPeriod(period: BudgetPeriod, date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  if (period === "MONTHLY") {
    const start = new Date(year, month, 1, 0, 0, 0, 0);

    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return {
      start,
      end,
    };
  }

  const start = new Date(year, 0, 1, 0, 0, 0, 0);

  const end = new Date(year, 11, 31, 23, 59, 59, 999);

  return {
    start,
    end,
  };
}
