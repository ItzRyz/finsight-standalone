"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function setUserActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/users");
}

export async function setUserRole(id: string, role: "USER" | "ADMIN") {
  const { dbUser } = await requireAdmin();
  if (id === dbUser.id && role !== "ADMIN") throw new Error("You cannot remove your own admin role.");
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
}

export async function createSystemCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 60) return { success: false, error: "Name must be 2–60 characters." };
  try {
    await prisma.category.create({ data: { name, type: "SYSTEM", icon: String(formData.get("icon") || "🏷️"), color: String(formData.get("color") || "#64748B"), description: String(formData.get("description") || "") || null } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch { return { success: false, error: "A system category with this name already exists." }; }
}

export async function updateSystemCategory(id: string, formData: FormData) {
  await requireAdmin();
  const category = await prisma.category.findFirst({ where: { id, type: "SYSTEM", userId: null }, select: { id: true } });
  if (!category) return { success: false, error: "System category not found." };
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 60) return { success: false, error: "Name must be 2–60 characters." };
  await prisma.category.update({ where: { id }, data: { name, icon: String(formData.get("icon") || "🏷️"), color: String(formData.get("color") || "#64748B"), description: String(formData.get("description") || "") || null } });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteSystemCategory(id: string) {
  await requireAdmin();
  const category = await prisma.category.findFirst({ where: { id, type: "SYSTEM", userId: null }, select: { id: true, _count: { select: { expenses: true, budgets: true, aiCategorizations: true } } } });
  if (!category) return { success: false, error: "System category not found." };
  if (category._count.expenses || category._count.budgets || category._count.aiCategorizations) return { success: false, error: "This category is in use and cannot be deleted." };
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteExpenseAsAdmin(id: string) {
  await requireAdmin();
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/admin/expenses");
  return { success: true };
}

export async function deleteNotificationAsAdmin(id: string) {
  await requireAdmin();
  await prisma.notification.delete({ where: { id } });
  revalidatePath("/admin/notifications");
  return { success: true };
}

export async function markNotificationReadAsAdmin(id: string, isRead: boolean) {
  await requireAdmin();
  await prisma.notification.update({ where: { id }, data: { isRead, readAt: isRead ? new Date() : null } });
  revalidatePath("/admin/notifications");
  return { success: true };
}
