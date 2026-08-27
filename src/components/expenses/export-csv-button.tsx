"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, expensesToCsv, type ExpenseCsvRow } from "@/lib/export/expenses-csv";

export function ExportCsvButton({ expenses }: { expenses: ExpenseCsvRow[] }) {
  function handleExport() {
    if (!expenses.length) return;
    const d = new Date();
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    downloadCsv(expensesToCsv(expenses), `finsight-transactions-${date}.csv`);
  }

  return (
    <Button type="button" variant="outline" disabled={!expenses.length} onClick={handleExport}>
      <Download className="size-4" />
      Export CSV
    </Button>
  );
}
