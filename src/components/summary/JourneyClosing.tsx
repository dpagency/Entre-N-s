import type { RoomState } from '../../types/game';
import { journeyDefinition } from '../../data/journeys';
import { JourneyResources } from './JourneyResources';

export function JourneyClosing({ state }: { state: RoomState }) {
  const closing = journeyDefinition(state.journeyDefinitionId).presentation?.closing;
  if (!closing) return <JourneyResources state={state} />;
  return <section data-journey-closing className="space-y-4 rounded-2xl border border-teal-500 p-5">
    <h2 className="text-2xl font-bold">{closing.title}</h2>
    <div data-narration="story" className="space-y-3 leading-relaxed">{closing.text.split('\n\n').map(text => <p key={text}>{text}</p>)}</div>
    <JourneyResources state={state} />
  </section>;
}
