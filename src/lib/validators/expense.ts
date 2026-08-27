import { z } from "zod";

export const expenseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Judul minimal 2 karakter")
    .max(100, "Judul maksimal 100 karakter"),

  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .or(z.literal("")),

  amount: z
    .number()
    .positive("Nominal harus lebih dari 0")
    .max(9999999999999, "Nominal terlalu besar"),

  type: z.enum(["EXPENSE", "INCOME"]),

  categoryId: z
    .string()
    .uuid("Kategori tidak valid")
    .optional()
    .or(z.literal("")),

  expenseDate: z.date({
    error: "Tanggal tidak valid",
  }),

  merchant: z
    .string()
    .trim()
    .max(150, "Merchant terlalu panjang")
    .optional()
    .or(z.literal("")),

  location: z
    .string()
    .trim()
    .max(200, "Lokasi terlalu panjang")
    .optional()
    .or(z.literal("")),

  receiptUrl: z.url("URL receipt tidak valid").optional().or(z.literal("")),
});

// export type ExpenseFormInput = z.input<typeof expenseSchema>;

// export type ExpenseFormOutput = z.output<typeof expenseSchema>;

export type ExpenseInput = z.infer<typeof expenseSchema>;
