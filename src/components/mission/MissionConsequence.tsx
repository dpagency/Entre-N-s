import React, { useState } from 'react';
import { MissionDef, RoomState } from '../../types/game';
import { DiscoveryCard } from '../cards/CardView';
import { socketService } from '../../services/socket';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

interface MissionConsequenceProps {
  mission: MissionDef;
  state: RoomState;
  myPlayerId: string;
}

export const MissionConsequence: React.FC<MissionConsequenceProps> = ({
  mission,
  state,
  myPlayerId,
}) => {
  const [celebrationSeen, setCelebrationSeen] = useState(false);
  const isHost = state.hostId === myPlayerId;
  const chosenActionId = state.chosenCollectiveActionId || mission.actions[0].id;
  const chosenAction = mission.actions.find((a) => a.id === chosenActionId) || mission.actions[0];

  const isNonConsensual = state.isNonConsensualResult && state.nonConsensualActionIds;
  const nonConsensualActions = isNonConsensual
    ? state.nonConsensualActionIds!.map((id) => mission.actions.find((a) => a.id === id)).filter(Boolean)
    : [];

  const completedCount = state.completedMissionIds.includes(mission.id)
    ? state.completedMissionIds.length
    : state.completedMissionIds.length + 1;

  const isLastMission = completedCount >= 4;
  const fortune = state.fortuneCards?.[mission.id];

  const handleProceed = () => {
    socketService.send({
      type: 'PROCEED_AFTER_CONSEQUENCE',
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-100 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Desfecho Narrativo e Aprendizados
            </span>
            <span className="text-xs text-slate-400">
              Missão {mission.code} • {mission.title}
            </span>
          </div>

          <div className="text-xs font-bold text-amber-400">
            Missões Cumpridas: {completedCount} de 4
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
          {isNonConsensual
            ? 'Decisão Não Consensual: Dois Caminhos em Diálogo'
            : `Ação Coletiva Escolhida: “${chosenAction.title}”`}
        </h2>

        {/* Narrative Outcome Description */}
        {!isNonConsensual ? (
          <div className="mt-4 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm sm:text-base text-slate-200 leading-relaxed font-serif shadow-inner">
              <strong className="text-teal-400 block mb-1 text-xs uppercase tracking-wider font-sans">
                Desdobramentos na Vila dos Encontros:
              </strong>
              {chosenAction.consequenceDetails}
            </div>

            <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/40 text-xs sm:text-sm text-teal-200">
              <strong className="text-teal-300 block mb-1">Feedback Pedagógico da Decisão:</strong>
              {chosenAction.pedagogicalFeedback}
            </div>
          </div>
        ) : (
          /* Non-consensual comparison */
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs sm:text-sm text-amber-200">
              <strong className="text-amber-300 block mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Divergência Persistente:
              </strong>
              O grupo encerrou a deliberação com votos divididos igualmente entre duas alternativas. No serviço público real, quando o consenso não é atingido, é fundamental ponderar os riscos e condições de cada vertente:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nonConsensualActions.map((act) => act && (
                <div key={act.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="font-bold text-sm text-slate-100">{act.title}</div>
                  <div className="text-xs text-slate-300 font-serif leading-relaxed">
                    {act.consequenceDetails}
                  </div>
                  <div className="text-[11px] text-teal-300 pt-2 border-t border-slate-800">
                    {act.pedagogicalFeedback}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!celebrationSeen && (
        <div role="status" className="relative overflow-hidden rounded-3xl border border-amber-400/50 bg-gradient-to-r from-amber-950/70 via-slate-900 to-teal-950/70 p-5 text-center shadow-xl animate-in zoom-in duration-500">
          <div className="text-4xl mb-2" aria-hidden="true">✨🏅✨</div>
          <h3 className="text-xl font-black text-amber-200">Marco de aprendizagem desbloqueado!</h3>
          <p className="text-sm text-slate-200 mt-2">Missão {completedCount} de 4: você explorou escolhas e suas consequências.</p>
          <p className="text-xs text-slate-400 mt-2">Celebramos a reflexão, não uma pontuação moral.</p>
          <button type="button" onClick={() => setCelebrationSeen(true)} className="mt-4 px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold">Continuar reflexão</button>
        </div>
      )}

      <section className="rounded-3xl border border-amber-500/40 bg-slate-900 p-5 space-y-4">
        <h3 className="text-lg font-black text-amber-200">Escolha uma das três cartas do destino</h3>
        <p className="text-sm text-slate-300">Sorte, revés ou segunda chance: o acaso define o caminho, independentemente de suas decisões éticas.</p>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map(index => <button key={index} type="button" disabled={!!fortune || !isHost}
            onClick={() => socketService.send({type:'DRAW_FORTUNE_CARD', cardIndex:index})}
            className={`min-h-36 rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-transform ${fortune?.cardIndex === index ? 'border-amber-300 bg-amber-950' : 'border-teal-500/50 bg-teal-950 hover:-translate-y-1'} disabled:cursor-default`}>
            <span className="text-4xl" aria-hidden="true">{fortune?.cardIndex === index ? (fortune.outcome === 'sorte' ? '✨' : fortune.outcome === 'reves' ? '🌧️' : '🌟') : '🂠'}</span>
            <span className="text-xs font-bold text-amber-100">{fortune?.cardIndex === index ? (fortune.outcome === 'sorte' ? 'Sorte' : fortune.outcome === 'reves' ? 'Revés' : 'Segunda chance') : `Carta ${index + 1}`}</span>
          </button>)}
        </div>
        {fortune && <div role="status" className="rounded-2xl border border-amber-400/50 bg-amber-950/40 p-4 text-center animate-in zoom-in duration-500">
          <div className="text-3xl" aria-hidden="true">✨ 🏅 ✨</div>
          <p className="font-black text-amber-200 mt-2">{fortune.outcome === 'sorte' ? 'Um caminho favorável!' : fortune.outcome === 'reves' ? 'Um imprevisto no caminho!' : 'Uma nova oportunidade!'}</p>
          <p className="text-sm text-slate-200 mt-2">{fortune.outcome === 'reves' ? 'O revés faz parte da sorte, não é punição pela sua escolha. Você pode continuar.' : 'Esta carta acrescenta uma conquista à sua jornada.'}</p>
        </div>}
      </section>
      {/* Discovery unlocked card */}
      <DiscoveryCard discovery={mission.discovery} />

      {/* Editorial metadata & proposed guidance tag */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span className="text-slate-300 font-bold block mb-0.5">
            Fonte Editorial & Status Curatorial:
          </span>
          <span>{mission.editorialInfo.source}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
            {mission.editorialInfo.version}
          </span>
          <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/30 text-[10px] font-semibold">
            {mission.editorialInfo.reviewStatus}
          </span>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-slate-300">
          {isLastMission ? (
            <span className="text-amber-300 font-semibold">
              Parabéns! As 4 missões foram concluídas. A equipe avançará para a avaliação de encerramento.
            </span>
          ) : (
            <span className="text-slate-300">
              Retornem ao mapa da Vila para escolher o próximo destino coletivo ({completedCount}/4).
            </span>
          )}
        </div>

        <button
          onClick={handleProceed}
          disabled={!fortune}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-40"
        >
          <span>{isLastMission ? 'Ir para Avaliação Final' : 'Voltar ao Mapa Territorial'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
