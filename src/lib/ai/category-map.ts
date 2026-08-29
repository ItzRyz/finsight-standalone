// ML 15 → System Category names (seed 10). Fallback → Other.
export const ML_TO_SYSTEM: Record<string, string> = {
  food: "Food",
  transport: "Transportation",
  shopping: "Shopping",
  bills: "Bills",
  entertainment: "Entertainment",
  healthcare: "Health",
  education: "Education",
  travel: "Travel",
  income: "Salary",
  // extra ML → system
  fees: "Bills", // or Other — mapped to Bills (admin fee) per choice
  topup: "Bills",
  transfer: "Other",
  donation: "Other",
  investment: "Other",
  loan: "Bills",
};

// reverse
export const SYSTEM_TO_ML: Record<string, string> = Object.fromEntries(
  Object.entries(ML_TO_SYSTEM).map(([ml, sys]) => [sys, ml]),
);

export function mlLabelToSystem(ml: string): string {
  return ML_TO_SYSTEM[ml.toLowerCase()] ?? "Other";
}

export function systemToMl(system: string): string | null {
  return SYSTEM_TO_ML[system] ?? null;
}
