"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { updateExpense } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = { id: string; name: string; icon: string | null };
type Expense = {
  id: string;
  title: string;
  amount: unknown;
  type: "EXPENSE" | "INCOME";
  categoryId: string | null;
  expenseDate: Date;
  description: string | null;
  merchant: string | null;
  location: string | null;
  receiptUrl: string | null;
};

export function EditExpenseDialog({ expense, categories }: { expense: Expense; categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState(expense.type);
  const [categoryId, setCategoryId] = useState(expense.categoryId ?? "");

  async function submit(formData: FormData) {
    // Sync controlled selects into formData
    formData.set("type", type);
    formData.set("categoryId", categoryId);
    const result = await updateExpense(expense.id, formData);
    if (!result.success) {
      setError(result.error ?? result.fieldErrors?.title ?? "Unable to update transaction.");
      return;
    }
    setError(null);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Edit ${expense.title}`}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit transaction</DialogTitle>
        </DialogHeader>
        <form action={submit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor={`edit-title-${expense.id}`}>Title</Label>
            <Input id={`edit-title-${expense.id}`} name="title" defaultValue={expense.title} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-amount-${expense.id}`}>Amount (IDR)</Label>
            <Input
              id={`edit-amount-${expense.id}`}
              name="amount"
              type="number"
              min="1"
              step="0.01"
              defaultValue={Number(expense.amount)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger aria-label="Transaction type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="type" value={type} />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={categoryId || "__none__"} onValueChange={(v) => setCategoryId(v === "__none__" ? "" : v)}>
              <SelectTrigger aria-label="Category">
                <SelectValue placeholder="Uncategorized" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Uncategorized</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="categoryId" value={categoryId} />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-date-${expense.id}`}>Date</Label>
            <Input
              id={`edit-date-${expense.id}`}
              name="expenseDate"
              type="date"
              defaultValue={new Date(expense.expenseDate).toISOString().slice(0, 10)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-merchant-${expense.id}`}>Merchant</Label>
            <Input id={`edit-merchant-${expense.id}`} name="merchant" defaultValue={expense.merchant ?? ""} placeholder="Merchant" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-location-${expense.id}`}>Location</Label>
            <Input id={`edit-location-${expense.id}`} name="location" defaultValue={expense.location ?? ""} placeholder="Location" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-receipt-${expense.id}`}>Receipt URL</Label>
            <Input id={`edit-receipt-${expense.id}`} name="receiptUrl" defaultValue={expense.receiptUrl ?? ""} placeholder="https://..." type="url" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-desc-${expense.id}`}>Description</Label>
            <Input id={`edit-desc-${expense.id}`} name="description" defaultValue={expense.description ?? ""} placeholder="Description" />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" className="w-full">
            Save changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
