import assert from "node:assert/strict";
import test from "node:test";
import { registerSchema, loginSchema, resetPasswordSchema } from "../src/lib/validators/auth";
import { budgetSchema } from "../src/lib/validators/budget";
import { expenseSchema } from "../src/lib/validators/expense";

test("registerSchema rejects password <12 chars", () => {
  const r = registerSchema.safeParse({ name: "John", email: "a@b.com", password: "Short1!", confirmPassword: "Short1!" });
  assert.equal(r.success, false);
});

test("registerSchema rejects password missing symbol", () => {
  const r = registerSchema.safeParse({
    name: "John",
    email: "a@b.com",
    password: "Password12345",
    confirmPassword: "Password12345",
  });
  assert.equal(r.success, false);
});

test("registerSchema rejects mismatched confirmPassword", () => {
  const r = registerSchema.safeParse({
    name: "John",
    email: "a@b.com",
    password: "StrongPass123!",
    confirmPassword: "Different123!",
  });
  assert.equal(r.success, false);
  if (!r.success) assert.ok(r.error.issues.some((i) => i.path.includes("confirmPassword")));
});

test("registerSchema accepts strong password", () => {
  const r = registerSchema.safeParse({
    name: "John",
    email: "a@b.com",
    password: "StrongPass123!",
    confirmPassword: "StrongPass123!",
  });
  assert.equal(r.success, true);
});

test("loginSchema requires email and password", () => {
  assert.equal(loginSchema.safeParse({ email: "", password: "" }).success, false);
  assert.equal(loginSchema.safeParse({ email: "valid@example.com", password: "x" }).success, true);
});

test("resetPasswordSchema enforces same rules as register", () => {
  const r = resetPasswordSchema.safeParse({ password: "weak", confirmPassword: "weak" });
  assert.equal(r.success, false);
});

test("budgetSchema rejects non-positive amount", () => {
  assert.equal(budgetSchema.safeParse({ amount: 0, period: "MONTHLY", warningThreshold: 80 }).success, false);
  assert.equal(budgetSchema.safeParse({ amount: -5, period: "MONTHLY", warningThreshold: 80 }).success, false);
});

test("budgetSchema accepts valid budget", () => {
  assert.equal(budgetSchema.safeParse({ amount: 100000, period: "MONTHLY", warningThreshold: 80 }).success, true);
});

test("budgetSchema rejects threshold out of range", () => {
  assert.equal(budgetSchema.safeParse({ amount: 100, period: "MONTHLY", warningThreshold: 0 }).success, false);
  assert.equal(budgetSchema.safeParse({ amount: 100, period: "MONTHLY", warningThreshold: 101 }).success, false);
});

test("expenseSchema validates title min/max and amount", () => {
  assert.equal(expenseSchema.safeParse({ title: "A", amount: 100, type: "EXPENSE", expenseDate: new Date() }).success, false);
  assert.equal(expenseSchema.safeParse({ title: "AB", amount: 100, type: "EXPENSE", expenseDate: new Date() }).success, true);
  assert.equal(expenseSchema.safeParse({ title: "AB", amount: 0, type: "EXPENSE", expenseDate: new Date() }).success, false);
  assert.equal(expenseSchema.safeParse({ title: "AB", amount: 1e13, type: "EXPENSE", expenseDate: new Date() }).success, false);
});

test("expenseSchema rejects invalid receiptUrl but allows empty", () => {
  assert.equal(expenseSchema.safeParse({ title: "AB", amount: 100, type: "EXPENSE", expenseDate: new Date(), receiptUrl: "not-a-url" }).success, false);
  assert.equal(expenseSchema.safeParse({ title: "AB", amount: 100, type: "EXPENSE", expenseDate: new Date(), receiptUrl: "" }).success, true);
  assert.equal(expenseSchema.safeParse({ title: "AB", amount: 100, type: "EXPENSE", expenseDate: new Date(), receiptUrl: "https://example.com/r.jpg" }).success, true);
});
