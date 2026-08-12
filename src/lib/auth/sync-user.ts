import type { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type SyncUserInput = {
  id: string;
  email: string;
  name?: string | null;
};

export async function syncUser(input: SyncUserInput): Promise<User> {
  return prisma.user.upsert({
    where: {
      id: input.id,
    },

    create: {
      id: input.id,
      email: input.email,
      name: input.name,
    },

    update: {
      email: input.email,
      ...(input.name !== undefined ? { name: input.name } : {}),
    },
  });
}
