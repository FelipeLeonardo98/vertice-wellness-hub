import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { faqs, journeys, pains, statusHelp, whatsapp, type Status } from "./content";
import { WeekBoard } from "./week-board";
import { Gallery } from "./gallery";
import "@fontsource-variable/archivo/wdth.css";
import "./sales.css";

export const metadata: Metadata = {
  title: "Vértice | Gestão para profissionais de educação física",
  description:
    "Alunos, academias parceiras e contratos organizados num só lugar. O Vértice está em fase piloto: agende uma demonstração com o Felipe pelo WhatsApp.",
  openGraph: {
    title: "Vértice: cada aula tem um combinado",
    description: "Alunos, academias parceiras e contratos organizados para quem vive de dar aula.",
    images: [{ url: "/apresentacao/dashboard.png", width: 1265, height: 712 }],
  },
};

function Mark() {
  return (
    <svg className="vx-mark" viewBox="0 0 32 28" aria-hidden="true">
      <path d="M2 26 16 3l14 23" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M17.5 13.5 22 21" fill="none" stroke="var(--lima)" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

function Schedule({ label = "Agendar demonstração", tone = "dark" }: { label?: string; tone?: "dark" | "lima" }) {
  return (
    <a className={`vx-btn vx-btn-${tone}`} href={whatsapp} target="_blank" rel="noopener noreferrer">
      <MessageCircle size={18} aria-hidden="true" />
      {label}
    </a>
  );
}

const statusOrder: Status[] = ["Disponível", "Demonstrativo", "Em teste", "Experimental"];

export default function SalesPage() {
  return (
    <div className="vx">
      <a className="vx-skip" href="#conteudo">Pular para o conteúdo</a>

      <header className="vx-header vx-wrap">
        <a className="vx-brand" href="#inicio" aria-label="Vértice, início"><Mark />Vértice</a>
        <nav aria-label="Seções">
          <a href="#dores">Onde aperta</a>
          <a href="#galeria">Veja por dentro</a>
          <a href="#jornadas">O que já funciona</a>
          <a href="#piloto">Piloto</a>
        </nav>
        <a className="vx-header-cta" href={whatsapp} target="_blank" rel="noopener noreferrer">Falar com o Felipe</a>
      </header>

      <main id="conteudo">
        <section className="vx-hero vx-wrap" id="inicio">
          <div className="vx-hero-head">
            <h1>Cada aula tem um combinado.</h1>
            <div className="vx-hero-side">
              <p>
                O Vértice organiza alunos, academias parceiras e contratos de quem trabalha por conta própria com educação física.
                Tudo o que hoje fica espalhado entre conversas, cadernos e memória.
              </p>
              <Schedule />
              <span className="vx-hero-note">Em fase piloto, feito em Praia Grande (SP)</span>
            </div>
          </div>
          <WeekBoard />
          <p className="vx-board-hint">Semana fictícia de um professor. Toque em um horário para ver o que foi combinado.</p>
        </section>

        <section className="vx-pains" id="dores">
          <div className="vx-wrap">
            <h2 className="vx-h2">Você reconhece alguma dessas frases?</h2>
            <ol className="vx-pain-list">
              {pains.map((p) => (
                <li key={p.media}>
                  <blockquote>
                    <p>“{p.quote}”</p>
                    <footer>{p.who}</footer>
                  </blockquote>
                  <div className="vx-pain-answer">
                    <p>{p.answer}</p>
                    <a href={`#${p.media}`}>{p.cta}</a>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="vx-gallery" id="galeria">
          <div className="vx-wrap">
            <div className="vx-gallery-head">
              <h2 className="vx-h2">Veja por dentro</h2>
              <p>Quatro filmes curtos, um para cada rotina, e telas reais da demonstração. Os filmes usam cenas ilustrativas; pessoas e valores são fictícios.</p>
            </div>
            <Gallery />
          </div>
        </section>

        <section className="vx-wrap vx-journeys" id="jornadas">
          <div className="vx-split">
            <h2 className="vx-h2">O que já funciona e o que ainda está em teste</h2>
            <dl className="vx-legend">
              {statusOrder.map((s) => (
                <div key={s}><dt><span className={`vx-pill vx-pill-${s.split(" ").join("-").toLowerCase()}`}>{s}</span></dt><dd>{statusHelp[s]}</dd></div>
              ))}
            </dl>
          </div>
          <ul className="vx-journey-list">
            {journeys.map((j) => (
              <li key={j.title}>
                <details>
                  <summary>
                    <span className="vx-j-aud">{j.audience}</span>
                    <span className="vx-j-main"><strong>{j.title}</strong><span>{j.body}</span></span>
                    <span className={`vx-pill vx-pill-${j.status.split(" ").join("-").toLowerCase()}`}>{j.status}</span>
                  </summary>
                  <p>{j.detail}</p>
                </details>
              </li>
            ))}
          </ul>
        </section>

        <section className="vx-pilot" id="piloto">
          <div className="vx-wrap vx-pilot-grid">
            <div className="vx-founder">
              <h2 className="vx-h2">Fale direto com quem está construindo</h2>
              <p>
                Sou o Felipe. Estou construindo o Vértice junto com profissionais que dão aula todos os dias, em academia, estúdio, parque e na casa do aluno.
                O piloto é pequeno de propósito: poucas pessoas, acompanhamento próximo e ajustes a partir da sua rotina.
              </p>
            </div>
            <ol className="vx-pilot-steps">
              <li><strong>Você conta como é a sua semana.</strong> Onde dá aula, quantos alunos, o que hoje dá mais trabalho.</li>
              <li><strong>Eu mostro o Vértice com uma rotina parecida.</strong> Demonstração guiada, com o que já funciona e o que ainda não.</li>
              <li><strong>Se fizer sentido, combinamos o piloto.</strong> Escopo, acompanhamento e valor ficam definidos antes de começar.</li>
            </ol>
          </div>
        </section>

        <section className="vx-wrap vx-faq" aria-labelledby="faq-title">
          <h2 className="vx-h2" id="faq-title">Perguntas frequentes</h2>
          <div>
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="vx-final">
          <div className="vx-wrap">
            <h2>Mostre sua semana. A gente organiza junto.</h2>
            <p>Uma conversa pelo WhatsApp, sem custo e sem precisar cadastrar nenhum aluno.</p>
            <Schedule tone="lima" label="Agendar demonstração no WhatsApp" />
          </div>
        </section>
      </main>

      <footer className="vx-footer vx-wrap">
        <a className="vx-brand" href="#inicio"><Mark />Vértice</a>
        <p>Praia Grande, SP. Produto em fase piloto.</p>
        <Link href="/">Abrir a demonstração</Link>
      </footer>

      <div className="vx-mobile-cta"><Schedule label="Agendar demonstração" /></div>
    </div>
  );
}
