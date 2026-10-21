import React, { useState, useEffect } from 'react';
import { MissionDef, RoomState } from '../../types/game';
import { DiscoveryCard } from '../cards/CardView';
import { socketService } from '../../services/socket';
import { SECOND_CHANCE_SCENARIOS, SETBACK_SCENARIOS } from '../../data/fortuneScenarios';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Sparkles, BookOpen, Lock, LockOpen } from 'lucide-react';

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
  const [discoveryOpened, setDiscoveryOpened] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [cardAnswer, setCardAnswer] = useState<number | null>(null);
  const [pendingCardAnswer, setPendingCardAnswer] = useState<number | null>(null);
  useEffect(() => {
    setDiscoveryOpened(false);
    setCardAnswer(null);
    setPendingCardAnswer(null);
    if (!state.fortuneCards?.[mission.id]) return;
    const timer = window.setTimeout(() => setDiscoveryOpened(true), 900);
    return () => window.clearTimeout(timer);
  }, [mission.id, !!state.fortuneCards?.[mission.id]]);
  const isHost = state.hostId === myPlayerId;
  const isSolo = Object.values(state.players).some(p => p.isBot);
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

  const scenarioFor = (kind: 'reves' | 'segunda_chance') => {
    const pool = kind === 'reves' ? SETBACK_SCENARIOS : SECOND_CHANCE_SCENARIOS;
    const sessionKey = 'entre-nos-card-scenario-' + (socketService.roomCode || 'solo') + '-' + mission.id + '-' + kind;
    const lastKey = 'entre-nos-card-last-' + kind;
    try {
      const saved = localStorage.getItem(sessionKey);
      const existing = pool.find(item => item.id === saved);
      if (existing) return existing;
      const previous = localStorage.getItem(lastKey);
      const available = pool.filter(item => item.id !== previous);
      const chosen = available[Math.floor(Math.random() * available.length)];
      localStorage.setItem(sessionKey, chosen.id);
      localStorage.setItem(lastKey, chosen.id);
      return chosen;
    } catch { return pool[0]; }
  };
  const [scenario, setScenario] = useState<ReturnType<typeof scenarioFor> | null>(null);
  useEffect(() => {
    const kind = state.fortuneCards?.[mission.id]?.outcome;
    setScenario(kind === 'reves' || kind === 'segunda_chance' ? scenarioFor(kind) : null);
  }, [mission.id, state.fortuneCards?.[mission.id]?.outcome]);
  const handleProceed = () => {
    socketService.send({
      type: 'PROCEED_AFTER_CONSEQUENCE',
    });
  };

  if (isSolo) {
    return <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto text-slate-100">
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-3">
        <span className="text-xs text-teal-300 font-bold">{mission.title}</span>
        <h2 className="text-2xl font-black">O que aconteceu?</h2>
        <p className="text-sm font-semibold text-teal-200">{chosenAction.title}</p>
        <p data-narration="story" className="text-base leading-relaxed">{chosenAction.consequenceSummary}</p>
        <button type="button" onClick={() => setShowReflection(v => !v)} className="text-sm text-teal-300 underline underline-offset-4">{showReflection ? 'Ocultar reflexão' : 'Para refletir (opcional)'}</button>
        {showReflection && <p className="text-sm text-slate-300">{chosenAction.pedagogicalFeedback}</p>}
      </section>
      <section className="rounded-2xl border border-amber-500/40 bg-slate-900 p-4 space-y-3">
        <h3 className="font-bold text-amber-200">Escolha uma carta do destino</h3>
        <div className="grid grid-cols-3 gap-2">
          {[0,1,2].map(index => <button key={index} type="button" disabled={!!fortune || !isHost} onClick={() => socketService.send({type:'DRAW_FORTUNE_CARD',cardIndex:index})} className={`min-h-24 rounded-xl border-2 p-2 flex flex-col items-center justify-center gap-2 ${fortune?.cardIndex === index ? 'border-amber-300 bg-amber-950' : 'border-teal-500/40 bg-teal-950'}`}>
            <span className="text-3xl">{fortune?.cardIndex === index ? (fortune.outcome === 'sorte' ? '✨' : fortune.outcome === 'reves' ? '🌧️' : '🌟') : '🂠'}</span>
            <span className="text-xs">{fortune?.cardIndex === index ? (fortune.outcome === 'sorte' ? 'Sorte' : fortune.outcome === 'reves' ? 'Revés' : 'Segunda chance') : `Carta ${index+1}`}</span>
          </button>)}
        </div>
        {fortune && <p role="status" className="text-lg font-black text-amber-200">{fortune.outcome === 'sorte' ? '+3 pontos' : fortune.outcome === 'reves' ? '−3 pontos' : '+1 ponto'}</p>}
        {fortune && <p className="text-sm text-amber-200">{fortune.outcome === 'reves' ? 'Um imprevisto! Você pode continuar.' : fortune.outcome === 'sorte' ? 'Um caminho favorável!' : 'Uma nova oportunidade!'}</p>}
      </section>

      {(fortune?.outcome === 'reves' || fortune?.outcome === 'segunda_chance') && scenario && <section className="rounded-xl bg-slate-900 border border-amber-500/40 p-4 space-y-3">
        <h3 className="font-bold text-amber-200">{fortune.outcome === 'reves' ? 'Revés · desafio rápido' : 'Segunda chance · outro olhar'}</h3>
        <p className="text-sm">{scenario.prompt}</p>
        {fortune.outcome === 'segunda_chance' && <p className="text-xs text-slate-400">Sua decisão original permanece.</p>}
        {scenario.options.map((option, index) =>
          <button key={index} type="button" disabled={cardAnswer !== null} onClick={() => setPendingCardAnswer(index)} className={(cardAnswer ?? pendingCardAnswer) === index ? 'w-full text-left p-3 rounded-xl border border-teal-400 bg-teal-950/50 text-sm' : 'w-full text-left p-3 rounded-xl border border-slate-700 text-sm'}>{option}</button>
        )}
        {cardAnswer === null && <button type="button" disabled={pendingCardAnswer === null} onClick={() => setCardAnswer(pendingCardAnswer)} className="w-full rounded-xl bg-teal-400 text-slate-950 font-bold p-3 disabled:opacity-40">Confirmar resposta</button>}
        {cardAnswer !== null && <p role="status" className="text-sm text-teal-200">{scenario.feedback[cardAnswer]}</p>}
      </section>}
      {fortune?.outcome === 'sorte' && <section className="rounded-xl bg-slate-900 border border-teal-500/40 p-4"><p className="text-sm text-teal-200">Sorte! Você encontrou uma pista: {mission.discovery.subtitle}</p></section>}
      {fortune && <section className="rounded-xl bg-slate-900 border border-slate-700 p-4"><p className="text-sm text-amber-200 font-bold">Descoberta: {mission.discovery.title}</p></section>}
      <button type="button" disabled={!fortune || (fortune.outcome !== 'sorte' && cardAnswer === null)} onClick={handleProceed} className="w-full rounded-xl bg-teal-400 text-slate-950 font-black p-4 disabled:opacity-40">{!fortune ? 'Vire uma carta para continuar' : fortune.outcome !== 'sorte' && cardAnswer === null ? 'Responda ao desafio para continuar' : isLastMission ? 'Ver resumo e medalha' : 'Próxima missão →'}</button>
    </div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-100 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Desfecho e aprendizados
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
            : `${isSolo ? 'Sua decisão' : 'Ação coletiva escolhida'}: “${chosenAction.title}”`}
        </h2>

        {/* Narrative Outcome Description */}
        {!isNonConsensual ? (
          <div className="mt-4 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm sm:text-base text-slate-200 leading-relaxed font-serif shadow-inner">
              <strong className="text-teal-400 block mb-1 text-xs uppercase tracking-wider font-sans">
                Desdobramentos na Cidade dos Encontros:
              </strong>
              <p data-narration="story">{chosenAction.consequenceDetails}</p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/40 text-xs sm:text-sm text-teal-200">
              <strong className="text-teal-300 block mb-1">Para refletir sobre sua decisão:</strong>
              <p>{chosenAction.pedagogicalFeedback}</p>
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
                  <div data-narration="story" className="text-xs text-slate-300 font-serif leading-relaxed">
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

      <section className="rounded-3xl border border-amber-500/40 bg-slate-900 p-5 space-y-4">
        <h3 className="text-lg font-black text-amber-200">Escolha uma das três cartas do destino</h3>
        <p className="text-sm text-slate-300">Sorte, revés ou segunda chance: o acaso define o caminho, independentemente de suas decisões éticas.</p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3" role="group" aria-label="Escolha uma carta virada">
          {[0, 1, 2].map(index => <button key={index} type="button" disabled={!!fortune || !isHost}
            onClick={() => socketService.send({type:'DRAW_FORTUNE_CARD', cardIndex:index})}
            aria-label={fortune?.cardIndex === index ? `Carta ${index + 1} revelada: ${fortune.outcome}` : `Virar carta ${index + 1}`}
            aria-pressed={fortune?.cardIndex === index}
            className={`min-h-28 sm:min-h-36 rounded-2xl border-2 p-2 sm:p-3 flex flex-col items-center justify-center gap-2 transition-transform ${fortune?.cardIndex === index ? 'border-amber-300 bg-amber-950' : 'border-teal-500/50 bg-teal-950 hover:-translate-y-1'} disabled:cursor-default`}>
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
      {/* Descoberta revelada somente no encerramento da missão, após a carta do destino. */}
      {fortune && (
        <section aria-live="polite" className="rounded-3xl border border-amber-400/40 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl p-3 bg-amber-500/15 text-amber-300 transition-transform duration-500 motion-reduce:transition-none ${discoveryOpened ? 'scale-110' : 'scale-100'}`}>
              {discoveryOpened ? <LockOpen size={30} aria-hidden="true" /> : <Lock size={30} aria-hidden="true" />}
            </div>
            <div>
              <h3 className="font-black text-xl text-amber-200">{discoveryOpened ? 'Descoberta desbloqueada!' : 'Revelando sua descoberta...'}</h3>
              <p className="text-sm text-slate-300">Um aprendizado desta missão, independentemente da alternativa escolhida.</p>
            </div>
          </div>
          {discoveryOpened && <div className="animate-in fade-in duration-500 motion-reduce:animate-none"><DiscoveryCard discovery={mission.discovery} /></div>}
        </section>
      )}

      <section className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-5 space-y-2">
        <h3 className="text-lg font-bold text-teal-200">O que esta experiência nos convida a refletir?</h3>
        <p className="text-base leading-relaxed text-slate-200">{mission.pedagogicalGoal}</p>
      </section>

      {/* Editorial metadata & proposed guidance tag */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span className="text-slate-300 font-bold block mb-0.5">
            Referência e revisão do conteúdo:
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
              Parabéns! Você concluiu as quatro missões. Seu resumo e sua medalha estão à frente.
            </span>
          ) : (
            <span className="text-slate-300">
              Você concluiu {completedCount} de 4 missões. A próxima região espera por você no mapa.
            </span>
          )}
        </div>

        <button
          onClick={handleProceed}
          disabled={!fortune || !discoveryOpened}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-40"
        >
          <span>{!fortune ? 'Escolha uma carta para continuar' : !discoveryOpened ? 'Revelando descoberta...' : isLastMission ? 'Ver resumo e medalha' : 'Voltar ao mapa da Vila'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
