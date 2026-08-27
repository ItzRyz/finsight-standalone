"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

import { useNotificationStore } from "@/stores/notification-store";

type RealtimeNotification = {
  id: string;
  userId: string;

  type: "BUDGET_WARNING" | "BUDGET_EXCEEDED" | "EXPENSE_CATEGORIZED" | "SYSTEM";

  priority: "LOW" | "NORMAL" | "HIGH";

  title: string;
  message: string;

  expenseId: string | null;
  budgetId: string | null;
  alertId: string | null;

  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export function useNotificationRealtime(userId: string) {
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",

          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          const data = payload.new as RealtimeNotification;

          addNotification({
            ...data,

            createdAt: new Date(data.createdAt),

            readAt: data.readAt ? new Date(data.readAt) : null,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, addNotification]);
}
