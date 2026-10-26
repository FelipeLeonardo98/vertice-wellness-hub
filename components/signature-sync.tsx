"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Contract } from "@/lib/fitness-data";
import { toast } from "sonner";

export async function fetchSignature(contract: Contract) {
  const response = await fetch("/api/zapsign/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentToken: contract.zapSignDocumentToken, signerToken: contract.zapSignSignerToken }) });
  const result = await response.json() as { error?: string; status: "Assinado" | "Aguardando assinatura"; signedAt: string | null; signedCount: number; totalSigners: number; signedPdfUrl: string | null };
  if (!response.ok) throw new Error(result.error || "Não foi possível atualizar a assinatura.");
  return result as { status: "Assinado" | "Aguardando assinatura"; signedAt: string | null; signedCount: number; totalSigners: number; signedPdfUrl: string | null };
}

export function SignatureSync({ contracts, onUpdate }: { contracts: Contract[]; onUpdate: (token: string, status: "Assinado" | "Aguardando assinatura", signedAt?: string) => void }) {
  const current = useRef({ contracts, onUpdate });
  current.current = { contracts, onUpdate };
  const busy = useRef(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const refresh = useCallback(async (manual = false) => {
    if (busy.current || document.visibilityState === "hidden") return;
    const { contracts: records, onUpdate: update } = current.current;
    const targets = records.filter(c => c.zapSignDocumentToken && c.zapSignSignerToken && (manual || c.status === "Aguardando assinatura"));
    if (!targets.length) return;
    busy.current = true; setLoading(true);
    let failed = 0;
    for (const contract of targets) {
      try {
        const result = await fetchSignature(contract);
        update(contract.zapSignDocumentToken!, result.status, result.signedAt ?? undefined);
      } catch { failed++; }
    }
    busy.current = false; setLoading(false);
    setMessage(failed ? `${failed} documento(s) não puderam ser consultados. Tente atualizar novamente.` : `Assinaturas conferidas às ${new Date().toLocaleTimeString("pt-BR")}.`);
    if (manual) { if (failed) toast.error("Algumas assinaturas não puderam ser atualizadas"); else toast.success("Assinaturas atualizadas com a ZapSign"); }
  }, []);
  const pending = contracts.filter(c => c.zapSignDocumentToken && c.status === "Aguardando assinatura").map(c => c.zapSignDocumentToken).join(",");
  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    const interval = window.setInterval(onFocus, 60_000);
    return () => { window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onFocus); window.clearInterval(interval); };
  }, [refresh, pending]);
  if (!contracts.some(c => c.zapSignDocumentToken)) return null;
  return <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 text-sm"><span role="status">{loading ? "Conferindo assinaturas na ZapSign…" : message || "Confira as assinaturas dos seus contratos."}</span><Button variant="outline" size="sm" disabled={loading} onClick={() => void refresh(true)}>Atualizar assinaturas</Button></div>;
}
