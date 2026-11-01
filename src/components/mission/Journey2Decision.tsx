import { useEffect, useRef } from 'react';
import type { MissionDef } from '../../types/game';
import { socketService } from '../../services/socket';

export function Journey2Decision({ mission, choice }: { mission: MissionDef; choice?: string }) {
  const proceed = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (choice) proceed.current?.focus({ preventScroll: true }); }, [choice]);
  return <section data-journey2-choice className="mx-auto w-full max-w-3xl space-y-5 text-slate-100">
    <h1 className="text-2xl font-bold">{mission.title}</h1>
    <p data-narration="story" className="text-lg">{mission.decisionPrompt}</p>
    <div role="group" aria-label="Alternativas da missão" className="space-y-3">
      {mission.actions.map((action, index) => <button key={action.id} type="button" data-mission-choice={action.id}
        disabled={!!choice} aria-pressed={choice === action.id}
        onClick={() => !choice && socketService.send({ type: 'SUBMIT_INDIVIDUAL_CHOICE', actionId: action.id })}
        className={`min-h-12 w-full rounded-xl border-2 p-4 text-left text-base leading-relaxed focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${choice === action.id ? 'border-teal-400 bg-teal-950' : 'border-slate-600 bg-slate-900'}`}>
        <span data-narration="story">{String.fromCharCode(65 + index)}. {action.title}</span>
      </button>)}
    </div>
    {choice && <p role="status" className="text-teal-200">Sua decisão está registrada e permanece preservada.</p>}
    <button ref={proceed} type="button" disabled={!choice} onClick={() => socketService.send({ type: 'PROCEED_TO_REVEAL' })} className="min-h-12 w-full rounded-xl bg-teal-400 p-4 font-bold text-slate-950 disabled:opacity-40">Conhecer outras escolhas</button>
  </section>;
}
