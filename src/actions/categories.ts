"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function getCustomCategories() {
  const { dbUser } = await getCurrentUser();
  return prisma.category.findMany({ where: { userId: dbUser.id, type: "CUSTOM" }, orderBy: { name: "asc" } });
}

export async function createCategory(formData: FormData) {
  const { dbUser } = await getCurrentUser();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 60) return { success: false, error: "Category name must be 2-60 characters." };
  try {
    await prisma.category.create({ data: { userId: dbUser.id, type: "CUSTOM", name, icon: String(formData.get("icon") || "🏷️"), color: String(formData.get("color") || "#64748B") } });
    revalidatePath("/categories"); revalidatePath("/expenses"); revalidatePath("/budgets");
    return { success: true };
  } catch { return { success: false, error: "Category name is already in use." }; }
}

export async function deleteCategory(id: string) {
  const { dbUser } = await getCurrentUser();
  const category = await prisma.category.findFirst({ where: { id, userId: dbUser.id, type: "CUSTOM" }, select: { id: true } });
  if (!category) return { success: false, error: "Category not found." };
  await prisma.category.delete({ where: { id: category.id } });
  revalidatePath("/categories"); revalidatePath("/expenses"); revalidatePath("/budgets");
  return { success: true };
}
