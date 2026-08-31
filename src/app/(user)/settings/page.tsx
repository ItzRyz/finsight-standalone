import { getCurrentUser } from "@/lib/auth/get-current-user";
import { SettingsForm } from "@/components/user/settings-form";
import { UserHeader } from "@/components/user/user-header";

export default async function SettingsPage() {
  const { authUser, dbUser } = await getCurrentUser();

  return (
    <>
      <UserHeader title="Settings" />
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and account — also available via sidebar modal.</p>
        </div>
        <SettingsForm
          name={dbUser.name ?? ""}
          email={authUser.email ?? ""}
          locale={(dbUser.locale as "id" | "en") ?? "id"}
          currency={(dbUser.currency as "IDR" | "USD" | "EUR" | "JPY" | "SGD") ?? "IDR"}
        />
      </main>
    </>
  );
}
