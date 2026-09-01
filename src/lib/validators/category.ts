import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(60, "Nama maksimal 60 karakter"),
  icon: z.string().trim().max(10, "Ikon terlalu panjang").optional().or(z.literal("")),
  color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, "Warna harus hex #RRGGBB").optional().or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;
