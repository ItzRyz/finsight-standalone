"use client";

import { LoginInput, loginSchema } from "@/lib/validators/auth";
import { useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/actions/auth";
import Link from "next/link";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { setServerErrors } from "@/lib/forms/set-server-errors";
import { useRouter } from "next/navigation";

export function SignInForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState<boolean>(false);

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginInput> = async (values) => {
    const formData = new FormData();

    formData.append("email", values.email);
    formData.append("password", values.password);

    const result = await signIn(formData);

    if (!result.success) {
      setServerErrors(setError, result.fieldErrors, result.error);
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FieldGroup>
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                aria-invalid={fieldState.invalid}
                placeholder="you@example.id"
                autoComplete="on"
                disabled={isSubmitting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Password</FieldLabel>

              <div className="relative">
                <Input
                  {...field}
                  id="password"
                  type={showPass ? "text" : "password"}
                  aria-invalid={fieldState.invalid}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPass((prev) => !prev)}
                  disabled={isSubmitting}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {showPass ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-[9px] font-medium text-primary hover:underline"
                  onClick={() => {
                    router.push("/password/forgot")
                  }}
                >
                  Lupa kata sandi?
                </button>
              </div>
            </Field>
          )}
        />
      </FieldGroup>

      {errors.root?.server?.message && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {errors.root?.server?.message}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}

        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <Link href="/password/forgot" className="block text-center text-sm text-primary hover:underline">
        Forgot password?
      </Link>

      {/* ================= REGISTER ================= */}

      <p className="mt-7 text-center text-[10px] text-[#999]">
        Not have an account?{" "}
        <button
          type="button"
          className="font-semibold text-primary hover:underline"
          onClick={() => {
            router.push("/signup");
          }}
        >
            Sign Up now!
        </button>
      </p>
    </form>
  );
}
