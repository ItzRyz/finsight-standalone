import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/signin-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignUpForm } from "@/components/auth/signup-form";

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage your expenses and budgets."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/auth"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid h-[32px] w-full grid-cols-2 rounded-[8px] bg-[#dfe1e5] p-1">
          <TabsTrigger
            value="login"
            className="h-[24px] rounded-[6px] text-[10px] font-semibold data-[state=active]:bg-white data-[state=active]:text-[#292929] data-[state=active]:shadow-sm"
          >
            Sign In
          </TabsTrigger>

          <TabsTrigger
            value="register"
            className="h-[24px] rounded-[6px] text-[10px] font-semibold data-[state=active]:bg-white data-[state=active]:text-[#292929] data-[state=active]:shadow-sm"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>

        {/* Login */}

        <TabsContent value="login" className="mt-5">
          <SignInForm />
        </TabsContent>

        {/* Register */}

        <TabsContent value="register" className="mt-5">
          <SignUpForm />
        </TabsContent>
      </Tabs>
    </AuthShell>
  );
}
