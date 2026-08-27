"use client";

import { useState } from "react";
import { createCategory, deleteCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string; icon: string | null; color: string | null };
export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [error, setError] = useState<string | null>(null);
  async function add(formData: FormData) { const result = await createCategory(formData); if (!result.success) setError(result.error ?? "Unable to create category."); else window.location.reload(); }
  async function remove(id: string) { const result = await deleteCategory(id); if (result.success) setCategories((items) => items.filter((item) => item.id !== id)); }
  return <div className="max-w-2xl space-y-5"><form action={add} className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_6rem_7rem_auto]"><Input name="name" placeholder="Category name" required /><Input name="icon" defaultValue="🏷️" aria-label="Icon" /><Input name="color" type="color" defaultValue="#64748B" /><Button>Add category</Button>{error && <p className="text-sm text-destructive sm:col-span-4">{error}</p>}</form><div className="divide-y rounded-xl border bg-card">{categories.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No custom categories yet.</p> : categories.map((category) => <div key={category.id} className="flex items-center justify-between p-4"><span>{category.icon} {category.name}</span><Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(category.id)}>Delete</Button></div>)}</div></div>;
}
