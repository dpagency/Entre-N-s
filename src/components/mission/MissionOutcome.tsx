import type { MissionDef, ActionOption } from '../../types/game';
import { NarrativeReader } from './NarrativeReader';

export const outcomeKey = (journey: string, mission: string) => `entre-nos-narrative-${journey}-${mission}-outcome`;
export function MissionOutcome({ mission, action, journey, onReady, unified = false }: { mission: MissionDef; action: ActionOption; journey: string; onReady: (ready: boolean) => void; unified?: boolean }) {
  if (unified) return <section data-mission-outcome className="space-y-4 rounded-2xl border border-teal-600 bg-slate-950 p-5 text-base leading-relaxed">
    <h1 className="text-2xl font-bold">{mission.title}</h1>
    <div className="space-y-2"><h2 className="text-xl font-bold text-teal-200">Consequência da sua escolha</h2><p data-narration="story">{action.consequenceSummary}</p></div>
    <div className="space-y-3 border-t border-slate-700 pt-4"><h2 className="text-xl font-bold text-amber-200">Para refletir</h2><p data-narration="story">{action.pedagogicalFeedback}</p>{mission.finalReflection && <p data-narration="story">{mission.finalReflection}</p>}</div>
  </section>;
  return <section data-mission-outcome className="space-y-4">
    <h1 className="text-2xl font-bold">{mission.title}</h1>
    <p className="text-base text-teal-200">{action.title}</p>
    <NarrativeReader storageKey={outcomeKey(journey, mission.id)} onLastStep={onReady} steps={[
      { speaker: 'Consequência', text: action.consequenceSummary },
      { speaker: 'Reflexão', text: action.pedagogicalFeedback },
      { speaker: 'Reflexão final da missão', text: mission.finalReflection! },
    ]} />
  </section>;
}
