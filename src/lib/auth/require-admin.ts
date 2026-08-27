import { getCurrentUser } from "@/lib/auth/get-current-user";

export class ForbiddenError extends Error {
  constructor(message = "FORBIDDEN: Admin access required") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireAdmin() {
  const currentUser = await getCurrentUser();

  if (currentUser.dbUser.role !== "ADMIN") {
    throw new ForbiddenError();
  }

  return currentUser;
}
