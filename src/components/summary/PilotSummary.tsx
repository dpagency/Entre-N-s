import { journeyMissions } from '../../data/journeys';
import { JourneyResources } from './JourneyResources';
import type { RoomState } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import { GUARDIAN_IDS } from '../../data/pilot';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { learningPoints } from '../../services/learningScore';
import { socketService } from '../../services/socket';
import { JourneyShareCard } from './JourneyShareCard';

export function PilotSummary({ state, myPlayerId, onRestartGame, onOpenFeedback }: { state: RoomState; myPlayerId: string; onRestartGame: () => void; onOpenFeedback: () => void }) {
  const missions = journeyMissions(state.journeyDefinitionId);
  const points = learningPoints(state.journeyId!, state.fortuneCards, state);
  const encounters = Object.values(state.guardianEncounters || {});
  const player = state.players[myPlayerId];
  const voluntary = state.learningRulesVersion === 4;
  return <div className="w-full max-w-5xl mx-auto space-y-6">
    <section className="rounded-3xl border border-amber-400/60 bg-slate-900 p-6 sm:p-8 text-center space-y-4" aria-label="Medalha da jornada">
      <span role="img" aria-label="Medalha de conclusão" className="text-6xl">🏅</span>
      <h1 className="text-3xl font-black text-amber-200">Medalha Caminhos da Escuta</h1>
      <p data-narration="story">Você concluiu as quatro missões. Esta medalha reconhece a jornada e a reflexão, não respostas certas ou erradas.</p>
    </section>
    <section className="rounded-3xl border border-teal-500/50 bg-slate-900 p-5 sm:p-7 space-y-4" aria-label="Pontuação de aprendizagem">
      <h2 className="text-2xl font-black">Sua aprendizagem nesta partida</h2>
      <p className="text-3xl font-black text-amber-200">{points.total} de {points.maximum} pontos disponíveis</p>
      <p className="text-sm text-slate-300">{voluntary ? 'Os pontos registram respostas adequadas nos desafios educativos. Iniciar desafios ou consultar os Canais não concede pontos.' : 'Os pontos registram consultas e acertos em desafios educativos.'} As decisões nos dilemas e a identificação com um Guardião não recebem nota.</p>
      <dl className="grid sm:grid-cols-2 gap-4">
        {voluntary ? <>
          <div className="rounded-xl border border-slate-700 p-4"><dt>Guardiões</dt><dd className="font-bold text-teal-200">{points.knowledge} de {points.knowledgeMax}</dd><p className="text-sm text-slate-300">+15 por resposta adequada. Abertura sem pontos.</p></div>
          <div className="rounded-xl border border-slate-700 p-4"><dt>Atividade voluntária dos Canais</dt><dd data-channel-summary className="font-bold text-teal-200">{points.channelPoints} de {points.channelMax}</dd><p className="text-sm text-slate-300">{points.channelAnswered} de 5 perguntas respondidas. +4 por resposta adequada. Pode continuar pelo botão Canais.</p></div>
        </> : <>
        <div className="rounded-xl border border-slate-700 p-4"><dt>Orientações consultadas</dt><dd className="font-bold text-teal-200">{points.consultation} de {points.consultationMax}</dd><p className="text-sm text-slate-300">{state.learningRulesVersion === 3 ? 'Encontro com o Guardião: +5 por missão apresentada. Consulta aos Canais sem pontos.' : 'Regra anterior: encontro e consulta à Comissão, +5 por tipo e por missão.'}</p></div>
        <div className="rounded-xl border border-slate-700 p-4"><dt>Desafios educativos</dt><dd className="font-bold text-teal-200">{points.knowledge} de {points.knowledgeMax}</dd><p className="text-sm text-slate-300">{state.learningRulesVersion === 3 ? 'Guardião: +15 por acerto. Prática dos Canais sem pontos.' : 'Regra anterior: Guardião +15; Canais +5 por acerto.'}</p></div>
        </>}
      </dl>
      {!voluntary && <p className="text-base">Jornada — consultas, Guardiões e canais: <strong>{points.journeyTotal} de {points.journeyMax}</strong>.</p>}
      <p className="text-base">Perguntas das cartas: <strong>{points.cardPoints} de {points.cardMax} pontos de conhecimento disponíveis</strong>. O máximo considera somente as perguntas desta versão apresentadas na partida; Caminhos, Segunda Chance e Revés oferecem desafios; Sorte de partidas anteriores não oferece pergunta. Registros antigos não recebem bônus retroativo.</p>
      <p className="text-sm text-slate-300">Conhecimento nos desafios, cartas e Canais: {points.knowledge + points.cardPoints + points.channelPoints} de {points.knowledgeMax + points.cardMax + points.channelMax}. Os sorteios são registrados separadamente.</p>
      <p className="text-sm">Cartas do destino: <strong>{points.fortune > 0 ? '+' : ''}{points.fortune} pontos de sorte</strong>, registrados separadamente da aprendizagem. {state.learningRulesVersion === 3 || voluntary ? 'Caminhos sem pontos automáticos; Revés −3 e Segunda Chance +1.' : 'Regra anterior preservada: Sorte +3, Revés −3 e Segunda Chance +1.'}</p>
      <p className="text-sm text-teal-200">{encounters.filter(e => e.answer !== undefined).length} desafios de Guardião respondidos · {state.completedMissionIds.length} missões concluídas</p>
    </section>
    <details className="rounded-2xl border border-slate-700 bg-slate-900 p-5"><summary className="cursor-pointer font-bold text-teal-200">Revisitar minhas decisões</summary><ol className="space-y-4 mt-4">{state.historyLog.map(history => {
      const mission = missions.find(m => m.id === history.missionId);
      const action = mission?.actions.find(a => a.id === history.actionChosenId);
      return <li key={history.missionId}><h3 className="font-bold">{mission?.title}</h3><p>{action?.title}</p><p className="text-sm text-slate-300">{action?.consequenceSummary}</p></li>;
    })}</ol></details>
    <section className="rounded-3xl border border-teal-400/50 bg-slate-900 p-5 sm:p-7 space-y-4" aria-label="Identificação com um Guardião">
      <h2 className="text-2xl font-black">Com qual Guardião você mais se identificou nesta jornada?</h2>
      <p className="text-sm text-slate-300">Uma identificação pessoal, sem avaliação de personalidade e sem alterar pontos ou decisões.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GUARDIAN_IDS.map(id => <button key={id} type="button" aria-pressed={state.finalGuardianId === id} onClick={() => socketService.send({ type: 'SELECT_FINAL_GUARDIAN', guardianId: id })} className={`rounded-2xl border-2 p-5 space-y-3 text-center ${state.finalGuardianId === id ? 'border-teal-400 bg-teal-950' : 'border-slate-700 bg-slate-950'}`}>
          <div className="flex justify-center"><CharacterAvatar characterId={id} size="xl" showBadge={false} /></div>
          <span className="block text-xl font-bold">{CHARACTERS[id].name}</span><span className="block text-sm text-teal-200">{CHARACTERS[id].role}</span>
        </button>)}
      </div>
    </section>
    {state.finalGuardianId && player && <JourneyShareCard guardianId={state.finalGuardianId} playerAvatarIndex={player.variantIndex} showMedal />}
    <JourneyResources state={state} />
    <div className="flex flex-col sm:flex-row gap-3"><button type="button" onClick={onOpenFeedback} className="rounded-xl border border-slate-600 px-5 py-4">Avaliar experiência</button><button type="button" onClick={onRestartGame} className="flex-1 rounded-xl bg-teal-400 text-slate-950 font-black px-5 py-4">Jogar novamente</button></div>
  </div>;
}
