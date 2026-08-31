import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { SystemCategoryManager } from "@/components/admin/system-category-manager";
import { UserHeader } from "@/components/user/user-header";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ where: { type: "SYSTEM", userId: null }, select: { id: true, name: true, description: true, icon: true, color: true, _count: { select: { expenses: true, budgets: true } } }, orderBy: { name: "asc" } });
  return (
    <>
      <UserHeader title="Admin — System Categories" />
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System categories</h1>
          <p className="text-sm text-muted-foreground">Categories shared by every FinSight user.</p>
        </div>
        <SystemCategoryManager categories={categories} />
      </main>
    </>
  );
}
