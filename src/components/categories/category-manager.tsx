/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useTransition, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2, Search } from "lucide-react";
import { createCategory, deleteCategory, updateCategory } from "@/actions/categories";
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
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description?: string | null;
  _count?: { expenses: number; budgets: number };
};

const ICONS = ["🏷️", "🍔", "🛒", "🚗", "🏠", "💊", "🎮", "📚", "✈️", "💰", "🎓", "🛍️", "💡", "🎵", "🐶", "⚽"];

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q) || (c.icon ?? "").toLowerCase().includes(q));
  }, [categories, query]);

  function handleCreate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCategory(formData);
      if (!result.success) {
        const msg = (result as unknown as { fieldErrors?: Record<string, string> }).fieldErrors
          ? Object.values((result as unknown as { fieldErrors: Record<string, string> }).fieldErrors)[0]
          : (result as { error?: string }).error ?? "Unable to create category.";
        setError(msg);
        toast.error(msg);
        return;
      }
      const created = (result as unknown as { data?: Category }).data;
      if (created) {
        setCategories((prev) => [...prev, { ...created, _count: { expenses: 0, budgets: 0 } } as Category].sort((a, b) => a.name.localeCompare(b.name)));
      }
      formRef.current?.reset();
      toast.success(`Category "${created?.name ?? "created"}" added`);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.success) {
        setCategories((items) => items.filter((item) => item.id !== id));
        toast.success("Category deleted");
        router.refresh();
      } else {
        const msg = (result as { error?: string }).error ?? "Unable to delete category.";
        setError(msg);
        toast.error(msg);
      }
    });
  }

  function handleUpdate(formData: FormData) {
    if (!editing) return;
    startTransition(async () => {
      const result = await updateCategory(editing.id, formData);
      if (!result.success) {
        const msg = (result as unknown as { fieldErrors?: Record<string, string> }).fieldErrors
          ? Object.values((result as unknown as { fieldErrors: Record<string, string> }).fieldErrors)[0]
          : (result as { error?: string }).error ?? "Unable to update.";
        setError(msg);
        toast.error(msg);
        return;
      }
      const updated = (result as unknown as { data?: Category }).data;
      setCategories((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...updated } : c)).sort((a, b) => a.name.localeCompare(b.name)));
      setEditing(null);
      toast.success("Category updated");
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl space-y-5">
      <form ref={formRef} action={handleCreate} className="grid gap-3 rounded-xl border bg-card p-4 sm:p-5 sm:grid-cols-[1fr_6rem_7rem_auto]">
        <div className="space-y-1">
          <Label htmlFor="category-name" className="text-xs">Name</Label>
          <Input id="category-name" name="name" placeholder="Category name" required disabled={isPending} maxLength={60} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="category-icon" className="text-xs">Icon</Label>
          <Input id="category-icon" name="icon" placeholder="🏷️" defaultValue="🏷️" disabled={isPending} maxLength={10} list="icon-list" />
          <datalist id="icon-list">
            {ICONS.map((ic) => (
              <option key={ic} value={ic} />
            ))}
          </datalist>
        </div>
        <div className="space-y-1">
          <Label htmlFor="category-color" className="text-xs">Color</Label>
          <Input id="category-color" name="color" type="color" defaultValue="#64748B" disabled={isPending} />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Add category"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive sm:col-span-4" role="alert">{error}</p>}
      </form>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search categories..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} items</span>
      </div>

      <div className="divide-y rounded-xl border bg-card overflow-hidden min-w-0">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium">{categories.length === 0 ? "No custom categories yet." : "No matching categories."}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {categories.length === 0 ? "Create your first custom category above. System categories are already available." : "Try a different search term."}
            </p>
            {query && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setQuery("")}>Clear search</Button>
            )}
          </div>
        ) : (
          filtered.map((category) => (
            <div key={category.id} className="flex items-center justify-between gap-4 p-4 min-w-0">
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border text-sm" style={{ background: category.color ?? "#64748B", color: "#fff" }} aria-hidden>
                  {category.icon ?? "🏷️"}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="truncate font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(category._count?.expenses ?? 0)} expenses · {(category._count?.budgets ?? 0)} budgets
                  </span>
                </span>
                <span className="ml-1 hidden size-3 shrink-0 rounded-full sm:inline-block" style={{ background: category.color ?? "#64748B" }} title={category.color ?? ""} />
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <Dialog open={editing?.id === category.id} onOpenChange={(o) => !o && setEditing(null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Edit ${category.name}`} onClick={() => setEditing(category)}>
                      <Pencil className="size-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Edit {category.name}</DialogTitle>
                    </DialogHeader>
                    <form action={handleUpdate} className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor={`edit-name-${category.id}`}>Name</Label>
                        <Input id={`edit-name-${category.id}`} name="name" defaultValue={category.name} required maxLength={60} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-icon-${category.id}`}>Icon</Label>
                        <Input id={`edit-icon-${category.id}`} name="icon" defaultValue={category.icon ?? "🏷️"} maxLength={10} list="icon-list" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-color-${category.id}`}>Color</Label>
                        <Input id={`edit-color-${category.id}`} name="color" type="color" defaultValue={category.color ?? "#64748B"} />
                      </div>
                      <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Save changes"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive" disabled={isPending} aria-label={`Delete ${category.name}`}>
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete category?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove “{category.name}” ({category._count?.expenses ?? 0} expenses, {category._count?.budgets ?? 0} budgets will become Uncategorized). This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(category.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
