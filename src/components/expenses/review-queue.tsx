"use client";

import { useState, useTransition } from "react";
import { acceptAiCategorization, correctAiCategorization } from "@/actions/ai-categorization";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Item = {
  id: string;
  expenseId: string;
  confidence: unknown;
  provider: string | null;
  model: string | null;
  status: string;
  wasAccepted: boolean;
  wasCorrected: boolean;
  category: { name: string; icon: string | null } | null;
  expense: { title: string; merchant: string | null; expenseDate: string | Date; categoryId: string | null };
};

export function ReviewQueue({ items, categories }: { items: Item[]; categories: { id: string; name: string; icon: string | null }[] }) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Record<string, string>>({});

  if (items.length === 0) {
    return <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No pending AI suggestions — you are all caught up.</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{item.expense.title} <span className="text-xs text-muted-foreground">→ {item.category?.icon} {item.category?.name ?? "Uncategorized"}</span></p>
              <p className="text-xs text-muted-foreground">
                {item.expense.merchant ?? "—"} • {new Date(item.expense.expenseDate).toLocaleDateString("id-ID")} • {item.provider}:{item.model} • conf {Number(item.confidence ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={pending}
                onClick={() => startTransition(() => void acceptAiCategorization(item.id))}
              >
                Accept
              </Button>
              <Select
                value={selected[item.id] ?? ""}
                onValueChange={(v) => setSelected((s) => ({ ...s, [item.id]: v }))}
              >
                <SelectTrigger className="h-8 w-[180px]"><SelectValue placeholder="Correct to…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Uncategorized</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  const v = selected[item.id];
                  if (v === undefined) return;
                  const id = v === "__none__" ? null : v;
                  startTransition(() => void correctAiCategorization(item.id, id as string | null));
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
