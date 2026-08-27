"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { updateExpense } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = { id: string; name: string; icon: string | null };
type Expense = { id: string; title: string; amount: unknown; type: "EXPENSE" | "INCOME"; categoryId: string | null; expenseDate: Date; description: string | null; merchant: string | null; location: string | null; receiptUrl: string | null };

export function EditExpenseDialog({ expense, categories }: { expense: Expense; categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(formData: FormData) {
    const result = await updateExpense(expense.id, formData);
    if (!result.success) return setError(result.error ?? "Unable to update transaction.");
    setOpen(false);
  }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Edit transaction"><Pencil /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Edit transaction</DialogTitle></DialogHeader><form action={submit} className="space-y-3"><Input name="title" defaultValue={expense.title} required /><Input name="amount" type="number" min="1" step="0.01" defaultValue={Number(expense.amount)} required /><Select name="type" defaultValue={expense.type}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EXPENSE">Expense</SelectItem><SelectItem value="INCOME">Income</SelectItem></SelectContent></Select><select name="categoryId" defaultValue={expense.categoryId ?? ""} className="h-8 w-full rounded-lg border bg-background px-2 text-sm"><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.icon} {category.name}</option>)}</select><Input name="expenseDate" type="date" defaultValue={new Date(expense.expenseDate).toISOString().slice(0, 10)} required /><Input name="merchant" defaultValue={expense.merchant ?? ""} placeholder="Merchant" /><Input name="location" defaultValue={expense.location ?? ""} placeholder="Location" /><Input name="receiptUrl" defaultValue={expense.receiptUrl ?? ""} placeholder="Receipt URL" /><Input name="description" defaultValue={expense.description ?? ""} placeholder="Description" />{error && <p className="text-sm text-destructive">{error}</p>}<Button type="submit" className="w-full">Save changes</Button></form></DialogContent></Dialog>;
}
