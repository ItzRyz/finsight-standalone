import assert from "node:assert/strict";
import test from "node:test";
import { expensesToCsv, type ExpenseCsvRow } from "../src/lib/export/expenses-csv";

function row(overrides: Partial<ExpenseCsvRow> = {}): ExpenseCsvRow {
  return {
    id: "1",
    title: "Lunch",
    amount: 45000,
    type: "EXPENSE",
    category: "Food",
    date: new Date(2026, 0, 15),
    merchant: "Warung",
    location: "Jakarta",
    description: "Test",
    receiptUrl: null,
    ...overrides,
  };
}

test("includes BOM and summary rows", () => {
  const csv = expensesToCsv([row()]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes("FinSight Transaction Export"));
  assert.ok(csv.includes("Total Transactions"));
  assert.ok(csv.includes("Balance"));
  assert.ok(csv.includes("Date,Title,Type,Category,Amount"));
});

test("escapes commas, quotes, and newlines", () => {
  const csv = expensesToCsv([
    row({ title: 'Say "hi", then\nnewline', merchant: "A,B", description: 'Line1\nLine2' }),
  ]);
  assert.ok(csv.includes('"Say ""hi"", then\nnewline"'));
  assert.ok(csv.includes('"A,B"'));
  assert.ok(csv.includes('"Line1\nLine2"'));
});

test("formats date as YYYY-MM-DD", () => {
  const csv = expensesToCsv([row({ date: new Date(2026, 5, 9) })]);
  assert.ok(csv.includes("2026-06-09"));
  assert.ok(csv.includes("2026-06-09,Lunch"));
});

test("handles INCOME vs EXPENSE label and balance", () => {
  const csv = expensesToCsv([row({ type: "INCOME", amount: 100000 }), row({ type: "EXPENSE", amount: 30000 })]);
  assert.ok(csv.includes("Income"));
  assert.ok(csv.includes("Expense"));
  // Balance 70000
  assert.ok(csv.includes("Balance,70000"));
});

test("handles null merchant/location/receipt gracefully", () => {
  const csv = expensesToCsv([row({ merchant: null, location: null, receiptUrl: null })]);
  // Should not contain literal "null"
  assert.equal(csv.includes(",null,"), false);
  // Receipt column should be No when null
  assert.ok(csv.includes(",No"));
});

test("handles empty array", () => {
  const csv = expensesToCsv([]);
  assert.ok(csv.includes("Total Transactions,0"));
  assert.ok(csv.includes("Balance,0"));
  // Headers still present
  assert.ok(csv.includes("Date,Title,Type"));
});

test("string date input is accepted", () => {
  const csv = expensesToCsv([row({ date: "2026-01-20T00:00:00.000Z" as unknown as Date })]);
  assert.ok(csv.includes("2026-01-20"));
});
