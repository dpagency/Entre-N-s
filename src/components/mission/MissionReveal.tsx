import React, { useState } from 'react';
import { MissionDef, SanitizedRoomState } from '../../types/game';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { PerspectiveCard } from '../cards/CardView';
import { socketService } from '../../services/socket';
import { CHARACTERS } from '../../data/characters';
import { Users, MessageSquareQuote, Vote, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

interface MissionRevealProps {
  mission: MissionDef;
  state: SanitizedRoomState;
  myPlayerId: string;
}

export const MissionReveal: React.FC<MissionRevealProps> = ({
  mission,
  state,
  myPlayerId,
}) => {
  const [showPerspectives, setShowPerspectives] = useState(false);
  const isHost = state.hostId === myPlayerId;
  const revealedChoices: Record<string, string> = state.revealedIndividualChoices || {};
  const solo = Object.values(state.players).some(p => p.isBot);
  const chosenAction = mission.actions.find(a => a.id === revealedChoices[myPlayerId]);
  const affinityBots = Object.values(state.players).filter(p => p.isBot && chosenAction && revealedChoices[p.id] === chosenAction.id);
  const companion = state.players[myPlayerId];
  const companionPriorities: Record<string, string[]> = {
    alex: ['formalizacao', 'orientacao', 'cautela', 'dialogo', 'acolhimento'],
    joana: ['acolhimento', 'dialogo', 'orientacao', 'cautela', 'formalizacao'],
    ravi: ['cautela', 'orientacao', 'dialogo', 'formalizacao', 'acolhimento'],
    bia: ['orientacao', 'formalizacao', 'dialogo', 'acolhimento', 'cautela'],
  };
  const companionPreference = companion && mission.actions.slice().sort((a, b) =>
    (companionPriorities[companion.characterId]?.indexOf(a.actionType) ?? 9) -
    (companionPriorities[companion.characterId]?.indexOf(b.actionType) ?? 9)
  )[0];
  const companionAffinity = Boolean(chosenAction && companionPreference?.id === chosenAction.id);
  const totalTalismans = affinityBots.length + (companionAffinity ? 1 : 0);
  const guardianQuestion: Record<string, string> = {
    alex: 'Como sua decisão dialoga com os princípios e responsabilidades envolvidos?',
    joana: 'Como as pessoas afetadas poderão ser ouvidas e acolhidas nesse caminho?',
    ravi: 'Que informação ou consequência merece atenção antes de seguirmos?',
    bia: 'Que responsabilidade essa situação nos convida a assumir, mesmo diante do desconforto?',
  };

  // Group players by chosen action
  const choicesByAction: Record<string, string[]> = {};
  mission.actions.forEach((a) => (choicesByAction[a.id] = []));

  Object.entries(revealedChoices).forEach(([pid, actId]) => {
    const actionKey = String(actId);
    if (choicesByAction[actionKey] && (!solo || pid !== myPlayerId)) {
      choicesByAction[actionKey].push(pid);
    }
  });

  const handleStartCollectiveVoting = () => {
    socketService.send({
      type: 'OPEN_COLLECTIVE_VOTE',
    });
  };

  if (solo) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto text-slate-100">
        <section className="rounded-2xl bg-slate-900 border border-slate-700 p-5 space-y-2">
          <span className="text-xs text-teal-300 font-bold">{mission.title}</span>
          <h2 className="text-2xl font-black">Cada Guardião fez sua escolha</h2>
          {chosenAction && <p className="text-sm text-slate-300">Você escolheu: <strong className="text-slate-100">{chosenAction.title}</strong></p>}
        </section>
        <section className="space-y-3" aria-label="Decisões dos Guardiões">
          {Object.entries(revealedChoices).filter(([pid]) => pid !== myPlayerId && state.players[pid]?.isBot).map(([pid, actionId]) => {
            const guardian = state.players[pid];
            const action = mission.actions.find(a => a.id === actionId);
            if (!action) return null;
            const same = action.id === chosenAction?.id;
            return <div key={pid} className="rounded-2xl bg-slate-900 border border-slate-700 p-4 flex gap-3 items-start">
              <CharacterAvatar characterId={guardian.characterId} size="sm" showBadge={false} />
              <div className="space-y-1 min-w-0">
                <strong className="text-teal-200">{CHARACTERS[guardian.characterId].name}</strong>
                <p className="text-sm font-semibold">{action.title}</p>
                <p data-narration="story" className="text-sm text-slate-300">{same ? '“Eu também seguiria esse caminho.”' : `“Eu seguiria esse caminho. ${guardianQuestion[guardian.characterId]}”`}</p>
              </div>
            </div>;
          })}
        </section>
        <section className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-2">
          <h3 className="font-bold text-amber-200">💎 Talismãs de Afinidade · {totalTalismans} de 4</h3>
          <div className="flex flex-wrap gap-2">
            {companionAffinity && companion && <span className="rounded-lg bg-teal-950 border border-teal-500/40 px-3 py-2 text-sm">💎 {CHARACTERS[companion.characterId].name} · companheiro</span>}
            {affinityBots.map(bot => <span key={bot.id} className="rounded-lg bg-slate-900 border border-amber-500/30 px-3 py-2 text-sm">💎 {CHARACTERS[bot.characterId].name}</span>)}
          </div>
          <p className="text-xs text-slate-400">Afinidade não significa resposta certa.</p>
        </section>
        {isHost && <button type="button" onClick={handleStartCollectiveVoting} className="w-full rounded-xl bg-teal-400 text-slate-950 font-black p-4 flex justify-center items-center gap-2">Ver o que aconteceu <ArrowRight className="w-4 h-4" /></button>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Fase 3 de 4 • Revelação e Reflexão Dialogada
          </span>
          <span className="text-xs text-slate-400">
            {mission.title}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
          {solo ? "Sua decisão e as escolhas dos Guardiões" : "As Escolhas Individuais do Grupo"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          {solo ? "Sua decisão permanece registrada. Veja quais alternativas os três Guardiões robôs escolheram no mesmo dilema. Suas escolhas não alteram sua decisão." : "Vejam como cada guardião se posicionou inicialmente. Divergências revelam nuances diferentes da situação; aproveitem o momento para debater abertamente."}
        </p>

        {/* Guided Discussion Box (Structured reflection cues) */}
        {!solo && <div className="mt-5 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-indigo-300 mb-2">
            <MessageSquareQuote className="w-4 h-4 text-indigo-400" />
            Roteiro Sugerido para a Conversa da Equipe (Presencial ou Chamada de Áudio):
          </div>
          <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc list-inside">
            <li>
              Quem optou por caminhos diferentes: <em>quais preocupações imediatas motivaram a sua escolha?</em>
            </li>
            <li>
              Como as perspectivas dos atores ouvidos (servidores, cidadãos, gestores) impactam o desfecho?
            </li>
            <li>
              Existe algum ponto em que o grupo pode convergir para uma ação coletiva mais justa?
            </li>
          </ul>
        </div>}
      </div>

      {solo && state.isRaviSecondRoundActive && (
        <section className="rounded-3xl border border-amber-500/50 bg-amber-950/20 p-5 sm:p-6 space-y-3" aria-label="Nova Escuta de Satori">
          <h3 className="text-lg font-bold text-amber-200">Nova Escuta — Satori</h3>
          <p data-narration="story" className="text-sm text-slate-200 leading-relaxed">“Antes de seguir, eu gostaria de ouvir quem ainda não teve voz. Que informação poderia mudar nossa compreensão? Quem será afetado por essa decisão?”</p>
          <p className="text-sm font-semibold text-teal-200">Sua decisão continua registrada. Esta pausa não exige mudar de resposta: convida a olhar novamente.</p>
        </section>
      )}
      {solo && state.futureLooks.length > 0 && (
        <section className="rounded-2xl border border-blue-500/40 bg-blue-950/25 p-5 space-y-2" aria-label="Olhar Adiante de Wa">
          <h3 className="font-bold text-blue-200">Olhar Adiante — Wa</h3>
          {state.futureLooks.filter(Boolean).map((look, idx) => <p key={idx} data-narration="story" className="text-sm text-slate-200">{look}</p>)}
          <p className="text-xs text-slate-400">Possibilidades para reflexão, não previsões ou respostas corretas.</p>
        </section>
      )}
      {solo && state.unlockedContextIds.length > 0 && (
        <section className="rounded-2xl border border-teal-500/40 bg-teal-950/25 p-5 space-y-2" aria-label="Mais Contexto de Rin">
          <h3 className="font-bold text-teal-200">Mais Contexto — Rin</h3>
          {mission.additionalContexts.filter(ctx => state.unlockedContextIds.includes(ctx.id)).map(ctx => <p key={ctx.id} data-narration="story" className="text-sm text-slate-200">{ctx.content}</p>)}
        </section>
      )}
      {solo && state.sharedPerspectiveIds.length > 0 && (
        <section className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-5 space-y-2" aria-label="Outro Olhar de Yūki">
          <h3 className="font-bold text-rose-200">Outro Olhar — Yūki</h3>
          {mission.perspectives.filter(p => state.sharedPerspectiveIds.includes(p.id)).map(p => <p key={p.id} data-narration="story" className="text-sm text-slate-200"><strong>{p.actorName}:</strong> {p.details}</p>)}
        </section>
      )}

      {solo && chosenAction && <section className="rounded-2xl border border-teal-500/50 bg-teal-950/25 p-5"><h3 className="text-lg font-bold text-teal-200">Sua decisão</h3><p className="font-semibold mt-2">{chosenAction.title}</p><p className="text-sm text-slate-300 mt-1">{chosenAction.description}</p></section>}

      {solo && chosenAction && (
        <section className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-2" aria-label="Talismãs de Afinidade">
          <h3 className="font-bold text-amber-200">Talismãs de Afinidade</h3>
          <p className="text-sm font-semibold text-amber-100">{totalTalismans} de 4 talismãs possíveis nesta missão</p>
          {totalTalismans > 0 ? <div className="flex flex-wrap gap-2">
            {companionAffinity && companion && <span className="rounded-xl bg-teal-950/60 border border-teal-500/50 px-3 py-2 text-sm text-teal-100">💎 {CHARACTERS[companion.characterId].name} · seu companheiro</span>}
            {affinityBots.map(bot => <span key={bot.id} className="rounded-xl bg-slate-900 border border-amber-500/30 px-3 py-2 text-sm text-amber-100">💎 {CHARACTERS[bot.characterId].name}</span>)}
          </div> : <p className="text-sm text-slate-300">Nesta missão, suas escolhas foram diferentes das dos quatro Guardiões.</p>}
          <p className="text-xs text-slate-300">Afinidade indica uma escolha em comum, não uma resposta certa.</p>
        </section>
      )}
      {solo ? (
        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-6 space-y-4" aria-label="Perspectivas dos três Guardiões virtuais">
          <h3 className="text-lg font-bold text-teal-200">As escolhas dos três Guardiões robôs</h3>
          <p className="text-sm text-slate-300">Cada Guardião fez sua própria escolha.</p>
          {Object.entries(revealedChoices).filter(([pid]) => pid !== myPlayerId && state.players[pid]?.isBot).map(([pid, actionId]) => {
            const guardian = state.players[pid];
            const action = mission.actions.find(a => a.id === actionId);
            if (!action) return null;
            return <div key={pid} className="flex items-start gap-3 rounded-2xl bg-slate-950 border border-slate-800 p-4">
              <CharacterAvatar characterId={guardian.characterId} size="md" showBadge={false} />
              <div className="min-w-0 space-y-1">
                <h4 className="font-bold text-base text-amber-200">{CHARACTERS[guardian.characterId]?.name}</h4>
                <p className="text-base font-semibold">{action.title}</p>

                {chosenAction && (
                  <p data-narration="story" className="mt-3 rounded-xl border border-teal-700/50 bg-teal-950/40 p-3 text-sm text-teal-100" aria-label={`Reflexão de ${CHARACTERS[guardian.characterId]?.name}`}>
                    {action.id === chosenAction.id ? '“Eu também consideraria esse caminho. ' : `“Eu consideraria ${action.title.toLocaleLowerCase('pt-BR')}. `}{guardianQuestion[guardian.characterId]}”
                  </p>
                )}
              </div>
            </div>;
          })}
        </section>
      ) : (

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mission.actions.map((action) => {
          const playerIds = choicesByAction[action.id] || [];
          const count = playerIds.length;

          return (
            <div
              key={action.id}
              className={`flex flex-col bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-xl transition-all ${
                count > 0 ? 'border-teal-500/60 ring-1 ring-teal-500/30' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {action.actionType}
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {solo ? `${count} ${count === 1 ? "Guardião" : "Guardiões"}` : `${count} ${count === 1 ? "escolha" : "escolhas"}`}
                </span>
              </div>

              <h4 className="font-bold text-sm sm:text-base text-slate-100 mb-2">
                {action.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {action.description}
              </p>

              {/* Roster of players who chose this */}
              <div className="mt-auto pt-3 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">
                  {solo ? "Guardiões virtuais que preferiram esta alternativa:" : "Guardiões que escolheram:"}
                </div>

                {playerIds.length === 0 ? (
                  <div className="text-xs text-slate-500 italic">
                    {solo ? "Nenhum Guardião virtual preferiu esta alternativa." : "Nenhum guardião escolheu esta alternativa."}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {playerIds.map((pid) => {
                      const p = state.players[pid];
                      if (!p) return null;
                      return (
                        <div
                          key={pid}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                        >
                          <CharacterAvatar
                            characterId={p.characterId}
                            variantIndex={p.variantIndex}
                            size="sm"
                            showBadge={false}
                          />
                          <span className="font-medium">{CHARACTERS[p.characterId]?.name || p.nickname}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      )}
      {solo && <button type="button" onClick={() => setShowPerspectives(v => !v)} className="w-full rounded-2xl border border-teal-500/40 bg-slate-900 px-5 py-4 text-left font-bold text-teal-200">
        {showPerspectives ? 'Ocultar perspectivas anteriores' : 'Voltar e consultar perspectivas anteriores'}
      </button>}
      {(!solo || showPerspectives) && (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
        <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" />
          Relembrar Perspectivas Reveladas dos Atores
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mission.perspectives.map((persp) => (
            <PerspectiveCard
              key={persp.id}
              perspective={persp}
              isSharedWithGroup={true}
            />
          ))}
        </div>
      </div>

      )}
      {solo && isHost && (
        <div className="rounded-2xl border border-teal-500/40 bg-slate-900 p-4 sm:p-5 space-y-3">
          <p className="text-sm text-slate-300">Ouça os outros olhares e prossiga com sua decisão.</p>
          <button type="button" onClick={handleStartCollectiveVoting}
            className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-3 font-black text-slate-950 flex items-center justify-center gap-2">
            Continuar com minha decisão <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Footer bar to move to Collective Voting */}
      {!solo && <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-slate-300">
          Após a conversa em equipe, realizem a{' '}
          <strong className="text-teal-300">votação da ação coletiva da Vila</strong>.
        </div>

        <button
          onClick={handleStartCollectiveVoting}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Vote className="w-4 h-4" />
          <span>Iniciar Votação Coletiva da Equipe</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>}
    </div>
  );
};
