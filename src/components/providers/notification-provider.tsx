"use client";

import { useEffect } from "react";

import { useNotificationStore } from "@/stores/notification-store";

import { useNotificationRealtime } from "@/hooks/use-notification-realtime";

type InitialNotification = {
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
  readAt: Date | null;
  createdAt: Date;
};

type Props = {
  userId: string;
  initialNotifications: InitialNotification[];
};

export function NotificationProvider({ userId, initialNotifications }: Props) {
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  );

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications, setNotifications]);

  useNotificationRealtime(userId);

  return null;
}
