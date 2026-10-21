import React from 'react';
import { MissionDef, SanitizedRoomState } from '../../types/game';
import { ActionCard } from '../cards/CardView';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { PowerButton } from '../characters/PowerButton';
import { socketService } from '../../services/socket';
import { CHARACTERS } from '../../data/characters';
import { Lock, Eye, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface MissionIndividualChoiceProps {
  mission: MissionDef;
  state: SanitizedRoomState;
  myPlayerId: string;
  onOpenInstitutionalGuide?: () => void;
}

export const MissionIndividualChoice: React.FC<MissionIndividualChoiceProps> = ({
  mission,
  state,
  myPlayerId,
  onOpenInstitutionalGuide,
}) => {
  const isHost = state.hostId === myPlayerId;
  const myPlayer = state.players[myPlayerId];
  const myChoice = state.myChoice;
  const selectedChoice = myChoice;
  const companionPriorities: Record<string, string[]> = {
    alex: ['formalizacao', 'orientacao', 'cautela', 'dialogo', 'acolhimento'],
    joana: ['acolhimento', 'dialogo', 'orientacao', 'cautela', 'formalizacao'],
    ravi: ['cautela', 'orientacao', 'dialogo', 'formalizacao', 'acolhimento'],
    bia: ['orientacao', 'formalizacao', 'dialogo', 'acolhimento', 'cautela'],
  };
  const companionChoice = myPlayer && mission.actions.slice().sort((a, b) =>
    (companionPriorities[myPlayer.characterId]?.indexOf(a.actionType) ?? 9) -
    (companionPriorities[myPlayer.characterId]?.indexOf(b.actionType) ?? 9)
  )[0];
  const companionDiffers = Boolean(myChoice && companionChoice && companionChoice.id !== myChoice);
  const companionPrompts: Record<string, string> = {
    alex: 'Como esse caminho protege os princípios envolvidos?',
    joana: 'Quem ainda precisa ser ouvido?',
    ravi: 'Que consequência merece atenção?',
    bia: 'O que essa escolha exige de nós?',
  };

  // Active connected players count
  const activePlayers = Object.values(state.players).filter((p) => p.isConnected);
  const totalActive = activePlayers.filter(p => !p.isBot).length;
  const choicesSubmittedCount = Object.entries(state.individualChoiceStatus || {}).filter(([id, chosen]) => chosen && !state.players[id]?.isBot).length;
  const isSolo = activePlayers.some(p => p.isBot);

  const handleSelectAction = (actionId: string) => {
    if (!myChoice) socketService.send({ type: 'SUBMIT_INDIVIDUAL_CHOICE', actionId });
  };

  const handleProceedToReveal = () => {
    socketService.send({
      type: 'PROCEED_TO_REVEAL',
    });
  };

  const handleContinueWithoutDisconnected = () => {
    socketService.send({
      type: 'CONTINUE_WITHOUT_DISCONNECTED',
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Sua decisão
            </span>
            <span className="text-xs text-slate-400">
              {mission.title} ({mission.code})
            </span>
          </div>

          {/* Power button for current player */}
          {myPlayer && (
            <div className="flex items-center gap-2">
              <PowerButton player={myPlayer} state={state} />
              {onOpenInstitutionalGuide && (
                <button
                  onClick={onOpenInstitutionalGuide}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold transition-colors"
                >
                  Canais de Atendimento · até +5 pontos
                </button>
              )}
            </div>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
          O que você faria?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Escolha como agir. Os outros Guardiões também tomarão suas próprias decisões.
        </p>

        {state.isRaviSecondRoundActive && (
          <section className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-2" aria-label="Nova Escuta de Satori">
            <h3 className="font-bold text-amber-200">Nova Escuta — Satori</h3>
            <p data-narration="story" className="text-sm text-slate-200">“Que voz ainda não ouvimos? Que consequência merece mais atenção? Podemos reconsiderar nossa compreensão, mesmo quando a decisão já foi tomada.”</p>
            <p className="text-xs text-teal-200">{myChoice ? 'Sua decisão está confirmada e permanece registrada.' : 'Você ainda pode refletir antes de confirmar sua decisão.'}</p>
          </section>
        )}

        {/* Unlocked contexts or future preview banner if Joana or Alex used power */}
        {state.futureLooks.length > 0 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/40 text-xs text-blue-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-300">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Olhar Adiante — poder de Wa
            </div>
            {state.futureLooks.map((look, idx) => (
              <p key={idx} className="italic text-slate-300">
                • {look}
              </p>
            ))}
          </div>
        )}

        {state.unlockedContextIds.length > 0 && (
          <div className="mt-3 p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/40 text-xs text-teal-200">
            <strong className="text-teal-300 block mb-1">
              Mais Contexto — poder de Rin
            </strong>
            {mission.additionalContexts
              .filter((c) => state.unlockedContextIds.includes(c.id))
              .map((c) => (
                <p key={c.id} className="text-slate-300">
                  {c.content}
                </p>
              ))}
          </div>
        )}
      </div>

      {/* Action Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mission.actions.map((action) => {
          const isSelected = selectedChoice === action.id;
          return (
            <ActionCard
              key={action.id}
              action={action}
              isSelected={isSelected}
              onSelect={() => handleSelectAction(action.id)}
              disabled={Boolean(myChoice)}
            />
          );
        })}
      </div>

      {isSolo && myChoice && myPlayer && companionChoice && (
        <section className="rounded-2xl border border-teal-500/40 bg-teal-950/20 p-4 space-y-2" aria-label="Seu Guardião companheiro">
          <div className="flex items-center gap-3">
            <CharacterAvatar characterId={myPlayer.characterId} variantIndex={myPlayer.variantIndex} size="sm" />
            <strong className="text-teal-200 text-sm">{CHARACTERS[myPlayer.characterId].name} · seu companheiro</strong>
          </div>
          {companionDiffers ? (
            <p data-narration="story" className="text-sm text-slate-200">
              “Eu teria seguido outro caminho: {companionChoice.title.toLocaleLowerCase('pt-BR')}. {companionPrompts[myPlayer.characterId]}”
            </p>
          ) : (
            <p className="text-sm text-slate-300">Seu Guardião também seguiria esse caminho.</p>
          )}
          <p className="text-xs text-slate-400">Sua decisão permanece registrada. O Guardião oferece outro olhar, não uma correção.</p>
        </section>
      )}

      {/* Bottom status and control */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-slate-300">
          {myChoice ? (
            <span className="text-emerald-300 font-medium">
              Sua decisão foi registrada.
            </span>
          ) : (
            <span className="text-amber-300 font-medium">
              Toque em uma das alternativas para registrar sua decisão.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Host or team reveal button */}
          {(isHost || choicesSubmittedCount >= totalActive) && (
            <button
              onClick={handleProceedToReveal}
              disabled={isSolo ? !myChoice : choicesSubmittedCount === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-40"
            >
              <Eye className="w-4 h-4" />
              <span>Ver como os Guardiões decidiram</span>
            </button>
          )}

          {/* Disconnection fallback */}
          {!isSolo && choicesSubmittedCount > 0 && choicesSubmittedCount < totalActive && isHost && (
            <button
              onClick={handleContinueWithoutDisconnected}
              className="px-3 py-2 text-[11px] text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors"
              title="Permite avançar caso algum participante esteja ausente"
            >
              Avançar com quem já respondeu
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
