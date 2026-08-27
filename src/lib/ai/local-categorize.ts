import { prisma } from "@/lib/prisma";

const rules: Record<string, string[]> = {
  Food: ["makan", "lunch", "dinner", "breakfast", "coffee", "kopi", "restaurant", "warung", "food", "groceries"],
  Transportation: ["grab", "gojek", "taxi", "fuel", "bensin", "transport", "parking", "parkir", "bus", "train"],
  Bills: ["internet", " listrik", "electric", "phone", "bill", "tagihan", "subscription", "netflix"],
  Shopping: ["shop", "shopping", "tokopedia", "shopee", "keyboard", "shoes", "clothes"],
  Health: ["medicine", "obat", "doctor", "dokter", "health", "apotek"],
  Entertainment: ["movie", "film", "game", "music", "concert", "entertainment"],
  Education: ["book", "buku", "course", "school", "education", "gramedia"],
  Travel: ["flight", "hotel", "travel", "ticket", "vacation", "pesawat"],
};

export async function classifyExpense(text: string) {
  const normalized = text.toLowerCase();
  const match = Object.entries(rules).find(([, keywords]) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );
  if (!match) return null;

  const category = await prisma.category.findFirst({
    where: { name: match[0], type: "SYSTEM", userId: null },
    select: { id: true },
  });
  if (!category) return null;

  return { categoryId: category.id, confidence: 0.82, categoryName: match[0] };
}
