"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, X, Maximize2 } from "lucide-react";
import { prints, videos, type Media } from "./content";

const all = [...videos, ...prints];

export function Gallery() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Media | null>(null);

  const show = useCallback((id: string) => {
    const item = all.find((m) => m.id === id);
    if (!item) return;
    setOpen(item);
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  // Links da página (#ver-personal, #tela-nexo…) abrem a peça direto na galeria.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (all.some((m) => m.id === id)) show(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [show]);

  const close = () => {
    dialog.current?.close();
  };
  const onClose = () => {
    setOpen(null);
    if (location.hash) history.replaceState(null, "", location.pathname + location.search + "#galeria");
  };

  return (
    <>
      <div className="gl-films">
        {videos.map((v) => (
          <figure key={v.id} id={v.id} className="gl-film">
            <button type="button" onClick={() => show(v.id)} aria-label={`Assistir: ${v.title}, ${v.length}`}>
              <img src={v.poster} alt="" width={1080} height={1920} loading="lazy" />
              <span className="gl-play"><Play size={20} fill="currentColor" /> {v.length}</span>
            </button>
            <figcaption><strong>{v.title}</strong>{v.caption}</figcaption>
          </figure>
        ))}
      </div>

      <div className="gl-prints">
        {prints.map((p) => (
          <figure key={p.id} id={p.id} className="gl-print">
            <button type="button" onClick={() => show(p.id)} aria-label={`Ampliar tela: ${p.title}`}>
              <img src={p.src} alt={`Tela da demonstração do Vértice: ${p.title}`} width={1265} height={712} loading="lazy" />
              <span className="gl-zoom"><Maximize2 size={16} /></span>
            </button>
            <figcaption><strong>{p.title}</strong>{p.caption}</figcaption>
          </figure>
        ))}
      </div>

      <dialog ref={dialog} className={`gl-dialog ${open?.kind === "print" ? "is-print" : ""}`} onClose={onClose} onClick={(e) => { if (e.target === dialog.current) close(); }} aria-label={open?.title}>
        {open && (
          <div className="gl-stage">
            <button type="button" className="gl-close" onClick={close} aria-label="Fechar"><X size={22} /></button>
            {open.kind === "video" ? (
              <video key={open.id} src={open.src} poster={open.poster} controls autoPlay playsInline width={1080} height={1920} />
            ) : (
              <img src={open.src} alt={`Tela da demonstração do Vértice: ${open.title}`} />
            )}
            <div className="gl-info">
              <h3>{open.title}</h3>
              <p>{open.caption}</p>
              {open.transcript && <details><summary>Ler o roteiro do vídeo</summary><p>{open.transcript}</p></details>}
              <p className="gl-fine">{open.kind === "video" ? "Cenas ilustrativas, pessoas e dados fictícios." : "Tela real da demonstração, com dados fictícios."}</p>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
