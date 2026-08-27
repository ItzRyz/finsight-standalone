import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function getAvailableCategories() {
  const { dbUser } = await getCurrentUser();

  return prisma.category.findMany({
    where: {
      OR: [
        {
          type: "SYSTEM",
          userId: null,
        },
        {
          type: "CUSTOM",
          userId: dbUser.id,
        },
      ],
    },

    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
    },

    orderBy: {
      name: "asc",
    },
  });
}
