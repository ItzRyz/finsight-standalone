"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type Category = { id: string; name: string; icon: string | null; color: string | null };

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCreate(formData: FormData) {
    setError(null);
    const result = await createCategory(formData);
    if (!result.success) {
      setError(result.error ?? "Unable to create category.");
      return;
    }
    // Optimistic: server revalidated path; refresh router and reset form
    const form = document.getElementById("category-create-form") as HTMLFormElement | null;
    form?.reset();
    startTransition(() => {
      router.refresh();
    });
    // Local update will be reflected after refresh; fallback to reload categories via router refresh
  }

  async function handleDelete(id: string) {
    const result = await deleteCategory(id);
    if (result.success) {
      setCategories((items) => items.filter((item) => item.id !== id));
      startTransition(() => router.refresh());
    } else {
      setError(result.error ?? "Unable to delete category.");
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <form
        id="category-create-form"
        action={handleCreate}
        className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_6rem_7rem_auto]"
      >
        <div className="space-y-1">
          <Label htmlFor="category-name" className="text-xs">
            Name
          </Label>
          <Input id="category-name" name="name" placeholder="Category name" required disabled={isPending} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="category-icon" className="text-xs">
            Icon
          </Label>
          <Input
            id="category-icon"
            name="icon"
            defaultValue="🏷️"
            aria-label="Category icon"
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="category-color" className="text-xs">
            Color
          </Label>
          <Input id="category-color" name="color" type="color" defaultValue="#64748B" disabled={isPending} />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? "Saving..." : "Add category"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive sm:col-span-4" role="alert">{error}</p>}
      </form>

      <div className="divide-y rounded-xl border bg-card">
        {categories.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No custom categories yet.</p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between gap-4 p-4">
              <span className="flex items-center gap-2">
                <span aria-hidden>{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive" disabled={isPending}>
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete category?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove “{category.name}”. Transactions using it will become uncategorized. This cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(category.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
