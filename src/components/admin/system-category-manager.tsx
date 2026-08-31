"use client";

import { useState, useTransition } from "react";
import { createSystemCategory, deleteSystemCategory, updateSystemCategory } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  _count: { expenses: number; budgets: number };
};

function FormFields({ category }: { category?: Category }) {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor={category ? `edit-name-${category.id}` : "sys-name"}>Name</Label>
        <Input id={category ? `edit-name-${category.id}` : "sys-name"} name="name" required defaultValue={category?.name} placeholder="Category name" />
      </div>
      <div className="space-y-1">
        <Label htmlFor={category ? `edit-icon-${category.id}` : "sys-icon"}>Icon</Label>
        <Input id={category ? `edit-icon-${category.id}` : "sys-icon"} name="icon" defaultValue={category?.icon ?? "🏷️"} placeholder="🏷️" />
      </div>
      <div className="space-y-1">
        <Label htmlFor={category ? `edit-color-${category.id}` : "sys-color"}>Color</Label>
        <Input id={category ? `edit-color-${category.id}` : "sys-color"} name="color" type="color" defaultValue={category?.color ?? "#64748B"} />
      </div>
      <div className="space-y-1">
        <Label htmlFor={category ? `edit-desc-${category.id}` : "sys-desc"}>Description</Label>
        <Input id={category ? `edit-desc-${category.id}` : "sys-desc"} name="description" defaultValue={category?.description ?? ""} placeholder="Description" />
      </div>
    </>
  );
}

export function SystemCategoryManager({ categories }: { categories: Category[] }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  async function handleCreate(data: FormData) {
    const result = await createSystemCategory(data);
    if (!result.success) {
      setError(result.error ?? "Unable to create category.");
      return;
    }
    setError(null);
    setOpen(false);
  }

  async function handleUpdate(id: string, data: FormData) {
    const result = await updateSystemCategory(id, data);
    if (!result.success) setError(result.error ?? "Unable to update category.");
    else setError(null);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteSystemCategory(id);
      if (!result.success) setError(result.error ?? "Unable to delete category.");
      else setError(null);
    });
  }

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add system category</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add system category</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-3">
            <FormFields />
            <Button className="w-full" type="submit">Create category</Button>
          </form>
        </DialogContent>
      </Dialog>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <caption className="sr-only">System categories</caption>
          <thead className="border-b text-left text-muted-foreground">
            <tr>
              <th scope="col" className="p-3 font-medium">Category</th>
              <th scope="col" className="p-3 font-medium">Usage</th>
              <th scope="col" className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b last:border-0">
                <td className="p-3">
                  <span className="mr-2" aria-hidden>{category.icon}</span>
                  <span className="font-semibold">{category.name}</span>
                  <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>
                </td>
                <td className="p-3 text-muted-foreground">
                  {category._count.expenses} expenses · {category._count.budgets} budgets
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">Edit</Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Edit {category.name}</DialogTitle>
                        </DialogHeader>
                        <form action={(data) => handleUpdate(category.id, data)} className="space-y-3">
                          <FormFields category={category} />
                          <Button className="w-full" type="submit">Save changes</Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" disabled={pending} className="text-destructive">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete category?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Delete system category “{category.name}”? This is blocked while it is in use ({category._count.expenses} expenses, {category._count.budgets} budgets).
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(category.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
