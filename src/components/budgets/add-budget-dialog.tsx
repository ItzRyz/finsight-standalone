"use client";

import { useState } from "react";

import { Loader2, Plus } from "lucide-react";

import { useForm, Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { budgetSchema, type BudgetInput } from "@/lib/validators/budget";

import { createBudget } from "@/actions/budgets";

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
  color?: string | null;
};

export function AddBudgetDialog({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),

    defaultValues: {
      name: "",
      amount: 0,
      categoryId: "",
      period: "MONTHLY",
      warningThreshold: 80,
    },
  });

  async function onSubmit(values: BudgetInput) {
    const formData = new FormData();

    formData.set("name", values.name ?? "");

    formData.set("amount", String(values.amount));

    formData.set("categoryId", values.categoryId ?? "");

    formData.set("period", values.period);

    formData.set("warningThreshold", String(values.warningThreshold));

    const result = await createBudget(formData);

    if (!result.success) {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof BudgetInput, {
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
      }

      return;
    }

    reset();

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add Budget
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Budget</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}

          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Budget Name</FieldLabel>

                <Input {...field} placeholder="Food Budget" />

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
                  type="number"
                  min="0"
                  step="1"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    field.onChange(value === "" ? 0 : Number(value));
                  }}
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
                    <SelectValue placeholder="All categories" />
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

          {/* Period */}

          <Controller
            name="period"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Period</FieldLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>

                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          {/* Warning */}

          <Controller
            name="warningThreshold"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Warning Threshold</FieldLabel>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                    }}
                  />

                  <span className="text-sm text-muted-foreground">%</span>
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {errors.root?.server && (
            <p className="text-sm text-destructive">
              {errors.root.server.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Budget"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
