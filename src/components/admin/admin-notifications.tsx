"use client";

import { useTransition } from "react";
import { deleteNotificationAsAdmin, markNotificationReadAsAdmin } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "BUDGET_WARNING" | "BUDGET_EXCEEDED" | "EXPENSE_CATEGORIZED" | "SYSTEM";
  priority: "LOW" | "NORMAL" | "HIGH";
  isRead: boolean;
  createdAt: Date;
  user: { email: string; name: string | null };
};

export function AdminNotifications({ notifications }: { notifications: Notification[] }) {
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<unknown>) => startTransition(() => void fn());

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">System notifications</caption>
        <thead className="border-b text-left text-muted-foreground">
          <tr>
            <th scope="col" className="p-3 font-medium">Notification</th>
            <th scope="col" className="p-3 font-medium">User</th>
            <th scope="col" className="p-3 font-medium">Status</th>
            <th scope="col" className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification) => (
            <tr key={notification.id} className="border-b last:border-0">
              <td className="p-3">
                <p className="font-semibold">{notification.title}</p>
                <p className="mt-1 max-w-lg text-xs text-muted-foreground">{notification.message}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {notification.type} · {notification.priority}
                </p>
              </td>
              <td className="p-3">{notification.user.email}</td>
              <td className="p-3">
                <span className={notification.isRead ? "text-muted-foreground" : "font-medium text-primary"}>
                  {notification.isRead ? "Read" : "Unread"}
                </span>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => run(() => markNotificationReadAsAdmin(notification.id, !notification.isRead))}
                  >
                    {notification.isRead ? "Mark unread" : "Mark read"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" disabled={pending} className="text-destructive">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete notification?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this notification for {notification.user.email}.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => run(() => deleteNotificationAsAdmin(notification.id))}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
