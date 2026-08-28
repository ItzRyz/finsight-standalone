"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function getBudgetAlerts(filter?: { type?: "WARNING" | "EXCEEDED"; resolved?: "active" | "resolved" | "all" }) {
  const { dbUser } = await getCurrentUser();
  const where: Record<string, unknown> = { userId: dbUser.id };
  if (filter?.type) where.type = filter.type;
  if (filter?.resolved === "active") where.resolvedAt = null;
  if (filter?.resolved === "resolved") where.resolvedAt = { not: null };
  return prisma.budgetAlert.findMany({
    where,
    include: { budget: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
