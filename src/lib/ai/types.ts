export type MlCategory =
  | "bills"
  | "donation"
  | "education"
  | "entertainment"
  | "fees"
  | "food"
  | "healthcare"
  | "income"
  | "investment"
  | "loan"
  | "shopping"
  | "topup"
  | "transfer"
  | "transport"
  | "travel";

export type AiResult = {
  categoryId: string | null;
  categoryName: string; // ML label e.g. "food"
  systemName: string; // mapped System e.g. "Food"
  confidence: number; // 0-1
  provider: string;
  model: string;
  rawResponse: Record<string, unknown>;
};

export class RateLimitError extends Error {
  retryAfter: number;
  constructor(msg: string, retryAfter = 60) {
    super(msg);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}
