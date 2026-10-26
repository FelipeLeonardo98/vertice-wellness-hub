"use client";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { interests, goals, preferences, serviceOptions, cleanRelationship, crmPayload, type Relationship, type Opportunity } from "@/lib/crm";
import { ClientReviewNotes } from "@/components/client-review-notes";
import type { Client } from "@/lib/fitness-data";

export function RelationshipFields({ value }: { value?: Relationship }) {
  const r = cleanRelationship(value);
  return <div className="space-y-4 rounded-xl border bg-[#f5f9f7] p-4">
    <h3 className="font-semibold">Relacionamento · Nexo</h3>
    <p className="text-xs text-muted-foreground">Opcional. Use os interesses declarados pelo aluno. Estes campos não são uma avaliação técnica ou de saúde.</p>
    {([[ "Interesses", "crmInterests", interests, r.interests ], [ "Objetivos de relacionamento", "crmGoals", goals, r.goals ], [ "Preferências", "crmPreferences", preferences, r.preferences ]] as const).map(([title, name, options, selected]) => <fieldset key={name}><legend className="mb-2 text-sm font-medium">{title}</legend><div className="flex flex-wrap gap-2">{options.map(option => <label key={option} className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm"><input type="checkbox" name={name} value={option} defaultChecked={selected.includes(option)} className="accent-[#0e665c]" />{option}</label>)}</div></fieldset>)}
    <label className="block text-sm">Último contato registrado (opcional)<Input name="crmLastContact" type="date" defaultValue={r.lastContact} className="mt-2 max-w-xs" /></label>
  </div>;
}
export function relationshipFromForm(form: FormData): Relationship {
  return cleanRelationship({ interests: form.getAll("crmInterests"), goals: form.getAll("crmGoals"), preferences: form.getAll("crmPreferences"), lastContact: form.get("crmLastContact") });
}
export function RelationshipEditor({ client, onSave }: { client: Client; onSave: (r: Relationship) => void }) {
  if (client.entityType === "Organização parceira") return null;
  return <form className="mb-6 space-y-3" onSubmit={e => { e.preventDefault(); onSave(relationshipFromForm(new FormData(e.currentTarget))); toast.success("Ficha de relacionamento salva neste espaço"); }}>
    <RelationshipFields value={client.relationship} /><Button type="submit" variant="outline">Salvar relacionamento</Button>
  </form>;
}
type Card = Opportunity & { name: string; id: number; review?: string };
export function CrmOpportunities({ clients, onOpen }: { clients: Client[]; onOpen: (id: number) => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [offered, setOffered] = useState<string[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);
  const [error, setError] = useState("");
  const [evaluated, setEvaluated] = useState(false);
  const [quota, setQuota] = useState<{ remaining: number; limit: number } | null>(null);
  const people = clients.filter(c => c.entityType !== "Organização parceira");
  useEffect(() => {
    mounted.current = true;
    const refresh = () => { void fetch("/api/assistant/finance", { cache: "no-store" }).then(r => r.json()).then(v => { if (mounted.current) setQuota((v as { quota?: { remaining: number; limit: number } }).quota ?? null); }).catch(() => {}); };
    refresh(); const timer = setInterval(refresh, 60000);
    return () => { mounted.current = false; clearInterval(timer); };
  }, []);
  const toggle = (id: number) => { setSelected(s => s.includes(id) ? s.filter(v => v !== id) : s.length < 3 ? [...s, id] : s); setCards([]); setEvaluated(false); };
  async function evaluate() {
    if (busy.current) return;
    const students = selected.map(id => people.find(c => c.id === id)).filter((c): c is Client => !!c);
    if (!students.length || !offered.length) return;
    busy.current = true; setLoading(true); setError(""); setCards([]); setEvaluated(false);
    try {
      const response = await fetch("/api/assistant/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(crmPayload(students, offered)) });
      const result = await response.json() as { error?: string; quota?: { remaining: number; limit: number }; opportunities?: Opportunity[] };
      if (!mounted.current) return;
      if (result.quota) setQuota(result.quota);
      if (!response.ok) throw new Error(result.error || "Não foi possível avaliar.");
      setCards((result.opportunities || []).map(o => ({ ...o, id: students[o.slot - 1].id, name: students[o.slot - 1].name })));
      setEvaluated(true);
    } catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : "Falha na avaliação."); }
    finally { busy.current = false; if (mounted.current) setLoading(false); }
  }
  return <section className="mb-6 overflow-hidden rounded-2xl border bg-white">
    <div className="bg-[#123e36] p-5 text-white"><h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="size-5 text-[#f3d58c]" />Nexo · oportunidades de relacionamento</h2><p className="mt-2 text-sm text-white/80">Escolha até três alunos. Receba hipóteses de contato e serviços para revisar — não prescrições de treino.</p></div>
    <div className="space-y-5 p-5">
      <p className="text-sm text-muted-foreground">{quota ? `${quota.remaining} de ${quota.limit} chamadas disponíveis hoje.` : "Cota: até 30 chamadas por dia."} Compartilhada com o Nexo financeiro. Cada avaliação usa uma chamada, inclusive tentativas com falha após envio.</p>
      {!people.length ? <p>Cadastre um aluno para começar.</p> : <details open><summary className="cursor-pointer font-medium">1. Escolha os alunos ({selected.length}/3)</summary><div className="mt-3 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">{people.map(c => {
        const r = cleanRelationship(c.relationship); const ready = !!(r.interests.length + r.goals.length + r.preferences.length);
        return <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border p-3"><label className="flex min-w-0 items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(c.id)} disabled={loading || !ready || (!selected.includes(c.id) && selected.length >= 3)} onChange={() => toggle(c.id)} /><span>{c.name}<small className="block text-muted-foreground">{ready ? r.interests.join(", ") || "Perfil preenchido" : "Preencha a ficha para avaliar"}</small></span></label><Button size="sm" variant="ghost" disabled={loading} onClick={() => onOpen(c.id)}>Ficha</Button></div>;
      })}</div></details>}
      <fieldset disabled={loading}><legend className="mb-3 font-medium">2. Confirme os serviços que você oferece</legend><div className="flex flex-wrap gap-2">{serviceOptions.map(s => <label key={s} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><input type="checkbox" checked={offered.includes(s)} onChange={() => { setOffered(v => v.includes(s) ? v.filter(x => x !== s) : [...v, s]); setCards([]); setEvaluated(false); }} />{s}</label>)}</div></fieldset>
      <p className="text-xs text-muted-foreground">Enviamos à OpenAI apenas opções de relacionamento selecionadas e intervalos desde registros. Não enviamos nomes, contatos, observações livres ou dados de saúde. As sugestões ficam nesta tela; as fichas do seu espaço são salvas neste navegador.</p>
      <Button onClick={() => void evaluate()} disabled={loading || !selected.length || !offered.length || quota?.remaining === 0}><Sparkles />{loading ? "Nexo está avaliando…" : "Avaliar minha carteira"}</Button>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {evaluated && !cards.length && <p role="status">Nenhuma oportunidade foi identificada com os dados disponíveis.</p>}
      <div aria-live="polite" className="grid gap-4 lg:grid-cols-3">{cards.map(card => <article key={card.id} className="space-y-3 rounded-xl border bg-[#f5f9f7] p-4"><p className="text-sm font-semibold text-[#0e665c]">{card.name}</p><h3 className="font-semibold">{card.title}</h3><p className="text-sm"><b>Por quê:</b> {card.reason}</p><p className="text-sm">{card.suggestion}</p><ClientReviewNotes client={people.find(c => c.id === card.id)} /><Button size="sm" variant="outline" onClick={() => onOpen(card.id)}>Ver ficha completa</Button><label className="block text-xs font-medium">Rascunho — revise antes de copiar<Textarea className="mt-2 bg-white" rows={4} value={card.message} onChange={e => setCards(v => v.map(c => c.id === card.id ? { ...c, message: e.target.value } : c))} /></label><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(card.message).then(() => toast.success("Mensagem copiada. Nenhum envio realizado.")).catch(() => toast.error("Selecione e copie o texto manualmente.")); }}>Copiar mensagem</Button><Button size="sm" variant="ghost" onClick={() => setCards(v => v.map(c => c.id === card.id ? { ...c, review: "Revisada pelo profissional" } : c))}>Faz sentido</Button><Button size="sm" variant="ghost" onClick={() => setCards(v => v.filter(c => c.id !== card.id))}>Descartar</Button></div>{card.review && <p className="text-xs text-[#0e665c]">{card.review}</p>}<p className="text-xs text-muted-foreground">Hipótese para sua avaliação. Nenhum contato automático.</p></article>)}</div>
    </div>
  </section>;
}
