"use client";

import { Bell, CheckCheck } from "lucide-react";

import { useNotificationStore } from "@/stores/notification-store";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/actions/notifications";

import { Button } from "@/components/ui/button";

import { ScrollArea } from "@/components/ui/scroll-area";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationMenu() {
  const notifications = useNotificationStore((state) => state.notifications);

  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const markAsRead = useNotificationStore((state) => state.markAsRead);

  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  async function handleRead(id: string) {
    markAsRead(id);

    await markNotificationAsRead(id);
  }

  async function handleReadAll() {
    markAllAsRead();

    await markAllNotificationsAsRead();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />

          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-90 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReadAll}
              className="h-7 text-xs"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="h-100">
          {notifications.length === 0 ? (
            <div className="flex h-62.5 items-center justify-center px-6 text-center">
              <div>
                <Bell className="mx-auto mb-3 size-8 text-muted-foreground" />

                <p className="font-medium">No notifications</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  You&apos;re all caught up.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleRead(notification.id)}
                  className={`w-full px-4 py-3 text-left transition hover:bg-muted/50 ${
                    !notification.isRead ? "bg-muted/30" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`mt-1 size-2 shrink-0 rounded-full ${
                        notification.isRead ? "bg-transparent" : "bg-primary"
                      }`}
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
