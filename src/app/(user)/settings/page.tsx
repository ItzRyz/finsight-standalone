import { getCurrentUser } from "@/lib/auth/get-current-user";
import { SettingsForm } from "@/components/user/settings-form";

export default async function SettingsPage() {
  const { authUser, dbUser } = await getCurrentUser();

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and account.</p>
      </div>
      <SettingsForm name={dbUser.name ?? ""} email={authUser.email ?? ""} />
    </main>
  );
}
