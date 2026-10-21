import React, { useState } from 'react';
import { PlayerSession, RoomState, SanitizedRoomState } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import { MISSIONS } from '../../data/missions';
import { socketService } from '../../services/socket';
import { recordLearning } from '../../services/learningScore';

interface PowerButtonProps {
  player: PlayerSession;
  state: SanitizedRoomState | RoomState;
  disabled?: boolean;
}

export const PowerButton: React.FC<PowerButtonProps> = ({ player, state }) => {
  const [showAdvice, setShowAdvice] = useState(false);
  const char = CHARACTERS[player.characterId] || CHARACTERS.alex;
  const mission = MISSIONS.find(item => item.id === state.activeMissionId);
  const perspectives = mission?.perspectives ?? [];
  // Stable within a journey, but varies across journeys and guardians.
  const selectionKey = `${state.roomCode}:${mission?.id ?? ''}:${player.characterId}`;
  const selectionHash = Array.from(selectionKey).reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 7);
  const perspective = perspectives.length ? perspectives[selectionHash % perspectives.length] : undefined;
  const guidance = perspective
    ? perspective.details || perspective.summary
    : mission?.situation.uncertainties?.[0] ?? 'Que perspectivas merecem atenção antes da sua decisão?';

  const consult = () => {
    recordLearning(socketService.roomCode, state.activeMissionId ?? null, 'guardian');
    setShowAdvice(true);
  };

  return (
    <>
      <button type="button" onClick={consult} className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold shadow-md transition-colors">
        Consultar {char.name} · +5 pontos
      </button>
      {showAdvice && (
        <div role="dialog" aria-modal="true" aria-label="Orientação do Guardião" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85">
          <div className="w-full max-w-md max-h-[85dvh] overflow-y-auto rounded-3xl border border-amber-500/50 bg-slate-900 p-5 space-y-4 text-slate-100">
            <h3 className="text-lg font-black text-amber-200">Uma reflexão de {char.name}</h3>
            {perspective && <p className="text-sm font-semibold text-teal-200">Lembre-se do que {perspective.actorName} disse:</p>}
            <p className="text-sm leading-relaxed">{guidance}</p>
            <div className="flex justify-end">
              <button type="button" onClick={() => setShowAdvice(false)} className="rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2 text-sm font-bold text-slate-950">
                Voltar à decisão
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
