import assert from "node:assert/strict";
import test from "node:test";
import { getBudgetStatus } from "../src/lib/budget/get-budget-status";

test("marks spend below threshold as safe", () => {
  assert.equal(getBudgetStatus({ spent: 69, budget: 100, warningThreshold: 70 }), "SAFE");
});

test("marks spend at threshold as warning", () => {
  assert.equal(getBudgetStatus({ spent: 70, budget: 100, warningThreshold: 70 }), "WARNING");
});

test("marks spend at or above budget as exceeded", () => {
  assert.equal(getBudgetStatus({ spent: 100, budget: 100, warningThreshold: 80 }), "EXCEEDED");
  assert.equal(getBudgetStatus({ spent: 101, budget: 100, warningThreshold: 80 }), "EXCEEDED");
});
