"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { deleteExpense } from "@/actions/expenses";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  expenseId: string;
  title: string;
};

export function DeleteExpenseDialog({ expenseId, title }: Props) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    const result = await deleteExpense(expenseId);

    setLoading(false);

    if (!result.success) {
      console.error(result.error);

      return;
    }

    setOpen(false);
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setOpen(true)} aria-label={`Delete ${title}`}>
        <span aria-hidden>🗑️</span>
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete <strong>{title}</strong>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={loading}
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
