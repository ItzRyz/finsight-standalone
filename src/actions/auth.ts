"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validators/auth";
import { getZodErrors } from "@/lib/validators/utils";
import { ActionResult } from "@/types/action";

export async function signUp(
  formData: FormData,
): Promise<ActionResult<{ requiresConfirmation: boolean }>> {
  const validated = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return {
      success: false,
      fieldErrors: getZodErrors(validated.error),
    };
  }

  const { name, email, password } = validated.data;

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (!user) {
    return {
      success: false,
      error: "Unable to create account.",
    };
  }

  await prisma.user.create({
    data: {
      id: user.id,
      email: user.email!,
      name,
    },
  });

  return {
    success: true,
    data: { requiresConfirmation: !user.email_confirmed_at },
  };
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      success: false,
      fieldErrors: getZodErrors(validated.error),
    };
  }

  const { email, password } = validated.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}

export async function forgotPassword(formData: FormData) {
  const validated = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return {
      success: false,
      error: getZodErrors(validated.error),
    };
  }

  const { email } = validated.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/password/reset`,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

export async function updatePassword(
  password: string,
  confirmPassword: string,
) {
  const validated = resetPasswordSchema.safeParse({
    password,
    confirmPassword,
  });

  if (!validated.success) {
    return {
      success: false,
      error: getZodErrors(validated.error),
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}
