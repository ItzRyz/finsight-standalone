import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { AdminUsers } from "@/components/admin/admin-users";
import { UserHeader } from "@/components/user/user-header";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, _count: { select: { expenses: true } } }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <UserHeader title="Admin — Users" />
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Manage user access and roles.</p>
        </div>
        <AdminUsers users={users} />
      </main>
    </>
  );
}
