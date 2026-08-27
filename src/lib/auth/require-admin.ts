import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function requireAdmin() {
  const currentUser = await getCurrentUser();

  if (currentUser.dbUser.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return currentUser;
}
