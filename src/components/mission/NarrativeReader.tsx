import { useEffect, useRef, useState, type ReactNode } from 'react';
import { browserStorage } from '../../services/browserStorage';
import { PlayerAvatar } from '../characters/PlayerAvatar';
import { dialoguePageIndex, type DialoguePage } from '../../services/dialoguePages';

export interface NarrativeStep { speaker: string; text: string; avatarIndex?: number; player?: boolean }
export function readNarrativePosition(key: string | undefined, length: number): number {
  if (!key) return 0;
  const n = Number(browserStorage.getItem(key));
  return Number.isInteger(n) && n >= 0 && n < length ? n : 0;
}
export function NarrativeReader({ steps, position, onNavigate, storageKey, playerAvatar = 0, onLastStep, children, pageRanges }:
  { steps: readonly NarrativeStep[]; position?: number; onNavigate?: (n: number) => void; storageKey?: string;
    playerAvatar?: number; onLastStep?: (ready: boolean) => void; children?: ReactNode; pageRanges?: readonly DialoguePage[] }) {
  const [local, setLocal] = useState(() => readNarrativePosition(storageKey, steps.length));
  const requested = position ?? local;
  const positionIndex = Number.isInteger(requested) && requested >= 0 && requested < steps.length ? requested : 0;
  const pages = pageRanges ?? steps.map((_, index) => ({ start: index, end: index }));
  const index = dialoguePageIndex(pages, positionIndex);
  const card = useRef<HTMLElement>(null);
  useEffect(() => {
    window.dispatchEvent(new Event('entre-nos-narration-reset'));
    card.current?.focus({ preventScroll: true });
  }, [index]);
  useEffect(() => { onLastStep?.(index === pages.length - 1); }, [index, pages.length, onLastStep]);
  const page = pages[index];
  if (!page) return null;
  const navigate = (n: number) => {
    const offset = pages[n].end;
    if (onNavigate) onNavigate(offset);
    else { if (storageKey) browserStorage.setItem(storageKey, String(offset)); setLocal(offset); }
  };
  return <section data-narrative-reader className="space-y-4">
    <p role="status" className="text-sm text-slate-300">Trecho {index + 1} de {pages.length}</p>
    <article ref={card} tabIndex={-1} data-narrative-index={index} className="space-y-4 rounded-2xl border border-teal-600 bg-slate-950 p-5 text-base leading-relaxed focus:outline-none">
      {steps.slice(page.start, page.end + 1).map((step, offset) => <div key={page.start + offset} data-dialogue-turn={page.start + offset} className="space-y-3">
      {(step.player || step.avatarIndex !== undefined) && <PlayerAvatar index={step.player ? playerAvatar : step.avatarIndex!} name={step.speaker} />}
      <div data-narration="story" className="space-y-3">
        {!['Narração', 'Contexto', 'Pergunta ao jogador'].includes(step.speaker) && <h2 className="text-xl font-bold text-teal-200">{step.speaker}</h2>}
        <p className="whitespace-pre-line break-words">{step.text}</p>
      </div>
      </div>)}
    </article>
    <div className="flex flex-col gap-3 sm:flex-row">
      <button type="button" disabled={index === 0} onClick={() => navigate(index - 1)} className="min-h-12 rounded-xl border border-slate-500 px-5 py-3 font-bold disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Trecho anterior</button>
      {index < pages.length - 1
        ? <button type="button" data-narrative-next onClick={() => navigate(index + 1)} className="min-h-12 flex-1 rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Próximo trecho</button>
        : children}
    </div>
  </section>;
}
