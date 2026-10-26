import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { documentToken?: string; signerToken?: string } | null;
  try { body = await request.json() as typeof body; } catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  if (!body || typeof body.documentToken !== "string" || typeof body.signerToken !== "string" || !uuid.test(body.documentToken) || !uuid.test(body.signerToken)) return NextResponse.json({ error: "Identificação de assinatura inválida." }, { status: 400 });
  if (!process.env.ZAPSIGN_SANDBOX_API_TOKEN) return NextResponse.json({ error: "ZapSign indisponível." }, { status: 503 });
  try {
    const response = await fetch(`https://sandbox.api.zapsign.com.br/api/v1/docs/${body.documentToken}/`, {
      headers: { Authorization: `Bearer ${process.env.ZAPSIGN_SANDBOX_API_TOKEN}` }, cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return NextResponse.json({ error: "Não foi possível consultar o documento na ZapSign." }, { status: 502 });
    const doc = await response.json() as { status?: string; deleted?: boolean; signed_file?: string; signers?: { token?: string; status?: string; signed_at?: string }[] };
    // Existing MVP records carry both document and signer capabilities. Never list account documents publicly.
    if (!doc.signers?.some(s => s.token === body.signerToken)) return NextResponse.json({ error: "Assinatura não encontrada." }, { status: 403 });
    if (doc.deleted) return NextResponse.json({ error: "Documento removido na ZapSign." }, { status: 410 });
    const complete = doc.status === "signed" && doc.signers.length >= 2 && doc.signers.every(s => s.status === "signed");
    const dates = doc.signers.map(s => s.signed_at).filter((s): s is string => Boolean(s)).sort();
    return NextResponse.json({ status: complete ? "Assinado" : "Aguardando assinatura", signedCount: doc.signers.filter(s => s.status === "signed").length, totalSigners: doc.signers.length, signedAt: complete ? dates.at(-1) : null, signedPdfUrl: complete && doc.signed_file?.startsWith("https://") ? doc.signed_file : null }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "ZapSign não respondeu. Tente atualizar novamente." }, { status: 502 }); }
}
