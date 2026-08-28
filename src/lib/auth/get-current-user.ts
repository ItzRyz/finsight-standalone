import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    throw new Error("Authenticated user does not have an application profile.");
  }

  if (!dbUser.isActive) {
    // Force sign out deactivated accounts
    await supabase.auth.signOut();
    redirect("/auth?error=deactivated");
  }

  return {
    authUser: user,
    dbUser,
  };
}
