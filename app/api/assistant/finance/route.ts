import { NextResponse } from "next/server";
import { readQuota, reserveAiRequest } from "@/lib/ai-quota";

type ContractInput = {
  status?: string;
  amount?: number;
  service?: string;
  billingMode?: string;
};

type ClientInput = {
  status?: string;
  monthlyValue?: number;
  service?: string;
  payment?: string;
};

type RequestBody = {
  question?: string;
  contracts?: ContractInput[];
  clients?: ClientInput[];
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function numberFromPtBr(value: string) {
  const clean = value.replace(/\s/g, "");
  if (clean.includes(",")) return Number(clean.replace(/\./g, "").replace(",", "."));
  if (/^\d{1,3}(\.\d{3})+$/.test(clean)) return Number(clean.replace(/\./g, ""));
  return Number(clean);
}

function extractNumbers(question: string) {
  return Array.from(question.matchAll(/\d[\d.,]*/g), (match) => numberFromPtBr(match[0])).filter(Number.isFinite);
}

function buildAnalysis(question: string, contracts: ContractInput[], clients: ClientInput[]) {
  const activeStatuses = new Set(["Assinado", "Aguardando assinatura", "Enviado"]);
  const activeContracts = contracts.filter((contract) => activeStatuses.has(contract.status || ""));
  const signedContracts = contracts.filter((contract) => contract.status === "Assinado");
  const activeClientsWithValue = clients.filter((client) => client.status === "Ativo" && Number.isFinite(client.monthlyValue));
  const recurringRevenue = activeClientsWithValue.reduce((total, client) => total + (client.monthlyValue || 0), 0);
  const activeContractValue = activeContracts.reduce((total, contract) => total + (contract.amount || 0), 0);
  const averageTicket = activeClientsWithValue.length ? recurringRevenue / activeClientsWithValue.length : 0;
  const overdueValue = clients.filter((client) => client.payment === "Atrasado").reduce((total, client) => total + (client.monthlyValue || 0), 0);
  const personalClients = activeClientsWithValue.filter((client) => normalize(client.service || "").includes("personal"));
  const personalRevenue = personalClients.reduce((total, client) => total + (client.monthlyValue || 0), 0);
  const normalized = normalize(question);
  const numbers = extractNumbers(question);

  const facts = {
    activeContracts: activeContracts.length,
    signedContracts: signedContracts.length,
    activeContractValue,
    activeClientsWithValue: activeClientsWithValue.length,
    recurringRevenue,
    averageTicket,
    overdueValue,
    personalClients: personalClients.length,
    personalRevenue,
  };

  let localAnswer = `Hoje há ${activeClientsWithValue.length} clientes ativos com valor mensal informado, somando ${money.format(recurringRevenue)} por mês. O ticket médio é ${money.format(averageTicket)}.`;
  let calculation = { label: "Receita mensal informada", value: money.format(recurringRevenue), formula: `${activeClientsWithValue.length} clientes ativos com valor cadastrado` };

  if (normalized.includes("quantos") && (normalized.includes("novo") || normalized.includes("contrato")) && numbers.length) {
    const target = numbers[numbers.length - 1];
    const minimumTicket = numbers.length > 1 ? numbers[0] : averageTicket;
    if (minimumTicket > 0) {
      const gap = Math.max(0, target - recurringRevenue);
      const needed = Math.ceil(gap / minimumTicket);
      localAnswer = gap === 0
        ? `A meta de ${money.format(target)} já foi alcançada com a receita mensal informada de ${money.format(recurringRevenue)}.`
        : `Faltam ${money.format(gap)} para a meta de ${money.format(target)}. Com novos contratos de pelo menos ${money.format(minimumTicket)}, seriam necessários ${needed} contrato${needed === 1 ? "" : "s"} novo${needed === 1 ? "" : "s"}.`;
      calculation = { label: "Novos contratos necessários", value: String(needed), formula: `arredondar para cima (${money.format(target)} − ${money.format(recurringRevenue)}) ÷ ${money.format(minimumTicket)}` };
    }
  } else if (normalized.includes("contrato") && (normalized.includes("ativo") || normalized.includes("fim do mes"))) {
    localAnswer = `Considerando contratos assinados, enviados ou aguardando assinatura, há ${activeContracts.length} contratos no fluxo ativo, com ${money.format(activeContractValue)} em valores cadastrados. Esse total não multiplica cobranças por aula, hora ou sessão porque a quantidade mensal ainda não está estruturada em todos os contratos.`;
    calculation = { label: "Valor dos contratos no fluxo ativo", value: money.format(activeContractValue), formula: `${activeContracts.length} contratos, sem multiplicar sessões ou horas` };
  } else if (normalized.includes("atras") || normalized.includes("receber")) {
    localAnswer = `O valor atualmente marcado como atrasado é ${money.format(overdueValue)}. A receita mensal informada total é ${money.format(recurringRevenue)}.`;
    calculation = { label: "Valor em atraso", value: money.format(overdueValue), formula: "soma dos clientes com pagamento marcado como atrasado" };
  }

  return { facts, localAnswer, calculation };
}

export async function GET() {
  try {
    return NextResponse.json({ configured: Boolean(process.env.OPENAI_API_KEY), quota: await readQuota() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Contador temporariamente indisponível. IA pausada para proteger o limite." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: RequestBody;
  try { body = await request.json() as RequestBody; }
  catch { return NextResponse.json({ error: "Não consegui ler a pergunta." }, { status: 400 }); }

  const question = typeof body?.question === "string" ? body.question.trim().slice(0, 1_500) : "";
  if (!question) return NextResponse.json({ error: "Escreva uma pergunta sobre seu financeiro." }, { status: 400 });
  const contracts = Array.isArray(body.contracts) ? body.contracts.slice(0, 250) : [];
  const clients = Array.isArray(body.clients) ? body.clients.slice(0, 250) : [];
  const analysis = buildAnalysis(question, contracts, clients);
  const assumptions = [
    "Receita mensal usa apenas clientes ativos com valor mensal informado.",
    "Valores por aula, hora ou sessão não são multiplicados sem uma quantidade mensal.",
    "Contratos ativos incluem assinados, enviados e aguardando assinatura.",
  ];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ answer: analysis.localAnswer, calculation: analysis.calculation, assumptions, source: "deterministic" });
  }

  let quota;
  try { quota = await reserveAiRequest(); }
  catch { return NextResponse.json({ error: "Não foi possível conferir o limite diário. Tente novamente mais tarde." }, { status: 503 }); }
  if (!quota.allowed) {
    return NextResponse.json({ error: "As 30 perguntas de IA disponíveis para o aplicativo hoje já foram utilizadas. O acesso será renovado à meia-noite, no horário de Brasília.", quota }, { status: 429 });
  }

  try {
    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: AbortSignal.timeout(30_000),
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-6-luna",
        max_output_tokens: 350,
        store: false,
        reasoning: { effort: "low" },
        instructions: "Você é o assistente financeiro do Vértice, usado por profissionais de atividade física e cuidado. Responda em português brasileiro, de forma curta, clara e profissional. Use somente os fatos e o cálculo determinístico fornecidos. Nunca invente valores, contratos ou previsões. Explique qualquer limitação relevante. Não ofereça aconselhamento contábil, jurídico ou de investimento.",
        input: `PERGUNTA DO PROFISSIONAL:\n${question}\n\nFATOS CALCULADOS PELO SISTEMA:\n${JSON.stringify(analysis.facts)}\n\nRESPOSTA E CÁLCULO DE REFERÊNCIA:\n${analysis.localAnswer}\n${JSON.stringify(analysis.calculation)}\n\nPREMISSAS:\n${assumptions.join("\n")}`,
      }),
    });
    const result = await openAIResponse.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };
    if (!openAIResponse.ok) throw new Error(result.error?.message || "A OpenAI não respondeu.");
    const answer = result.output_text || result.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
    if (!answer) throw new Error("Resposta vazia da OpenAI.");
    return NextResponse.json({ answer, calculation: analysis.calculation, assumptions, source: "openai", quota });
  } catch {
    return NextResponse.json({ answer: analysis.localAnswer, calculation: analysis.calculation, assumptions, source: "deterministic", quota, warning: "A IA ficou indisponível; o Vértice respondeu com o cálculo local conferido." });
  }
}
