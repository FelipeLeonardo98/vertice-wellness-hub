export const interests = ["Musculação", "Corrida", "Treino híbrido", "Lutas", "Futebol", "CrossFit", "Funcional", "Dança", "Alongamento", "Ciclismo"];
export const goals = ["Ganhar força", "Melhorar condicionamento", "Criar constância", "Conhecer modalidades", "Preparar-se para evento esportivo", "Retomar acompanhamento"];
export const preferences = ["Individual", "Coletivo", "Presencial", "Online", "Manhã", "Tarde", "Noite", "Fim de semana"];
export const serviceOptions = ["Personal de musculação", "Personal Recovery", "Assessoria de corrida", "Treino híbrido", "Aula de HIIT", "Funcional", "Lutas", "Dança", "Alongamento", "Conversa de acompanhamento"];
export type Relationship = { interests: string[]; goals: string[]; preferences: string[]; lastContact?: string };
export const emptyRelationship: Relationship = { interests: [], goals: [], preferences: [] };
export function choices(value: unknown, options: string[]) {
  return Array.isArray(value) ? [...new Set(value.filter((v): v is string => typeof v === "string" && options.includes(v)))].slice(0, 12) : [];
}
export function cleanRelationship(value: unknown): Relationship {
  const v = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return { interests: choices(v.interests, interests), goals: choices(v.goals, goals), preferences: choices(v.preferences, preferences), lastContact: typeof v.lastContact === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.lastContact) ? v.lastContact : undefined };
}
export function daysSince(value: unknown, now = new Date()): number | null {
  if (typeof value !== "string") return null;
  const normalized = /^\d{2}\/\d{2}\/\d{4}$/.test(value) ? value.split("/").reverse().join("-") : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;
  const date = new Date(normalized + "T12:00:00Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== normalized) return null;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const days = Math.floor((Date.parse(today + "T12:00:00Z") - date.getTime()) / 86400000);
  return days >= 0 ? days : null;
}
// Explicit projection: no identifiers, notes, free-text goals or health fields leave the browser.
export function crmPayload(clients: { relationship?: Relationship; lastSession: string }[], services: string[]) {
  return { services: choices(services, serviceOptions), students: clients.map((c, index) => {
    const r = cleanRelationship(c.relationship);
    return { slot: index + 1, interests: r.interests, goals: r.goals, preferences: r.preferences, daysSinceSession: daysSince(c.lastSession), daysSinceContact: daysSince(r.lastContact) };
  }) };
}
export type Opportunity = { slot: number; title: string; reason: string; suggestion: string; message: string };
