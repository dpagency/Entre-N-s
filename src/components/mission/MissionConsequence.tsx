import React, { useEffect, useState } from 'react';
import { NarrationControl } from './NarrationControl';
import { MissionDef, RoomState } from '../../types/game';
import { DiscoveryCard } from '../cards/CardView';
import { socketService } from '../../services/socket';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Sparkles, BookOpen, Info, Waves, Lightbulb, Award } from 'lucide-react';

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
  const [showSymbols, setShowSymbols] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  useEffect(() => {
    const key = `entre-nos-celebrated-${state.roomCode}-${mission.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    setShowCelebration(true);
    const timer = window.setTimeout(() => setShowCelebration(false), 3800);
    return () => window.clearTimeout(timer);
  }, [mission.id, state.roomCode]);
  const [showDetails, setShowDetails] = useState(false);
  const concise = (value: string, max = 155) => { const first = value.split(/(?<=[.!?])\s+/)[0]; return first.length <= max ? first : value.slice(0, max).replace(/\s+\S*$/, '') + '…'; };
  const dutyByMission: Record<string, { name: string; expected: string; reference: string; url: string }> = {
    'missao-1': { name: 'Urbanidade e escuta respeitosa', expected: 'Acolha contribuições sem expor ou pressionar colegas e colaboradores.', reference: 'Lei nº 8.112/1990, art. 116, XI — dever de urbanidade.', url: 'https://www.planalto.gov.br/ccivil_03/leis/l8112compilado.htm' },
    'missao-2': { name: 'Urbanidade no trato profissional', expected: 'Corrija o trabalho com objetividade, sem ironias ou desqualificação pessoal, independentemente do vínculo de quem participa.', reference: 'Lei nº 8.112/1990, art. 116, XI — dever de urbanidade.', url: 'https://www.planalto.gov.br/ccivil_03/leis/l8112compilado.htm' },
    'missao-3': { name: 'Zelo e responsabilidade com informações', expected: 'Comunique inconsistências conhecidas e busque a correção pelos procedimentos institucionais.', reference: 'Lei nº 8.112/1990, art. 116, I e III — zelo e observância das normas.', url: 'https://www.planalto.gov.br/ccivil_03/leis/l8112compilado.htm' },
    'missao-4': { name: 'Urbanidade no atendimento ao público', expected: 'Oriente a pessoa com respeito e clareza, observando as regras e os recursos disponíveis.', reference: 'Lei nº 8.112/1990, art. 116, XI — dever de urbanidade.', url: 'https://www.planalto.gov.br/ccivil_03/leis/l8112compilado.htm' }
  };
  const duty = dutyByMission[mission.id];
  const [showDuty, setShowDuty] = useState(false);
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

  const handleProceed = () => {
    socketService.send({
      type: 'PROCEED_AFTER_CONSEQUENCE',
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-100 animate-in fade-in">
      {showCelebration && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 px-4" role="dialog" aria-modal="true" aria-label={isLastMission ? 'Jornada concluída' : 'Medalha conquistada'}>
        <div className="relative w-full max-w-sm rounded-3xl border-2 border-amber-400 bg-slate-900 p-8 text-center shadow-2xl motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:fade-in motion-safe:duration-700">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">{Array.from({length: 12}, (_, i) => <Sparkles key={i} className="absolute w-5 h-5 text-amber-300 motion-safe:animate-pulse" style={{top: `${10 + (i * 37) % 80}%`,left: `${5 + (i * 29) % 90}%`,animationDelay: `${i * 0.13}s`}} />)}</div>
          <Award className="relative mx-auto h-24 w-24 text-amber-300 motion-safe:animate-bounce" aria-hidden="true"/>
          <h2 className="relative mt-4 text-2xl font-black text-amber-200">{isLastMission ? 'Vila dos Encontros concluída!' : 'Nova conquista!'}</h2>
          <p className="relative mt-3 text-lg font-semibold">{mission.discovery.title}</p>
          <p className="relative mt-2 text-sm text-slate-300">{isLastMission ? 'Quatro missões, quatro descobertas. Sua jornada merece ser celebrada!' : `Missão ${completedCount} de 4 concluída. Você ganhou uma nova descoberta!`}</p>
          <button type="button" autoFocus onClick={() => setShowCelebration(false)} className="relative mt-6 rounded-xl bg-amber-400 px-6 py-3 font-bold text-slate-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white">Continuar jornada</button>
        </div>
      </div>}
      {/* Completion recognition: progress, not moral correctness. */}
      <section role="status" aria-live="polite" className="rounded-3xl border border-amber-500/60 bg-gradient-to-r from-amber-950/50 via-slate-900 to-teal-950/40 p-5 sm:p-7 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center" aria-hidden="true">
            <Sparkles className="w-9 h-9 text-amber-300" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black tracking-wider uppercase text-amber-300">{isLastMission ? 'Jornada de missões concluída!' : 'Missão concluída! Nova descoberta desbloqueada'}</p>
            <h2 className="text-xl sm:text-2xl font-black mt-1">Conquista desbloqueada!</h2>

          </div>
        </div>
        <div className="flex items-center justify-between gap-3 mt-5 text-sm font-semibold">
          <span>Progresso na Vila dos Encontros</span>
          <span className="text-amber-300">{completedCount} de 4 missões</span>
        </div>
        <div className="flex gap-2 mt-2" role="img" aria-label={`${completedCount} de 4 missões concluídas`}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={`h-3 rounded-full flex-1 ${i < completedCount ? 'bg-amber-400' : 'bg-slate-700'}`} />
          ))}
        </div>
        {isLastMission && <p className="mt-4 text-teal-200 font-semibold">Você percorreu as quatro missões! Suas descobertas estarão reunidas no resumo da jornada.</p>}
      </section>

      <NarrationControl key={`${mission.id}-outcome`} text={[chosenAction.title, chosenAction.consequenceDetails, chosenAction.pedagogicalFeedback].join(" ")} />
      {/* Concise, icon-led outcome. Full pedagogical content remains available. */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-teal-300 font-semibold">Missão {mission.code} · {mission.title}</p>
          <button type="button" onClick={() => setShowSymbols(v => !v)} aria-expanded={showSymbols} aria-label="Explicação dos símbolos" className="p-2 rounded-full border border-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"><Info className="w-5 h-5" /></button>
        </div>
        {showSymbols && <p role="note" className="bg-slate-950 rounded-xl p-3 text-sm text-slate-300">〰️ Ondas: consequências da decisão. 💡 Lâmpada: convite à reflexão. 🏅 Medalha: descoberta conquistada. O conteúdo detalhado continua disponível por escrito.</p>}
        <h2 className="text-lg sm:text-xl font-bold">{isNonConsensual ? 'Dois caminhos em diálogo' : chosenAction.title}</h2>
        {isNonConsensual ? <div className="space-y-3">
          <p className="text-sm text-amber-200">A equipe terminou dividida. Compare os desdobramentos possíveis.</p>
          {nonConsensualActions.map(act => act && <div key={act.id} className="bg-slate-950 rounded-xl p-4"><p className="font-bold">{act.title}</p><p className="text-sm text-slate-300 mt-2">{concise(act.consequenceDetails)}</p></div>)}
        </div> : <>
          <div className="flex gap-3 items-start bg-slate-950 rounded-xl p-4">
            <Waves className="w-7 h-7 shrink-0 text-cyan-300" aria-label="Consequência" />
            <p className="text-sm sm:text-base leading-relaxed">{concise(chosenAction.consequenceDetails)}</p>
          </div>
          <div className="flex gap-3 items-start bg-violet-950/30 rounded-xl p-4">
            <Lightbulb className="w-7 h-7 shrink-0 text-violet-300" aria-label="Para refletir" />
            <p className="text-sm sm:text-base leading-relaxed">{concise(chosenAction.pedagogicalFeedback)}</p>
          </div>
        </>}
        <button type="button" onClick={() => setShowDetails(v => !v)} aria-expanded={showDetails} className="text-sm text-teal-300 underline underline-offset-4">{showDetails ? 'Ocultar explicações' : 'Saiba mais · explicações completas'}</button>
        {showDetails && <div className="bg-slate-950 rounded-xl p-4 space-y-4 text-sm leading-relaxed">
          {isNonConsensual ? nonConsensualActions.map(act => act && <div key={act.id}><strong>{act.title}</strong><p className="mt-1">{act.consequenceDetails}</p><p className="mt-1 text-teal-200">{act.pedagogicalFeedback}</p></div>) : <><p>{chosenAction.consequenceDetails}</p><p className="text-teal-200">{chosenAction.pedagogicalFeedback}</p></>}
        </div>}
      </section>

      {duty && <section className="rounded-2xl border border-amber-500/40 bg-slate-900 p-5" aria-label="Conheça seus deveres">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 shrink-0 text-amber-300" aria-hidden="true" />
          <div className="flex-1"><p className="text-xs font-bold uppercase text-amber-300">Conheça seus deveres</p><h3 className="font-semibold">{duty.name}</h3></div>
        </div>
        <p className="mt-3 text-sm text-slate-200">{duty.expected}</p>
        <button type="button" onClick={() => setShowDuty(v => !v)} aria-expanded={showDuty} className="mt-3 text-sm text-teal-300 underline underline-offset-4">{showDuty ? 'Ocultar fundamento' : 'Consultar fundamento'}</button>
        {showDuty && <div className="mt-3 space-y-3 rounded-xl bg-slate-950 p-4 text-sm">
          <p>{duty.reference}</p>
          <a href={duty.url} target="_blank" rel="noopener noreferrer" className="text-teal-300 underline">Consultar legislação oficial</a>
          <p className="text-slate-400">O dever é apresentado para orientação. A análise de uma conduta concreta cabe às instâncias competentes.</p>
          <NarrationControl text={`${duty.name}. ${duty.expected}. ${duty.reference}`} />
        </div>}
      </section>}

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
              Parabéns! As 4 missões foram concluídas. A equipe avançará para o resumo da jornada.
            </span>
          ) : (
            <span className="text-slate-300">
              Retornem ao mapa da Vila para escolher o próximo destino coletivo ({completedCount}/4).
            </span>
          )}
        </div>

        <button
          onClick={handleProceed}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <span>{isLastMission ? 'Ver resumo da jornada' : 'Voltar ao Mapa Territorial'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
