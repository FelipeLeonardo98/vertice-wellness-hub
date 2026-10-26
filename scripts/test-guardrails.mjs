import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';

function loadTs(file, imports, globals = {}) {
  const source = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('exports', 'require', ...Object.keys(globals), source)(exports, name => imports[name], ...Object.values(globals));
  return exports;
}
const db = new DatabaseSync(':memory:');
for (const name of readdirSync('drizzle').filter(n => n.endsWith('.sql'))) db.exec(readFileSync(`drizzle/${name}`, 'utf8'));
const binding = { prepare(sql) { return { bind(...args) { return { async first() { return db.prepare(sql).get(...args) ?? null; } }; } }; } };
const quota = loadTs('lib/ai-quota.ts', { 'cloudflare:workers': { env: { DB: binding } } });
assert.equal(quota.quotaDay(new Date('2026-10-08T02:59:59Z')), '2026-10-07');
assert.equal(quota.quotaDay(new Date('2026-10-08T03:00:00Z')), '2026-10-08');
const reservations = await Promise.all(Array.from({length: 40}, () => quota.reserveAiRequest()));
assert.equal(reservations.filter(r => r.allowed).length, 30);
assert.equal((await quota.readQuota()).used, 30);
assert.equal((await quota.readQuota()).remaining, 0);
console.log('PASS: 40 reservations allow exactly 30; Brasilia midnight boundary correct.');

const NextResponse = { json: (data, init) => Response.json(data, init) };
let calls = 0;
const finance = loadTs('app/api/assistant/finance/route.ts', { 'next/server': {NextResponse}, '@/lib/ai-quota': quota }, { process: {env:{OPENAI_API_KEY:'test-only'}}, fetch: async () => {calls++; throw Error('No paid requests allowed during test');} });
const capped = await finance.POST(new Request('https://test/api', {method:'POST', body:JSON.stringify({question:'Quanto tenho?',clients:[],contracts:[]})}));
assert.equal(capped.status, 429);
assert.equal(calls, 0);
const unavailable = loadTs('app/api/assistant/finance/route.ts', { 'next/server': {NextResponse}, '@/lib/ai-quota': {reserveAiRequest:async()=>{throw Error('offline')}} }, { process: {env:{OPENAI_API_KEY:'test-only'}}, fetch: async () => {calls++;} });
assert.equal((await unavailable.POST(new Request('https://test/api', {method:'POST',body:JSON.stringify({question:'Quanto tenho?'})}))).status,503);
assert.equal(calls,0);
console.log('PASS: exhausted quota and storage outage never call OpenAI.');

const docToken='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const signerToken='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
let document={status:'signed',signed_file:'https://example.com/signed.pdf',signers:[{token:signerToken,status:'signed',signed_at:'2026-10-07T12:00:00Z'},{token:'cccccccc-cccc-cccc-cccc-cccccccccccc',status:'signed',signed_at:'2026-10-07T13:00:00Z'}]};
const status = loadTs('app/api/zapsign/status/route.ts', {'next/server':{NextResponse}}, {process:{env:{ZAPSIGN_SANDBOX_API_TOKEN:'test-only'}},fetch:async()=>Response.json(document)});
const request = (token=signerToken) => new Request('https://test/api', {method:'POST',body:JSON.stringify({documentToken:docToken,signerToken:token})});
let answer=await (await status.POST(request())).json();
assert.equal(answer.status,'Assinado'); assert.equal(answer.signedCount,2); assert.equal(answer.signedPdfUrl,'https://example.com/signed.pdf');
document.signers[1].status='new'; document.status='pending';
answer=await (await status.POST(request())).json();
assert.equal(answer.status,'Aguardando assinatura'); assert.equal(answer.signedPdfUrl,null);
assert.equal((await status.POST(request('dddddddd-dddd-dddd-dddd-dddddddddddd'))).status,403);
assert.equal((await status.POST(request('invalid'))).status,400);
console.log('PASS: two signatures complete; one remains pending; invalid capabilities rejected.');
