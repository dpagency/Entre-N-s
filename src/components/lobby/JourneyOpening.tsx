import type { JourneyDefinition } from '../../data/journeys';
import { JourneyAudio } from '../ui/JourneyAudio';

export function JourneyOpening({ journey, onContinue, onBack }: { journey: JourneyDefinition; onContinue: () => void; onBack?: () => void }) {
  const opening = journey.presentation!.opening!;
  return <div data-journey-opening className="mx-auto w-full max-w-3xl space-y-5 text-slate-100">
    {onBack && <button type="button" onClick={onBack} className="min-h-12 rounded-xl border border-slate-500 p-3">Voltar às jornadas</button>}
    <h1 className="text-3xl font-black">{journey.title}</h1>
    <JourneyAudio phase="JOURNEY_OPENING" />
    <section data-journey-opening-text data-narration="story" className="space-y-4 rounded-2xl border border-teal-600 bg-slate-950 p-5 text-base leading-relaxed">
      <h2 className="text-xl font-bold text-teal-200">{opening.title}</h2>
      {opening.text.split('\n\n').map(text => <p key={text}>{text}</p>)}
    </section>
      <button type="button" onClick={onContinue} className="min-h-12 flex-1 rounded-xl bg-teal-400 p-4 font-bold text-slate-950">Começar jornada</button>
  </div>;
}
