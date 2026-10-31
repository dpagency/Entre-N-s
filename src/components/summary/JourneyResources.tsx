import type { RoomState } from '../../types/game';
import { completedJourneyResources } from '../../services/journeySelection';

export function JourneyResources({ state }: { state: RoomState }) {
  const resources = completedJourneyResources(state);
  if (!resources.length) return null;
  return <section aria-label="Para continuar aprendendo" className="space-y-3 rounded-2xl border border-teal-500 p-5">
    <h2 className="text-xl font-bold">Para continuar aprendendo</h2>
    {resources.map(resource => <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer"
      className="block min-h-12 rounded-xl bg-teal-400 p-4 font-bold text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300">
      {resource.label}<span className="block text-sm font-normal">Abre em nova aba · acesso opcional, sem pontuação</span>
    </a>)}
  </section>;
}
