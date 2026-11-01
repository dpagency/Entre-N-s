import { journeyMissions } from '../../data/journeys';
import { knownJourneyGuardians } from '../../services/guardianJourney';
import { LearningScoreSummary } from './LearningScoreSummary';
import { JourneyClosing } from './JourneyClosing';
import type { RoomState } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import { GUARDIAN_IDS } from '../../data/pilot';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { learningPoints } from '../../services/learningScore';
import { socketService } from '../../services/socket';
import { JourneyShareCard } from './JourneyShareCard';

export function PilotSummary({ state, myPlayerId, onRestartGame, onOpenFeedback, onReturnHome }: { state: RoomState; myPlayerId: string; onRestartGame: () => void; onOpenFeedback: () => void; onReturnHome?: () => void }) {
  const missions = journeyMissions(state.journeyDefinitionId);
  const points = learningPoints(state.journeyId!, state.fortuneCards, state);
  const player = state.players[myPlayerId];
  const allGuardiansKnown = knownJourneyGuardians(state, missions.map(m => m.id)).length === GUARDIAN_IDS.length;
  return <div className="w-full max-w-5xl mx-auto space-y-6">
    <section className="rounded-3xl border border-amber-400/60 bg-slate-900 p-6 sm:p-8 text-center space-y-4" aria-label="Medalha da jornada">
      <span role="img" aria-label="Medalha de conclusão" className="text-6xl">🏅</span>
      <h1 className="text-3xl font-black text-amber-200">Medalha Caminhos da Escuta</h1>
      <p data-narration="story">Você concluiu as quatro missões. Esta medalha reconhece a jornada e a reflexão, não respostas certas ou erradas.</p>
    </section>
    <LearningScoreSummary points={points} rulesVersion={state.learningRulesVersion} />
    <details className="rounded-2xl border border-slate-700 bg-slate-900 p-5"><summary className="cursor-pointer font-bold text-teal-200">Revisitar minhas decisões</summary><ol className="space-y-4 mt-4">{state.historyLog.map(history => {
      const mission = missions.find(m => m.id === history.missionId);
      const action = mission?.actions.find(a => a.id === history.actionChosenId);
      return <li key={history.missionId}><h3 className="font-bold">{mission?.title}</h3><p>{action?.title}</p><p className="text-sm text-slate-300">{action?.consequenceSummary}</p></li>;
    })}</ol></details>
    {allGuardiansKnown && <section className="rounded-3xl border border-teal-400/50 bg-slate-900 p-5 sm:p-7 space-y-4" aria-label="Identificação com um Guardião">
      <h2 className="text-2xl font-black">Com qual Guardião você mais se identificou nesta jornada?</h2>
      <p className="text-sm text-slate-300">Uma identificação pessoal, sem avaliação de personalidade e sem alterar pontos ou decisões.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GUARDIAN_IDS.map(id => <button key={id} type="button" aria-pressed={state.finalGuardianId === id} onClick={() => socketService.send({ type: 'SELECT_FINAL_GUARDIAN', guardianId: id })} className={`rounded-2xl border-2 p-5 space-y-3 text-center ${state.finalGuardianId === id ? 'border-teal-400 bg-teal-950' : 'border-slate-700 bg-slate-950'}`}>
          <div className="flex justify-center"><CharacterAvatar characterId={id} size="xl" showBadge={false} /></div>
          <span className="block text-xl font-bold">{CHARACTERS[id].name}</span><span className="block text-sm text-teal-200">{CHARACTERS[id].role}</span>
        </button>)}
      </div>
    </section>}
    {state.finalGuardianId && player && <JourneyShareCard guardianId={state.finalGuardianId} playerAvatarIndex={player.variantIndex} showMedal />}
    <JourneyClosing key={state.journeyId} state={state} />
    {state.journeyDefinitionId === 'entre-escolhas-e-cuidados' && onReturnHome && <button type="button" onClick={onReturnHome} className="min-h-12 w-full rounded-xl border border-teal-400 p-4 font-bold text-teal-200">Voltar às jornadas</button>}
    <div className="flex flex-col sm:flex-row gap-3"><button type="button" onClick={onOpenFeedback} className="rounded-xl border border-slate-600 px-5 py-4">Avaliar experiência</button><button type="button" onClick={onRestartGame} className="flex-1 rounded-xl bg-teal-400 text-slate-950 font-black px-5 py-4">Jogar novamente</button></div>
  </div>;
}
