import { NextResponse } from "next/server";
import { reserveAiRequest } from "@/lib/ai-quota";
import { choices, cleanRelationship, serviceOptions, type Opportunity } from "@/lib/crm";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return NextResponse.json({ error: "Envie no máximo três alunos." }, { status: 413 });
    body = JSON.parse(raw);
  } catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }
  if (!body || !Array.isArray(body.students) || body.students.length < 1 || body.students.length > 3) return NextResponse.json({ error: "Selecione de um a três alunos." }, { status: 400 });
  const services = choices(body.services, serviceOptions);
  if (!services.length) return NextResponse.json({ error: "Confirme pelo menos um serviço que você oferece." }, { status: 400 });
  const days = (v: unknown) => typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 36500 ? v : null;
  const students = body.students.map((item, index) => {
    const v = item && typeof item === "object" ? item as Record<string, unknown> : {};
    const r = cleanRelationship(v);
    return { slot: index + 1, interests: r.interests, goals: r.goals, preferences: r.preferences, daysSinceSession: days(v.daysSinceSession), daysSinceContact: days(v.daysSinceContact) };
  });
  if (students.some(s => !s.interests.length && !s.goals.length && !s.preferences.length)) return NextResponse.json({ error: "Preencha interesses, objetivos ou preferências de cada aluno selecionado." }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Nexo não está configurado. Nenhuma chamada consumida." }, { status: 503 });
  let quota;
  try { quota = await reserveAiRequest(); }
  catch { return NextResponse.json({ error: "Não foi possível conferir a cota. Tente mais tarde." }, { status: 503 }); }
  if (!quota.allowed) return NextResponse.json({ error: "Cota compartilhada de 30 chamadas esgotada. Renova à meia-noite de Brasília.", quota }, { status: 429 });
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, signal: AbortSignal.timeout(45000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-6-luna", store: false, max_output_tokens: 1800, reasoning: { effort: "low" },
        instructions: "Você é Nexo, assistente de relacionamento do Vértice. Em português brasileiro, gere no máximo uma oportunidade por aluno, até três. Use somente os interesses, objetivos, preferências e intervalos fornecidos. Sugira hipóteses de conversa, retenção ou apresentação de serviços confirmados pelo profissional. Não invente preços, contratos, frequência, motivos de ausência ou serviços. Ausência de registro não significa ausência de exercício. Dados null são desconhecidos. Não diagnostique, prescreva exercícios, intensidade, HIIT ou testes fisiológicos; pode sugerir conversar sobre interesse em uma modalidade disponível, condicionado à avaliação do profissional. Não infira saúde ou lesões. Se faltar base para vender um serviço, sugira conhecer melhor as preferências. Mensagens são rascunhos curtos, sem nome, sem pressão comercial, sem envio. Título até 70 caracteres; demais campos até 350 cada.",
        input: JSON.stringify({ services, students }),
        text: { format: { type: "json_schema", name: "crm_opportunities", strict: true, schema: {
          type: "object", additionalProperties: false, properties: { opportunities: { type: "array", maxItems: 3, items: {
            type: "object", additionalProperties: false, properties: { slot: { type: "integer", enum: students.map(s => s.slot) }, title: { type: "string" }, reason: { type: "string" }, suggestion: { type: "string" }, message: { type: "string" } }, required: ["slot", "title", "reason", "suggestion", "message"]
          } } }, required: ["opportunities"]
        } } }
      })
    });
    if (!response.ok) throw new Error("Provider error");
    const result = await response.json() as { status?: string; output_text?: string; output?: { content?: { type?: string; text?: string }[] }[] };
    if (result.status === "incomplete") throw new Error("Incomplete");
    const output = result.output_text || result.output?.flatMap(o => o.content || []).find(c => c.type === "output_text")?.text;
    const parsed = JSON.parse(output || "{}") as { opportunities?: Opportunity[] };
    if (!Array.isArray(parsed.opportunities) || parsed.opportunities.length > 3 || parsed.opportunities.some(o => !o || !students.some(s => s.slot === o.slot) || ["title", "reason", "suggestion", "message"].some(k => typeof o[k as keyof Opportunity] !== "string" || String(o[k as keyof Opportunity]).length > 2000)) || new Set(parsed.opportunities.map(o => o.slot)).size !== parsed.opportunities.length) throw new Error("Invalid output");
    return NextResponse.json({ opportunities: parsed.opportunities, quota, source: "openai" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Não foi possível concluir a avaliação. Nenhuma sugestão foi inventada. A tentativa conta na cota; tente novamente mais tarde.", quota }, { status: 502 });
  }
}
