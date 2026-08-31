"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";

import { deleteBudget, updateBudget } from "@/actions/budgets";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field, FieldLabel } from "@/components/ui/field";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  color?: string | null;
};

type Props = {
  id: string;
  name: string | null;
  amount: number;
  warningThreshold: number;
  categoryId: string | null;
  period: "MONTHLY" | "YEARLY";
  currency?: string | null;
  categories: Category[];
};

export function BudgetActions({
  id,
  name,
  amount,
  warningThreshold,
  categoryId,
  period,
  currency,
  categories,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: name ?? "",
    amount: String(amount),
    categoryId: categoryId ?? "",
    period,
    warningThreshold: String(warningThreshold),
    currency: (currency as string) ?? "IDR",
  });

  function resetForm() {
    setForm({
      name: name ?? "",
      amount: String(amount),
      categoryId: categoryId ?? "",
      period,
      warningThreshold: String(warningThreshold),
      currency: (currency as string) ?? "IDR",
    });
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      resetForm();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const result = await updateBudget(id, formData);

    if (!result.success) {
      const msg = result.error ?? Object.values(result.fieldErrors ?? {})[0] ?? "Gagal mengubah budget.";
      setError(msg);
      toast.error(msg);
      setIsSubmitting(false);
      return;
    }

    toast.success("Budget updated");
    setIsSubmitting(false);
    setOpen(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteBudget(id);
    if (!result.success) {
      setError(result.error ?? "Gagal menghapus budget.");
      toast.error(result.error ?? "Gagal menghapus budget.");
      setIsDeleting(false);
      return;
    }
    toast.success("Budget deleted");
    setIsDeleting(false);
  }

  return (
    <div className="flex justify-end gap-1">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="Edit budget"
          >
            <Pencil />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit budget</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor={`budget-name-${id}`}>
                Budget Name
              </FieldLabel>
              <Input
                id={`budget-name-${id}`}
                name="name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Food Budget"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`budget-amount-${id}`}>
                Amount
              </FieldLabel>
              <Input
                id={`budget-amount-${id}`}
                name="amount"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                onFocus={(e) => e.target.select()}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Category</FieldLabel>
              <Select
                value={form.categoryId || "__ALL__"}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    categoryId: value === "__ALL__" ? "" : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="__ALL__">
                    💰 All categories
                  </SelectItem>

                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon ?? "🏷️"} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                type="hidden"
                name="categoryId"
                value={form.categoryId}
              />
            </Field>

            <Field>
              <FieldLabel>Period</FieldLabel>
              <Select
                value={form.period}
                onValueChange={(value: "MONTHLY" | "YEARLY") =>
                  setForm((current) => ({
                    ...current,
                    period: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>

              <input
                type="hidden"
                name="period"
                value={form.period}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`budget-threshold-${id}`}>
                Warning Threshold
              </FieldLabel>

              <div className="flex items-center gap-2">
                <Input
                  id={`budget-threshold-${id}`}
                  name="warningThreshold"
                  type="number"
                  min="1"
                  max="100"
                  inputMode="numeric"
                  value={form.warningThreshold}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      warningThreshold: event.target.value,
                    }))
                  }
                  onFocus={(e) => e.target.select()}
                  required
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </Field>

            <Field>
              <FieldLabel>Currency</FieldLabel>
              <Select
                value={form.currency}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    currency: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR — Rupiah</SelectItem>
                  <SelectItem value="USD">USD — Dollar</SelectItem>
                  <SelectItem value="EUR">EUR — Euro</SelectItem>
                  <SelectItem value="JPY">JPY — Yen</SelectItem>
                  <SelectItem value="SGD">SGD — Dollar</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="currency" value={form.currency} />
            </Field>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="icon-xs"
            variant="ghost"
            className="text-destructive"
            disabled={isDeleting}
            aria-label="Delete budget"
          >
            {isDeleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 />}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete budget?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this budget. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
