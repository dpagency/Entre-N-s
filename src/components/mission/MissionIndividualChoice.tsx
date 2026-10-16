import React, { useState } from 'react';
import { MissionDef, SanitizedRoomState } from '../../types/game';
import { ActionCard } from '../cards/CardView';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { PowerButton } from '../characters/PowerButton';
import { socketService } from '../../services/socket';
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
  const [pendingChoice, setPendingChoice] = useState<string | null>(null);
  const selectedChoice = myChoice || pendingChoice;

  // Active connected players count
  const activePlayers = Object.values(state.players).filter((p) => p.isConnected);
  const totalActive = activePlayers.filter(p => !p.isBot).length;
  const choicesSubmittedCount = Object.entries(state.individualChoiceStatus || {}).filter(([id, chosen]) => chosen && !state.players[id]?.isBot).length;
  const isSolo = activePlayers.some(p => p.isBot);

  const handleSelectAction = (actionId: string) => {
    if (!myChoice) setPendingChoice(actionId);
  };

  const handleConfirmChoice = () => {
    if (!pendingChoice || myChoice) return;
    socketService.send({ type: 'SUBMIT_INDIVIDUAL_CHOICE', actionId: pendingChoice });
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
                  Consultar Canais
                </button>
              )}
            </div>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
          Como você atuaria diante desta situação?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Escolha como deseja agir. Selecione uma alternativa e confirme sua decisão. Depois de confirmada, ela não poderá ser alterada nesta partida.
        </p>

        {state.sharedPerspectiveIds.length > 0 && (
          <section className="mt-4 p-4 rounded-2xl border border-amber-500/40 bg-amber-950/20 space-y-3" aria-label="Perspectivas reveladas">
            <h3 className="font-bold text-lg text-amber-200">Perspectivas reveladas</h3>
            <p className="text-sm text-slate-300">Estas informações ajudam a refletir; não alteram sua decisão automaticamente.</p>
            {mission.perspectives.filter(p => state.sharedPerspectiveIds.includes(p.id)).map(p => (
              <div key={p.id} className="rounded-xl bg-slate-950/70 p-3 border border-slate-700">
                <strong className="text-teal-200">{p.actorName} — {p.actorRole}</strong>
                <p className="mt-1 text-sm leading-relaxed text-slate-200">{p.details}</p>
              </div>
            ))}
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

      {/* Confirm the human player\u0027s selected action before showing guardian perspectives. */}
      {selectedChoice && (() => {
        const selected = mission.actions.find(action => action.id === selectedChoice);
        if (!selected) return null;
        return <section aria-live="polite" className="rounded-2xl border-2 border-emerald-400 bg-emerald-950/30 p-4 sm:p-5 space-y-2">
          <h3 className="text-base font-bold text-emerald-200">{myChoice ? 'Decisão confirmada nesta missão' : 'Sua decisão antes da confirmação'}</h3>
          <p className="font-semibold text-slate-100">{selected.title}</p>
          <p className="text-sm text-slate-200">{selected.description}</p>
          <p className="text-xs text-emerald-200">{myChoice ? 'Sua escolha está registrada e não pode ser alterada nesta partida.' : 'Confira sua escolha. Ao confirmar, você seguirá com as consequências dessa decisão.'}</p>
        </section>;
      })()}

      {/* Bottom status and control */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-slate-300">
          {myChoice ? (
            <span className="text-emerald-300 font-medium">
              Sua decisão está confirmada. Agora conheça outros olhares, sem alterar o caminho escolhido.
            </span>
          ) : (
            <span className="text-amber-300 font-medium">
              {pendingChoice ? 'Confira a alternativa selecionada e confirme sua decisão.' : 'Selecione uma das cartas para considerar seu posicionamento.'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!myChoice && pendingChoice && (
            <button onClick={handleConfirmChoice} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm">
              Confirmar decisão definitiva
            </button>
          )}
          {/* Host or team reveal button */}
          {(isHost || choicesSubmittedCount >= totalActive) && (
            <button
              onClick={handleProceedToReveal}
              disabled={isSolo ? !myChoice : choicesSubmittedCount === 0}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-40"
            >
              <Eye className="w-4 h-4" />
              <span>Conhecer as perspectivas dos Guardiões</span>
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
