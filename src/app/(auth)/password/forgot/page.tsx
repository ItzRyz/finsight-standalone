import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return <AuthShell><div className="space-y-5"><div><h2 className="text-xl font-bold">Forgot password</h2><p className="text-sm text-muted-foreground">We&apos;ll send you a secure reset link.</p></div><ForgotPasswordForm /><Link href="/auth" className="block text-center text-sm text-primary hover:underline">Back to sign in</Link></div></AuthShell>;
}
