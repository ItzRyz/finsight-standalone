import { getNotifications } from "@/actions/notifications";
import { NotificationList } from "@/components/notifications/notification-list";
import { UserHeader } from "@/components/user/user-header";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <>
      <UserHeader title="Notifications" />
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Review budget alerts and account activity.
          </p>
        </div>
        <NotificationList notifications={notifications} />
      </main>
    </>
  );
}
