import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return <AuthShell><div className="space-y-5"><div><h2 className="text-xl font-bold">Reset password</h2><p className="text-sm text-muted-foreground">Choose a new secure password.</p></div><ResetPasswordForm /></div></AuthShell>;
}
