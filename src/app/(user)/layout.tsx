import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user/user-sidebar";
import { getNotifications } from "@/actions/notifications";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { NotificationProvider } from "@/components/providers/notification-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authUser, dbUser } = await getCurrentUser();

  if (!dbUser) {
    redirect("/auth?error=profile_missing");
  }

  const notifications = await getNotifications();

  return (
    <SidebarProvider>
      <UserSidebar
        user={{
          name: dbUser.name,
          email: authUser.email,
          role: dbUser.role,
          locale: dbUser.locale as "id" | "en",
          currency: dbUser.currency as "IDR" | "USD" | "EUR" | "JPY" | "SGD",
        }}
      />
      <SidebarInset>
        <NotificationProvider
          userId={dbUser.id}
          initialNotifications={notifications}
        />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
