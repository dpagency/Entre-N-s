import { useId, useState } from 'react';
import type { MissionDef } from '../../types/game';

/** Text disclosure is independent of both the player's choice and narration. */
export function MissionPerspectives({ perspectives }: Pick<MissionDef, 'perspectives'>) {
  const id = useId();
  const [expanded, setExpanded] = useState(() => new Set(perspectives.slice(0, 1).map(p => p.id)));
  return <section aria-label="Perspectivas dos personagens" className="space-y-3">
    <h2 className="text-lg font-bold">O que eles estão pensando?</h2>
    <p className="text-base text-slate-300">Conheça as perspectivas antes de decidir. Para escutar, use os controles de narração.</p>
    {perspectives.map(perspective => {
      const open = expanded.has(perspective.id);
      const panelId = `${id}-${perspective.id}`;
      const titleId = `${panelId}-title`;
      return <article key={perspective.id} data-perspective={perspective.id} className="min-w-0 rounded-xl border border-slate-700 bg-slate-950/50 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-2xl" aria-hidden="true">{perspective.actorAvatar}</span>
          <div className="min-w-0 flex-1 break-words">
            <h3 id={titleId} className="text-lg font-bold">{perspective.actorName}</h3>
            <p className="text-sm text-slate-300">{perspective.actorRole}</p>
          </div>
        </div>
        <button type="button" aria-expanded={open} aria-controls={panelId} aria-label={`${open ? 'Ocultar perspectiva' : 'Ver perspectiva'} de ${perspective.actorName}`} onClick={() => setExpanded(previous => {
          const next = new Set(previous);
          if (next.has(perspective.id)) next.delete(perspective.id); else next.add(perspective.id);
          return next;
        })} className="min-h-12 w-full rounded-xl border border-teal-500 px-4 py-3 text-left text-base font-bold text-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 md:hidden">
          {open ? 'Ocultar perspectiva' : 'Ver perspectiva'}
        </button>
        <div id={panelId} role="region" aria-labelledby={titleId} data-perspective-text className={`${open ? 'block' : 'hidden'} md:block space-y-3 break-words text-base leading-relaxed text-slate-200`}>
          <p data-narration="story">{perspective.summary}</p>
        </div>
      </article>;
    })}
  </section>;
}
