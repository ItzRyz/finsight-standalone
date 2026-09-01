"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { categorySchema } from "@/lib/validators/category";
import { getZodErrors } from "@/lib/validators/utils";

export async function getCustomCategories() {
  const { dbUser } = await getCurrentUser();
  return prisma.category.findMany({
    where: { userId: dbUser.id, type: "CUSTOM" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, icon: true, color: true, description: true, createdAt: true, _count: { select: { expenses: true, budgets: true } } },
  });
}

export async function createCategory(formData: FormData) {
  const { dbUser } = await getCurrentUser();
  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    icon: String(formData.get("icon") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
  });
  if (!parsed.success) return { success: false, fieldErrors: getZodErrors(parsed.error) } as const;
  const { name, icon, color } = parsed.data;
  try {
    const created = await prisma.category.create({
      data: { userId: dbUser.id, type: "CUSTOM", name, icon: icon || "🏷️", color: color || "#64748B" },
      select: { id: true, name: true, icon: true, color: true },
    });
    revalidatePath("/categories");
    revalidatePath("/expenses");
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    revalidatePath("/expenses/review");
    revalidatePath("/categories");
    return { success: true, data: created } as const;
  } catch {
    return { success: false, error: "Category name is already in use." } as const;
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const { dbUser } = await getCurrentUser();
  const category = await prisma.category.findFirst({ where: { id, userId: dbUser.id, type: "CUSTOM" }, select: { id: true } });
  if (!category) return { success: false, error: "Category not found." } as const;
  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    icon: String(formData.get("icon") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
  });
  if (!parsed.success) return { success: false, fieldErrors: getZodErrors(parsed.error) } as const;
  try {
    const updated = await prisma.category.update({
      where: { id: category.id },
      data: { name: parsed.data.name, icon: parsed.data.icon || "🏷️", color: parsed.data.color || "#64748B" },
      select: { id: true, name: true, icon: true, color: true },
    });
    revalidatePath("/categories");
    revalidatePath("/expenses");
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    revalidatePath("/expenses/review");
    return { success: true, data: updated } as const;
  } catch {
    return { success: false, error: "Category name is already in use." } as const;
  }
}

export async function deleteCategory(id: string) {
  const { dbUser } = await getCurrentUser();
  const category = await prisma.category.findFirst({
    where: { id, userId: dbUser.id, type: "CUSTOM" },
    select: { id: true, _count: { select: { expenses: true, budgets: true } } },
  });
  if (!category) return { success: false, error: "Category not found." } as const;
  await prisma.category.delete({ where: { id: category.id } });
  revalidatePath("/categories");
  revalidatePath("/expenses");
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  revalidatePath("/expenses/review");
  return { success: true, counts: category._count } as const;
}
