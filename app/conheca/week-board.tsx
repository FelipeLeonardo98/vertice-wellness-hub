"use client";

import { useState } from "react";
import { Check, CircleAlert, FileText } from "lucide-react";

type Slot = {
  id: string;
  name: string;
  what: string;
  kind: "academia" | "aluno";
  days: number[];
  time: string;
  written: boolean;
  deal: [string, string][];
  doc: string;
};

// Semana fictícia, coerente com os vídeos (Aurora, Prisma, Horizonte, Marina, Lucas, Helena).
const slots: Slot[] = [
  { id: "aurora", name: "Academia Aurora", what: "Musculação", kind: "academia", days: [0, 2, 4], time: "6h", written: true,
    deal: [["Valor", "R$ 45 por hora"], ["Cobrança", "Mensal, por horas dadas"], ["Vigência", "Até dez/2026"]], doc: "Contrato de parceria em PDF" },
  { id: "helena", name: "Helena, 67", what: "Condicionamento", kind: "aluno", days: [1, 3], time: "8h", written: true,
    deal: [["Valor", "R$ 380 por mês"], ["Contato de apoio", "Filha, indicada por ela"], ["Documentos", "Anamnese e PAR-Q"]], doc: "Contrato de prestação de serviços" },
  { id: "lucas", name: "Lucas", what: "Assessoria de corrida", kind: "aluno", days: [0, 2], time: "10h", written: true,
    deal: [["Objetivo", "Primeiros 10 km"], ["Valor", "R$ 320 por mês"], ["Emergência", "Contato registrado"]], doc: "Contrato de assessoria esportiva" },
  { id: "marina", name: "Marina", what: "Personal", kind: "aluno", days: [1, 3], time: "15h", written: false,
    deal: [["Valor", "A combinar"], ["Frequência", "2× por semana"], ["Combinado", "Por mensagem, sem contrato"]], doc: "Falta o contrato" },
  { id: "prisma", name: "Studio Prisma", what: "Funcional coletivo", kind: "academia", days: [0, 2, 4], time: "18h", written: true,
    deal: [["Valor", "R$ 100 por hora"], ["Material", "Fornecido pelo estúdio"], ["Cancelamento", "Aviso de 30 dias"]], doc: "Contrato de parceria em PDF" },
  { id: "horizonte", name: "Horizonte", what: "Musculação", kind: "academia", days: [1, 3, 5], time: "20h", written: false,
    deal: [["Valor", "Acertado no WhatsApp"], ["Sábados", "Escala com a Aurora"], ["Vigência", "Não definida"]], doc: "Falta o contrato" },
];

const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function WeekBoard() {
  const [active, setActive] = useState("marina");
  const current = slots.find((s) => s.id === active)!;
  const loose = slots.filter((s) => !s.written).length;

  return (
    <div className="wk">
      <div className="wk-grid" role="group" aria-label="Semana fictícia de um professor. Escolha um compromisso para ver o combinado.">
        {dayNames.map((d, i) => (
          <div className="wk-day" key={d}>
            <span className="wk-day-name">{d}</span>
            {slots.filter((s) => s.days.includes(i)).map((s, k) => (
              <button
                key={s.id}
                type="button"
                className={`wk-slot wk-${s.kind} ${s.written ? "" : "wk-loose"} ${active === s.id ? "is-active" : ""}`}
                style={{ animationDelay: `${(i * 2 + k) * 45}ms` }}
                aria-pressed={active === s.id}
                onClick={() => setActive(s.id)}
              >
                <span className="wk-time">{s.time}</span>
                <span className="wk-name">{s.name}</span>
                {!s.written && <CircleAlert className="wk-flag" size={14} aria-label="sem nada por escrito" />}
              </button>
            ))}
          </div>
        ))}
      </div>

      <aside className="wk-card" aria-live="polite">
        <p className="wk-card-kind"><span>{current.kind === "academia" ? "Parceria" : "Aluno"}</span>{current.what}</p>
        <h3>{current.name}</h3>
        <dl>
          {current.deal.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <p className={`wk-doc ${current.written ? "ok" : "missing"}`}>
          {current.written ? <Check size={16} /> : <FileText size={16} />}
          {current.doc}
        </p>
        <p className="wk-sum">
          {loose} de {slots.length} compromissos desta semana só existem na conversa. No Vértice, cada um tem cadastro, condições e contrato.
        </p>
      </aside>
    </div>
  );
}
