import type { Client } from "@/lib/fitness-data";

// Render directly from the local client record, never from the AI payload or response.
export function ClientReviewNotes({ client }: { client?: Client }) {
  const restrictions = client?.restrictions?.trim();
  const notes = client?.notes?.trim();
  return <aside aria-label="Registros da ficha para revisão" className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
    <h4 className="font-semibold">Confira a ficha antes de usar a sugestão</h4>
    <p className="text-xs">Registros para sua revisão. O Nexo não recebeu nem analisou estas informações.</p>
    {!client ? <p>Ficha indisponível. Confira os dados do aluno antes de entrar em contato.</p> : <>
      <div><p className="font-medium">Restrições e alertas</p><p className="whitespace-pre-wrap break-words">{restrictions || "Nenhuma restrição ou alerta registrado."}</p></div>
      <div><p className="font-medium">Observações</p><p className="whitespace-pre-wrap break-words">{notes || "Nenhuma observação registrada."}</p></div>
    </>}
  </aside>;
}
