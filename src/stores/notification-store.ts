// src/stores/notification-store.ts

import { create } from "zustand";

export type AppNotification = {
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

type NotificationStore = {
  notifications: AppNotification[];

  setNotifications: (notifications: AppNotification[]) => void;

  addNotification: (notification: AppNotification) => void;

  markAsRead: (id: string) => void;

  markAllAsRead: () => void;

  unreadCount: number;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  unreadCount: 0,

  setNotifications: (notifications) => {
    set({
      notifications,

      unreadCount: notifications.filter((notification) => !notification.isRead)
        .length,
    });
  },

  addNotification: (notification) => {
    set((state) => {
      const exists = state.notifications.some(
        (item) => item.id === notification.id,
      );

      if (exists) {
        return state;
      }

      return {
        notifications: [notification, ...state.notifications],

        unreadCount: notification.isRead
          ? state.unreadCount
          : state.unreadCount + 1,
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find((item) => item.id === id);

      if (!notification || notification.isRead) {
        return state;
      }

      return {
        notifications: state.notifications.map((item) =>
          item.id === id
            ? {
                ...item,
                isRead: true,
                readAt: new Date(),
              }
            : item,
        ),

        unreadCount: Math.max(state.unreadCount - 1, 0),
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: new Date(),
      })),

      unreadCount: 0,
    }));
  },
}));
