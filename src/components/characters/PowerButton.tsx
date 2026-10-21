import React, { useState } from 'react';
import { PlayerSession, RoomState, SanitizedRoomState } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
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
  const [awarded, setAwarded] = useState(false);

  const consult = () => {
    setAwarded(recordLearning(socketService.roomCode, state.activeMissionId ?? null, 'guardian'));
    setShowAdvice(true);
  };

  return (
    <>
      <button type="button" onClick={consult} className="px-3 py-2 rounded-xl border border-teal-500/50 bg-teal-950/60 text-teal-200 text-xs font-bold">
        Consultar {char.name} · +5 pontos
      </button>
      {showAdvice && (
        <div role="dialog" aria-modal="true" aria-label="Orientação do Guardião" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85">
          <div className="w-full max-w-md max-h-[85dvh] overflow-y-auto rounded-3xl border border-amber-500/50 bg-slate-900 p-5 space-y-4 text-slate-100">
            <h3 className="text-lg font-black text-amber-200">Orientação de {char.name}</h3>
            <p className="text-sm leading-relaxed">{char.powerDescription}</p>
            {player.characterId === 'alex' && <p className="text-sm">Considere que pode haver informações importantes ainda não exploradas.</p>}
            {player.characterId === 'joana' && <p className="text-sm">Reflita sobre as possíveis consequências de cada caminho.</p>}
            {player.characterId === 'ravi' && <p className="text-sm">Que voz ainda não ouvimos? Que consequência merece mais atenção? Sua decisão permanece sua.</p>}
            {player.characterId === 'bia' && <p className="text-sm">Que perspectiva ainda não foi considerada? Releia as vozes dos envolvidos antes de seguir.</p>}
            <p role="status" className="font-bold text-teal-200">{awarded ? '+5 pontos' : 'Orientação disponível para releitura'}</p>
            <button type="button" onClick={() => setShowAdvice(false)} className="w-full rounded-xl bg-amber-400 p-3 font-bold text-slate-950">Continuar</button>
          </div>
        </div>
      )}
    </>
  );
};
