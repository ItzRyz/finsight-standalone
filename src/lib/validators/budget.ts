import { z } from "zod";

export const budgetSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, "Nama maksimal 100 karakter")
    .optional()
    .or(z.literal("")),

  amount: z.number().positive("Budget harus lebih dari 0"),

  categoryId: z.string().optional().or(z.literal("")),

  period: z.enum(["MONTHLY", "YEARLY"]),

  warningThreshold: z.number().min(1, "Minimal 1%").max(100, "Maksimal 100%"),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
