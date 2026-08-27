"use client";

import { useTransition } from "react";
import { markAllNotificationsAsRead, markNotificationAsRead } from "@/actions/notifications";
import { useNotificationStore, type AppNotification } from "@/stores/notification-store";
import { Button } from "@/components/ui/button";

type Props = { notifications: AppNotification[] };

export function NotificationList({ notifications }: Props) {
  const [isPending, startTransition] = useTransition();
  const storeNotifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const items = storeNotifications.length ? storeNotifications : notifications;
  const hasUnread = items.some((notification) => !notification.isRead);

  function read(id: string) {
    markAsRead(id);
    startTransition(async () => {
      await markNotificationAsRead(id);
    });
  }

  function readAll() {
    markAllAsRead();
    startTransition(async () => {
      await markAllNotificationsAsRead();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" disabled={!hasUnread || isPending} onClick={readAll}>
          Mark all as read
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          You&apos;re all caught up.
        </div>
      ) : (
        <div className="divide-y rounded-xl border bg-card">
          {items.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => !notification.isRead && read(notification.id)}
              className="flex w-full items-start gap-4 p-4 text-left hover:bg-muted/50"
            >
              <span className={`mt-1 size-2 rounded-full ${notification.isRead ? "bg-muted" : "bg-primary"}`} />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{notification.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{notification.message}</span>
                <span className="mt-2 block text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString("id-ID")}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
