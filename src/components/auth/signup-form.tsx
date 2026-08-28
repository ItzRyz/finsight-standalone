"use client";

import { signUp } from "@/actions/auth";
import { setServerErrors } from "@/lib/forms/set-server-errors";
import { RegisterInput, registerSchema } from "@/lib/validators/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Field, FieldLabel, FieldError, FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function SignUpForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<RegisterInput> = async (values) => {
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("confirmPassword", values.confirmPassword);

    const result = await signUp(formData);

    if (!result.success) {
      setServerErrors(setError, result.fieldErrors, result.error);
      return;
    }

    if (result.data.requiresConfirmation) {
      setRegisteredEmail(values.email);
      return;
    }
  };

  if (registeredEmail) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10">
          <Mail className="size-5 text-primary" />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Check your mail!</h3>

          <p className="text-xs leading-relaxed text-muted-foreground">
            We have send an email verification message to your mail:
          </p>

          <p className="break-all text-xs font-semibold text-foreground">
            {registeredEmail}
          </p>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Please open the email and click the confirmation link to activate your
          account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                {...field}
                id="name"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="John Doe"
                autoComplete="on"
                disabled={isSubmitting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
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
                  autoComplete="off"
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
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>

              <div className="relative">
                <Input
                  {...field}
                  id="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  aria-invalid={fieldState.invalid}
                  placeholder="••••••••"
                  autoComplete="off"
                  disabled={isSubmitting}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPass((prev) => !prev)}
                  disabled={isSubmitting}
                  aria-label={
                    showConfirmPass ? "Hide password" : "Show password"
                  }
                  className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {showConfirmPass ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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

      <Button type="submit" className="w-full mt-8" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}

        {isSubmitting ? "Signing up..." : "Sign up"}
      </Button>

      <p className="mt-7 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          className="font-semibold text-primary hover:underline"
          onClick={() => {
            router.push("/auth");
          }}
        >
          Sign In now!
        </button>
      </p>
    </form>
  );
}
