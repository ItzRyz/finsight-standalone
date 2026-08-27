"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function getNotifications() {
  const { dbUser } = await getCurrentUser();

  return prisma.notification.findMany({
    where: {
      userId: dbUser.id,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 50,
  });
}

export async function markNotificationAsRead(notificationId: string) {
  const { dbUser } = await getCurrentUser();

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId: dbUser.id,
    },

    select: {
      id: true,
    },
  });

  if (!notification) {
    return {
      success: false,
      error: "Notification not found.",
    };
  }

  await prisma.notification.update({
    where: {
      id: notification.id,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return {
    success: true,
  };
}

export async function markAllNotificationsAsRead() {
  const { dbUser } = await getCurrentUser();

  await prisma.notification.updateMany({
    where: {
      userId: dbUser.id,
      isRead: false,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return {
    success: true,
  };
}
