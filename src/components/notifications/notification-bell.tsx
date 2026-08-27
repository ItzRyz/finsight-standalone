"use client";
// Deprecated: use NotificationMenu instead (which includes the bell + dropdown).
// Kept for backwards-compat; not rendered in UserHeader after Phase 2 cleanup.
import { Bell } from "lucide-react";

import { useNotificationStore } from "@/stores/notification-store";

import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="size-4" />

      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      <span className="sr-only">Notifications</span>
    </Button>
  );
}
