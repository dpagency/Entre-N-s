import type { MissionDef, RoomState } from '../../types/game';
import { socketService } from '../../services/socket';
import { NarrativeReader } from './NarrativeReader';
import { dialoguePages } from '../../services/dialoguePages';

export function MissionDialogue({ mission, state, myPlayerId }: { mission: MissionDef; state: RoomState; myPlayerId: string }) {
  const steps = mission.dialogue!.map(({ speaker, text }) => ({ speaker, text }));
  return <div data-mission-dialogue className="mx-auto w-full max-w-3xl space-y-5 text-slate-100">
    <header><p className="text-sm text-teal-200">{mission.code}</p><h1 className="text-2xl font-black">{mission.title}</h1></header>
    <NarrativeReader steps={steps} pageRanges={state.journeyDefinitionId === 'entre-escolhas-e-cuidados' ? dialoguePages(steps) : undefined} position={state.dialoguePositions?.[mission.id] || 0}
      onNavigate={step => socketService.send({ type: 'SET_DIALOGUE_STEP', step })}>
      <button type="button" onClick={() => {
        socketService.send({ type: 'SET_DIALOGUE_STEP', step: mission.dialogue!.length - 1 });
        socketService.send({ type: 'EXPLORE_MISSION' });
      }} className="min-h-12 flex-1 rounded-xl bg-teal-400 p-4 font-bold text-slate-950">{state.missionFlowVersion === 2 ? 'Tomar uma decisão' : 'Desafio dos Guardiões da Integridade'}</button>
    </NarrativeReader>
  </div>;
}
