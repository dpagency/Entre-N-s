import React, { useState } from 'react';
import { RoomState } from '../../types/game';
import { MISSIONS } from '../../data/missions';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { CHARACTERS } from '../../data/characters';
import { Award, CheckCircle2, Users, Compass, Sparkles, MessageSquare, RotateCcw, ShieldCheck } from 'lucide-react';

interface GameSummaryProps {
  state: RoomState;
  myPlayerId: string;
  onOpenFeedback: () => void;
  onRestartGame: () => void;
}

export const GameSummary: React.FC<GameSummaryProps> = ({
  state,
  myPlayerId,
  onOpenFeedback,
  onRestartGame,
}) => {
  const companion = state.players[myPlayerId];
  const [nextGuardian, setNextGuardian] = useState<string | null>(null);
  const companionPriorities: Record<string, string[]> = {
    alex: ['formalizacao', 'orientacao', 'cautela', 'dialogo', 'acolhimento'],
    joana: ['acolhimento', 'dialogo', 'orientacao', 'cautela', 'formalizacao'],
    ravi: ['cautela', 'orientacao', 'dialogo', 'formalizacao', 'acolhimento'],
    bia: ['orientacao', 'formalizacao', 'dialogo', 'acolhimento', 'cautela'],
  };
  const guardianIds = ['alex', 'joana', 'ravi', 'bia'] as const;
  const affinityCounts = guardianIds.map(characterId => ({
    characterId,
    count: state.historyLog.filter(h => {
      if (characterId !== companion?.characterId) return h.affinityGuardianIds?.includes(characterId);
      const mission = MISSIONS.find(m => m.id === h.missionId);
      if (!mission) return false;
      const preferred = mission.actions.slice().sort((x, y) =>
        (companionPriorities[characterId].indexOf(x.actionType)) -
        (companionPriorities[characterId].indexOf(y.actionType))
      )[0];
      return preferred?.id === h.actionChosenId;
    }).length,
  }));

  const completedMissions = MISSIONS.filter((m) =>
    state.completedMissionIds.includes(m.id)
  );

  const totalPerspectivesExplored = state.historyLog.reduce(
    (acc, h) => acc + h.perspectivesExploredCount,
    0
  );

  const reconsiderationsCount = state.historyLog.filter(
    (h) => h.reconsiderationOccurred
  ).length;

  // Pontos de navegação: nunca derivados de qual alternativa ética foi escolhida.
  // Quatro missões, até 25 pontos por dimensão; critérios auditáveis no histórico.
  const progress = Math.min(4, completedMissions.length);
  const fortuneOutcomes = Object.values(state.fortuneCards || {});
  const favorableCards = fortuneOutcomes.filter(card => card.outcome !== 'reves').length;
  const reversals = fortuneOutcomes.filter(card => card.outcome === 'reves').length;
  const revealedCards = Math.min(4, fortuneOutcomes.length);
  const dimensions = [
    { label: 'Resultados', points: Math.min(25, progress * 5 + Math.min(5, revealedCards)), explanation: 'Avanço nas missões e participação na dinâmica das cartas, independentemente do resultado sorteado.' },
    { label: 'Confiança', points: Math.min(25, state.historyLog.reduce((sum, h) => sum + Math.min(5, h.perspectivesExploredCount), 0)), explanation: 'Atenção dedicada às perspectivas e aos vínculos de confiança.' },
    { label: 'Equilíbrio', points: Math.min(25, state.historyLog.reduce((sum, h) => sum + Math.min(4, h.perspectivesExploredCount) + (h.reconsiderationOccurred ? 2 : 0), 0)), explanation: 'Perspectivas consideradas e disposição para reconsiderar.' },
    { label: 'Participação', points: Math.min(25, state.historyLog.reduce((sum, h) => sum + Math.min(5, h.perspectivesExploredCount), 0)), explanation: 'Participação nas etapas de escuta e exploração.' },
  ];
  const journeyPoints = dimensions.reduce((sum, d) => sum + d.points, 0);
  const journeyLevel = journeyPoints < 40 ? 'Percurso inicial' : journeyPoints < 70 ? 'Percurso em desenvolvimento' : 'Percurso avançado';

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto text-slate-100 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-950 border border-teal-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Award className="w-9 h-9" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-teal-300 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30">
          Jornada concluída • momento de reflexão
        </span>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-100 mt-2 mb-2">
          O Círculo dos Encontros
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Um espaço de reflexão sobre as decisões, seus efeitos e os vínculos que construímos. Cada escolha convida a examinar responsabilidades, riscos e possibilidades de reparação.
        </p>
      </div>

      {completedMissions.length >= 4 && <section aria-label="Medalha da jornada" className="rounded-3xl border border-amber-400/50 bg-amber-950/20 p-6 text-center space-y-3"><div className="text-6xl" role="img" aria-label="Medalha">🏅</div><h2 className="text-2xl font-black text-amber-200">Medalha Caminhos da Escuta</h2><p className="text-sm text-slate-200">Você concluiu as quatro missões. Esta medalha reconhece a jornada e a reflexão, não respostas certas ou erradas.</p></section>}
      <section className="rounded-3xl border border-teal-500/30 bg-slate-900 p-5 space-y-3">
        <h2 className="text-lg font-bold text-teal-200">O que levamos desta jornada?</h2>
        <p className="text-sm text-slate-300">Revisite as decisões e seus efeitos. Os indicadores abaixo registram participação e descobertas, não uma classificação moral.</p>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <p className="rounded-xl bg-slate-950 p-3"><strong className="block text-amber-300">O que decidimos?</strong>Quais alternativas escolhemos e quais deixamos de lado?</p>
          <p className="rounded-xl bg-slate-950 p-3"><strong className="block text-amber-300">O que aconteceu?</strong>Quem foi afetado e quais riscos permaneceram?</p>
          <p className="rounded-xl bg-slate-950 p-3"><strong className="block text-amber-300">O que aprendemos?</strong>O que faríamos diferente diante de um novo dilema?</p>
        </div>
      </section>
      <section className="rounded-3xl border border-amber-500/40 bg-slate-900 p-5 sm:p-6 space-y-4" aria-label="Pontuação da jornada">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-black text-amber-200">Seu percurso pela Vila</h2>
          <span className="text-xl font-black text-amber-300">{journeyPoints}/100 pontos</span>
        </div>
        <div className="h-3 rounded-full bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${journeyPoints}%` }} /></div>
        <p className="text-sm font-bold text-teal-300">{journeyLevel}</p>
        <p className="text-xs text-slate-300">Os pontos reconhecem a navegação, a exploração e a colaboração — não avaliam seus valores nem classificam suas escolhas éticas como boas ou ruins. O resultado aleatório das cartas não altera a pontuação.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dimensions.map((d) => <div key={d.label} className="rounded-xl bg-slate-950 p-3 border border-slate-800">
            <div className="flex justify-between gap-2 text-sm font-bold"><span>{d.label}</span><span className="text-amber-300">{d.points}/25</span></div>
            <p className="text-xs text-slate-400 mt-1">{d.explanation}</p>
          </div>)}
        </div>
        <p className="text-xs text-amber-200">Cartas reveladas: {fortuneOutcomes.length} · Favoráveis ou segunda chance: {favorableCards} · Reveses: {reversals}. Sorte, segunda chance e revés têm o mesmo peso na participação.</p>
        <p className="text-xs text-slate-400">Escala experimental do piloto: inicial (0–39), desenvolvimento (40–69), avançado (70–100). O máximo representa o teto da escala, não uma nota ética.</p>
      </section>

      {affinityCounts.length > 0 && <section className="rounded-3xl border border-amber-500/40 bg-slate-900 p-5 space-y-3" aria-label="Coleção de Talismãs de Afinidade">
        <h2 className="text-lg font-black text-amber-200">💎 Seus Talismãs de Afinidade</h2>
        <p className="text-sm text-slate-300">Cada talismã registra uma escolha em comum com um dos quatro Guardiões, incluindo seu companheiro. Zero talismãs também faz parte da jornada.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {affinityCounts.map(({characterId, count}) => <div key={characterId} className={`rounded-xl border p-3 flex items-center gap-3 ${characterId === companion?.characterId ? 'border-teal-400 bg-teal-950/40 ring-1 ring-teal-400/40' : 'border-slate-700 bg-slate-950'}`}>
            <CharacterAvatar characterId={characterId} size="sm" />
            <div><p className="font-bold text-amber-200">{CHARACTERS[characterId].name}{characterId === companion?.characterId && <span className="block text-xs font-bold text-teal-300">★ Seu Guardião nesta jornada</span>}</p><p className="text-sm text-slate-300">{count} {count === 1 ? 'talismã' : 'talismãs'}</p></div>
          </div>)}
        </div>
        <div className="space-y-3 pt-2">
          <h3 className="text-lg font-bold text-teal-200">Quem será seu próximo Guardião?</h3>
          <p className="text-xs text-slate-400">Escolha por curiosidade. Sua resposta não altera a jornada concluída.</p>
          <div className="grid grid-cols-2 gap-2">
            {guardianIds.map(id => <button key={id} type="button" aria-pressed={nextGuardian === id} onClick={() => setNextGuardian(id)} className={nextGuardian === id ? 'rounded-xl border-2 border-teal-400 bg-teal-950/60 p-3 text-sm font-bold text-teal-100' : 'rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200'}>
              {nextGuardian === id ? '✓ ' : ''}{CHARACTERS[id].name}{id === companion?.characterId ? ' · atual' : ''}
            </button>)}
          </div>
          {nextGuardian && <div role="region" aria-live="polite" aria-label="Características do próximo Guardião" className="rounded-2xl border border-teal-500/50 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <CharacterAvatar characterId={nextGuardian as keyof typeof CHARACTERS} size="sm" />
              <div><h4 className="text-lg font-black text-teal-200">{CHARACTERS[nextGuardian as keyof typeof CHARACTERS].name}</h4><p className="text-sm text-slate-200">{CHARACTERS[nextGuardian as keyof typeof CHARACTERS].title}</p></div>
            </div>
            <p className="text-xs font-semibold text-amber-200">{CHARACTERS[nextGuardian as keyof typeof CHARACTERS].role}</p>
            <p className="text-sm leading-relaxed text-slate-200">{CHARACTERS[nextGuardian as keyof typeof CHARACTERS].description}</p>
            <p className="text-sm italic text-teal-200">{CHARACTERS[nextGuardian as keyof typeof CHARACTERS].quote}</p>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
              <p className="text-sm font-bold text-amber-200">Poder especial: {CHARACTERS[nextGuardian as keyof typeof CHARACTERS].powerName}</p>
              <p className="text-xs text-slate-300 mt-1">{CHARACTERS[nextGuardian as keyof typeof CHARACTERS].powerDescription}</p>
            </div>
            <p className="text-xs text-slate-400">Você poderá escolher este Guardião ao iniciar uma nova jornada.</p>
          </div>}
        </div>
      </section>}
      {/* Aggregate Collective Indicators (No moral ranking!) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-lg">
          <div className="text-2xl sm:text-3xl font-black text-teal-400">
            {completedMissions.length}
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1">
            Missões Cumpridas
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-lg">
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {state.unlockedDiscoveries.length}/4
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1">
            Descobertas da Jornada
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-lg">
          <div className="text-2xl sm:text-3xl font-black text-blue-400">
            {totalPerspectivesExplored}
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1">
            Perspectivas Ouvidas
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-lg">
          <div className="text-2xl sm:text-3xl font-black text-rose-400">
            {reconsiderationsCount}
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1">
            Reconsiderações
          </div>
        </div>
      </div>

      {/* Discoveries badges showcase */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Pilares e descobertas da jornada
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              key: 'escuta',
              title: 'Escuta Ativa',
              desc: 'Abrir espaço seguro para vozes ainda não ouvidas sem impor respostas apressadas.',
            },
            {
              key: 'respeito',
              title: 'Respeito e Dignidade',
              desc: 'Urbanidade firme mesmo sob pressão, separando correções técnicas de ofensas pessoais.',
            },
            {
              key: 'responsabilidade',
              title: 'Responsabilidade e Probidade',
              desc: 'Coragem para retificar falhas e lealdade republicana irrestrita ao interesse público.',
            },
            {
              key: 'orientacao',
              title: 'Orientação Clara',
              desc: 'Acolher a sociedade com empatia e equidade, respeitando os limites da função pública.',
            },
          ].map((disc) => {
            const hasDisc = state.unlockedDiscoveries.includes(disc.key as any);
            return (
              <div
                key={disc.key}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                  hasDisc
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    hasDisc ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-100">{disc.title}</div>
                  <div className="text-xs text-slate-400 leading-snug mt-0.5">{disc.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roster of participants */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          Guardiões Participantes
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          {Object.values(state.players).map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm"
            >
              <CharacterAvatar characterId={p.characterId} variantIndex={p.variantIndex} size="sm" />
              <div>
                <div className="font-bold text-xs text-slate-200">{p.isBot ? CHARACTERS[p.characterId]?.name : p.nickname}</div>
                <div className="text-[10px] text-slate-400">
                  {p.isHost ? 'Jogador' : 'Guardião'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer controls */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          Sua avaliação é voluntária e ajuda a aprimorar a experiência.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onOpenFeedback}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Avaliar Experiência</span>
          </button>

          <button
            onClick={onRestartGame}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jogar Novamente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
