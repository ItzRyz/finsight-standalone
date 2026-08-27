"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  onEdit: () => void;
  onDelete: () => void;
};

export function ExpenseActions({ onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Pencil className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
