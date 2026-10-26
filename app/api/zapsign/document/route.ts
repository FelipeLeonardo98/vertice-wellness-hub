import { NextResponse } from "next/server";

type CreateDocumentBody = {
  contract?: { id?: number; template?: string; service?: string; client?: string };
  client?: { name?: string; email?: string };
  professional?: { name?: string; email?: string };
  base64Pdf?: string;
};

type ZapSigner = {
  token?: string;
  sign_url?: string;
  email?: string;
};

type ZapDocument = {
  token?: string;
  signers?: ZapSigner[];
  detail?: string;
  message?: string;
};

export async function GET() {
  return NextResponse.json({ environment: "sandbox", configured: Boolean(process.env.ZAPSIGN_SANDBOX_API_TOKEN) });
}

export async function POST(request: Request) {
  const apiToken = process.env.ZAPSIGN_SANDBOX_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json(
      { error: "A integração está pronta, mas o token da conta ZapSign Sandbox ainda não foi configurado." },
      { status: 503 },
    );
  }

  let body: CreateDocumentBody;
  try { body = await request.json() as CreateDocumentBody; }
  catch { return NextResponse.json({ error: "Dados do contrato inválidos." }, { status: 400 }); }

  const { contract, client, professional, base64Pdf } = body;
  if (!contract?.id || !contract.client || !client?.name || !client.email || !professional?.name || !professional.email || !base64Pdf) {
    return NextResponse.json({ error: "Contrato, PDF e e-mails dos dois signatários são obrigatórios." }, { status: 400 });
  }
  if (base64Pdf.length > 14_000_000) {
    return NextResponse.json({ error: "O PDF ultrapassa o limite aceito para este teste." }, { status: 413 });
  }

  const zapResponse = await fetch("https://sandbox.api.zapsign.com.br/api/v1/docs/", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `${contract.template || "Contrato"} — ${contract.client}`.slice(0, 255),
      base64_pdf: base64Pdf,
      one_click_active: true,
      require_signature: true,
      external_id: `vertice-contract-${contract.id}`,
      lang: "pt-br",
      disable_signer_emails: false,
      signature_order_active: true,
      reminder_every_n_days: 2,
      allow_refuse_signature: true,
      folder_path: "/vertice-sandbox/contratos/",
      brand_name: "Vértice",
      brand_primary_color: "#146d62",
      signers: [
        { name: professional.name, email: professional.email, send_automatic_email: true, order_group: 1, qualification: "profissional contratado", external_id: `professional-${contract.id}`, custom_message: `Assine o contrato de ${contract.service || "prestação de serviços"} preparado no Vértice.` },
        { name: client.name, email: client.email, send_automatic_email: true, order_group: 2, qualification: "parte contratante", external_id: `client-${contract.id}`, custom_message: `Olá, ${client.name}. Revise e assine o contrato enviado pelo Vértice.` },
      ],
    }),
  });

  let result: ZapDocument = {};
  try { result = await zapResponse.json() as ZapDocument; }
  catch { /* A resposta sem JSON será tratada abaixo. */ }
  if (!zapResponse.ok) {
    const providerMessage = result.detail || result.message;
    return NextResponse.json({ error: providerMessage ? `ZapSign Sandbox: ${providerMessage}` : "A ZapSign Sandbox recusou o envio do documento." }, { status: zapResponse.status });
  }

  const professionalSigner = result.signers?.find((signer) => signer.email?.toLowerCase() === professional.email?.toLowerCase()) ?? result.signers?.[0];
  const clientSigner = result.signers?.find((signer) => signer.email?.toLowerCase() === client.email?.toLowerCase()) ?? result.signers?.[1];
  if (!result.token || !professionalSigner?.sign_url || !clientSigner?.sign_url) {
    return NextResponse.json({ error: "A ZapSign criou o documento, mas não devolveu os dois links de assinatura." }, { status: 502 });
  }

  return NextResponse.json({
    environment: "sandbox",
    documentToken: result.token,
    professionalSignerToken: professionalSigner.token,
    professionalSignUrl: professionalSigner.sign_url,
    clientSignerToken: clientSigner.token,
    clientSignUrl: clientSigner.sign_url,
  });
}
