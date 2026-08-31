import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { AdminNotifications } from "@/components/admin/admin-notifications";
import { UserHeader } from "@/components/user/user-header";

export default async function AdminNotificationsPage() {
  await requireAdmin();
  const notifications = await prisma.notification.findMany({ take: 100, include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <UserHeader title="Admin — Notifications" />
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">Most recent 100 notifications across all users.</p>
        </div>
        <AdminNotifications notifications={notifications} />
      </main>
    </>
  );
}
