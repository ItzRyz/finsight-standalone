export function getAiConfig() {
  const url = process.env.FINSIGHT_AI_URL || "https://ai.finsight.space";
  const timeout = Number(process.env.FINSIGHT_AI_TIMEOUT || "2000");
  return { url: url.replace(/\/$/, ""), timeout: Number.isFinite(timeout) ? timeout : 2000 };
}
