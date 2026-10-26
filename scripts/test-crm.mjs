import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
function load(file, imports = {}, globals = {}) {
  const output = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function("exports", "require", ...Object.keys(globals), output)(exports, n => imports[n], ...Object.values(globals));
  return exports;
}
const crm = load("lib/crm.ts");
assert.equal(crm.daysSince("12/10/2026", new Date("2026-10-13T15:00:00Z")), 1);
assert.equal(crm.daysSince("31/02/2026"), null);
assert.equal(crm.daysSince("—"), null);
assert.equal(crm.daysSince("2099-01-01"), null);
const privateStudent = { name: "SECRET_NAME", phone: "SECRET_PHONE", restrictions: "SECRET_HEALTH", notes: "SECRET_NOTES", goal: "SECRET_GOAL", lastSession: "—", relationship: { interests: ["Corrida", "SECRET_HEALTH"], goals: ["Criar constância"], preferences: ["Manhã"] } };
const payload = crm.crmPayload([privateStudent], ["Assessoria de corrida"]);
assert.ok(!JSON.stringify(payload).includes("SECRET"));
let calls = 0, reservations = 0, requestInput;
let allowed = true, storageError = false, badOutput = false;
const quota = { reserveAiRequest: async () => { reservations++; if (storageError) throw Error(); return { allowed, limit: 30, remaining: allowed ? 29 : 0 }; } };
const route = load("app/api/assistant/opportunities/route.ts", { "@/lib/crm": crm, "@/lib/ai-quota": quota, "next/server": { NextResponse: { json: (v, opts) => Response.json(v, opts) } } }, {
  process: { env: { OPENAI_API_KEY: "test-only" } },
  fetch: async (_, opts) => { calls++; requestInput = JSON.parse(opts.body); return Response.json({ status: "completed", output_text: JSON.stringify({ opportunities: [{ slot: badOutput ? 99 : 1, title: "Conversa", reason: "Interesse registrado em corrida", suggestion: "Pergunte sobre interesse", message: "Como está sua rotina?" }] }) }); }
});
const req = body => new Request("https://test/api", { method: "POST", body: JSON.stringify(body) });
assert.equal((await route.POST(req(null))).status, 400);
assert.equal((await route.POST(req({ ...payload, students: Array(4).fill(payload.students[0]) }))).status, 400);
assert.equal((await route.POST(req({ ...payload, services: [] }))).status, 400);
assert.equal((await route.POST(req({ ...payload, students: [{}] }))).status, 400);
assert.equal(reservations, 0);
allowed = false;
assert.equal((await route.POST(req(payload))).status, 429);
assert.equal(calls, 0);
allowed = true; storageError = true;
assert.equal((await route.POST(req(payload))).status, 503);
assert.equal(calls, 0);
storageError = false;
const response = await route.POST(req({ ...payload, students: [{ ...payload.students[0], ...privateStudent }] }));
assert.equal(response.status, 200);
assert.equal(calls, 1);
assert.ok(!requestInput.input.includes("SECRET"));
assert.equal(requestInput.store, false);
assert.equal((await response.json()).opportunities.length, 1);
badOutput = true;
assert.equal((await route.POST(req(payload))).status, 502);
console.log("PASS: CRM privacy projection, dates, three-student cap, validation before quota, shared quota, fail-closed storage, valid output and rejection of unknown student.");
