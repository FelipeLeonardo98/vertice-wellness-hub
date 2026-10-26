import { env } from "cloudflare:workers";

export const DAILY_AI_LIMIT = 30;
export function quotaDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
function database() {
  if (!env.DB) throw new Error("Usage database unavailable");
  return env.DB;
}
export async function readQuota() {
  const day = quotaDay();
  const row = await database().prepare("SELECT requests FROM ai_daily_usage WHERE day = ?").bind(day).first<{requests: number}>();
  return { day, limit: DAILY_AI_LIMIT, used: row?.requests ?? 0, remaining: Math.max(0, DAILY_AI_LIMIT - (row?.requests ?? 0)), timeZone: "America/Sao_Paulo", scope: "app" };
}
export async function reserveAiRequest() {
  // One atomic statement protects the shared cap across concurrent Worker instances.
  // Attempts are counted even on provider failure: a timeout can still be billed.
  const row = await database().prepare(`INSERT INTO ai_daily_usage (day, requests) VALUES (?, 1)
    ON CONFLICT(day) DO UPDATE SET requests = requests + 1 WHERE requests < ?
    RETURNING requests`).bind(quotaDay(), DAILY_AI_LIMIT).first<{requests: number}>();
  return row ? { allowed: true, used: row.requests, remaining: DAILY_AI_LIMIT - row.requests, limit: DAILY_AI_LIMIT } : { allowed: false, used: DAILY_AI_LIMIT, remaining: 0, limit: DAILY_AI_LIMIT };
}
