import assert from "node:assert/strict";
import test from "node:test";
import { getBudgetPeriod } from "../src/lib/budget/get-budget-period";

test("monthly period covers full month at midnight boundaries", () => {
  const date = new Date(2026, 0, 15, 12);
  const { start, end } = getBudgetPeriod("MONTHLY", date);
  assert.equal(start.getFullYear(), 2026);
  assert.equal(start.getMonth(), 0);
  assert.equal(start.getDate(), 1);
  assert.equal(start.getHours(), 0);
  assert.equal(end.getDate(), 31);
  assert.equal(end.getHours(), 23);
  assert.equal(end.getMinutes(), 59);
  assert.equal(end.getSeconds(), 59);
  assert.equal(end.getMilliseconds(), 999);
});

test("monthly handles February leap year", () => {
  const { start, end } = getBudgetPeriod("MONTHLY", new Date(2024, 1, 10));
  assert.equal(start.getDate(), 1);
  assert.equal(end.getDate(), 29);
});

test("monthly handles February non-leap", () => {
  const { end } = getBudgetPeriod("MONTHLY", new Date(2025, 1, 10));
  assert.equal(end.getDate(), 28);
});

test("monthly December boundary wraps correctly", () => {
  const { start, end } = getBudgetPeriod("MONTHLY", new Date(2026, 11, 5));
  assert.equal(start.getMonth(), 11);
  assert.equal(end.getMonth(), 11);
  assert.equal(end.getDate(), 31);
});

test("yearly period covers Jan 1 to Dec 31", () => {
  const { start, end } = getBudgetPeriod("YEARLY", new Date(2026, 5, 15));
  assert.equal(start.getMonth(), 0);
  assert.equal(start.getDate(), 1);
  assert.equal(end.getMonth(), 11);
  assert.equal(end.getDate(), 31);
  assert.equal(start.getFullYear(), 2026);
  assert.equal(end.getFullYear(), 2026);
});

test("yearly respects given year not current year", () => {
  const { start } = getBudgetPeriod("YEARLY", new Date(2023, 3, 1));
  assert.equal(start.getFullYear(), 2023);
});

test("monthly default uses current date when not provided", () => {
  const before = new Date();
  const { start } = getBudgetPeriod("MONTHLY");
  const after = new Date();
  // start must be first of current month
  assert.equal(start.getDate(), 1);
  assert.ok(start.getFullYear() >= before.getFullYear());
  assert.ok(start.getFullYear() <= after.getFullYear());
});
