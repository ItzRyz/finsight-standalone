export type BudgetStatus = "SAFE" | "WARNING" | "EXCEEDED";

export function getBudgetStatus({
  spent,
  budget,
  warningThreshold,
}: {
  spent: number;
  budget: number;
  warningThreshold: number;
}): BudgetStatus {
  if (budget <= 0) {
    return "EXCEEDED";
  }

  const percentage = (spent / budget) * 100;

  if (percentage >= 100) {
    return "EXCEEDED";
  }

  if (percentage >= warningThreshold) {
    return "WARNING";
  }

  return "SAFE";
}
