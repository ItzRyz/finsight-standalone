"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { useForm, Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  expenseSchema,
  //   type ExpenseFormInput,
  //   type ExpenseFormOutput,
  type ExpenseInput,
} from "@/lib/validators/expense";
import { useLocaleStore } from "@/stores/locale-store";
import { toast } from "sonner";

import { createExpense } from "@/actions/expenses";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type Category = {
  id: string;
  name: string;
  icon: string | null;
};

type AddExpenseDialogProps = {
  categories: Category[];
};

export function AddExpenseDialog({ categories }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const preferredCurrency = useLocaleStore((s) => s.currency);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: undefined as unknown as number,
      type: "EXPENSE",
      categoryId: "",
      expenseDate: new Date(),
      merchant: "",
      location: "",
      receiptUrl: "",
      currency: preferredCurrency,
    },
  });

  async function onSubmit(values: ExpenseInput) {
    const formData = new FormData();

    formData.set("title", values.title);

    formData.set("description", values.description ?? "");

    formData.set("amount", String(values.amount));

    formData.set("type", values.type);

    formData.set("categoryId", values.categoryId ?? "");

    formData.set("expenseDate", values.expenseDate.toISOString());

    formData.set("merchant", values.merchant ?? "");

    formData.set("location", values.location ?? "");

    formData.set("receiptUrl", values.receiptUrl ?? "");
    formData.set("currency", (values.currency as string) ?? preferredCurrency);

    const result = await createExpense(formData);

    if (!result.success) {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof ExpenseInput, {
            type: "server",
            message,
          });
        });
      }

      if (result.error) {
        setError("root.server", {
          type: "server",
          message: result.error,
        });
        toast.error(result.error);
      }

      return;
    }

    toast.success("Transaction created");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add Transaction
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Type */}

          <Controller
            name="type"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Transaction Type</FieldLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="EXPENSE">Expense</SelectItem>

                    <SelectItem value="INCOME">Income</SelectItem>
                  </SelectContent>
                </Select>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Title */}

          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Title</FieldLabel>

                <Input {...field} placeholder="e.g. Lunch" />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Amount */}

          <Controller
            name="amount"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Amount</FieldLabel>

                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  placeholder="50000"
                  value={field.value == null ? "" : String(field.value)}
                  onChange={(event) => {
                    const v = event.target.value;
                    field.onChange(v === "" ? undefined : Number(v));
                  }}
                  onFocus={(e) => e.target.select()}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Category */}

          <Controller
            name="categoryId"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Category</FieldLabel>

                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Date */}

          <Controller
            name="expenseDate"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Date</FieldLabel>

                <Input
                  type="date"
                  value={
                    field.value ? field.value.toISOString().split("T")[0] : ""
                  }
                  onChange={(event) => {
                    field.onChange(new Date(`${event.target.value}T00:00:00`));
                  }}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Merchant */}

          <Controller
            name="merchant"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Merchant</FieldLabel>

                <Input {...field} placeholder="e.g. Starbucks" />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Location */}

          <Controller
            name="location"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Location</FieldLabel>

                <Input {...field} placeholder="e.g. Jakarta" />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Description */}

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Description</FieldLabel>

                <Textarea {...field} placeholder="Optional description..." />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Currency */}

          <Controller
            name="currency"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Currency</FieldLabel>
                <Select value={field.value as string} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR — Rupiah</SelectItem>
                    <SelectItem value="USD">USD — Dollar</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                    <SelectItem value="JPY">JPY — Yen</SelectItem>
                    <SelectItem value="SGD">SGD — Dollar</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Receipt (Storage — public read) */}

          <Controller
            name="receiptUrl"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Receipt URL (public)</FieldLabel>
                <Input {...field} placeholder="https://... or upload via Storage later" />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Server error */}

          {errors.root?.server?.message && (
            <p className="text-sm text-destructive">
              {errors.root.server.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Transaction"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
