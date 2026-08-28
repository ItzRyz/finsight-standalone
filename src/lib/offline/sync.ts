"use client";

import { listOutbox, dequeue } from "./outbox";
import { createExpense as createExpenseAction } from "@/actions/expenses";

export async function syncOutbox(): Promise<number> {
  if (!navigator.onLine) return 0;
  const items = await listOutbox();
  let synced = 0;
  for (const item of items) {
    try {
      if (item.type === "createExpense") {
        const fd = new FormData();
        Object.entries(item.payload).forEach(([k, v]) => fd.set(k, String(v ?? "")));
        const res = await createExpenseAction(fd);
        if (res.success) {
          await dequeue(item.id);
          synced++;
        } else {
          // keep for retry unless validation error (400) — then drop after 3 retries
          if (item.retry > 3) await dequeue(item.id);
        }
      }
      // update/delete can be added similarly
    } catch {
      // network error — keep for next sync
    }
  }
  return synced;
}

export function setupOfflineSync(onSync?: (n: number) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = async () => {
    const n = await syncOutbox();
    if (n > 0) onSync?.(n);
  };
  window.addEventListener("online", handler);
  // initial
  handler();
  return () => window.removeEventListener("online", handler);
}
