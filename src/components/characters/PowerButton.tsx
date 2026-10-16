import React, { useState } from 'react';
import { CharacterId, PlayerSession, RoomState, SanitizedRoomState } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import { socketService } from '../../services/socket';
import { Zap, AlertCircle, Check, Info } from 'lucide-react';

interface PowerButtonProps {
  player: PlayerSession;
  state: SanitizedRoomState | RoomState;
  disabled?: boolean;
}

export const PowerButton: React.FC<PowerButtonProps> = ({ player, state, disabled }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const char = CHARACTERS[player.characterId] || CHARACTERS.alex;
  const hasUsed = player.hasUsedPower;

  const handleUsePower = () => {
    socketService.send({
      type: 'USE_POWER',
      powerType: player.characterId,
    });
    setShowConfirm(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => !hasUsed && !disabled && setShowConfirm(true)}
          disabled={hasUsed || disabled}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md border ${
            hasUsed
              ? 'bg-slate-800 text-slate-500 border-slate-700/60 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-300 active:scale-95'
          }`}
          title={hasUsed ? 'O poder do seu Guardião já foi utilizado nesta partida' : `Pedir ajuda a ${char.name}: ${char.powerName}`}
        >
          <Zap className={`w-4 h-4 ${hasUsed ? 'text-slate-500' : 'text-slate-950 fill-current'}`} />
          <span>
            {hasUsed ? 'Poder Utilizado' : `Ajuda de ${char.name}: ${char.powerName}`}
          </span>
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative w-full max-w-md max-h-[85dvh] overflow-y-auto bg-slate-900 border border-amber-500/50 rounded-3xl p-5 sm:p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Uso Único por Partida
                </span>
                <h3 className="text-lg font-black text-slate-100">
                  Pedir a {char.name} para usar “{char.powerName}”?
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-4 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              {char.powerDescription}
            </p>

            <div className="flex items-start gap-2 text-xs text-amber-200/90 bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl mb-6">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                O Guardião que acompanha você pode usar este poder <strong>uma única vez durante toda a jornada</strong>. Ele oferece elementos para reflexão, sem escolher por você. <strong>Uma decisão já confirmada não poderá ser alterada</strong>, mesmo após usar o poder.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Guardar para Depois
              </button>
              <button
                onClick={handleUsePower}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg transition-transform active:scale-95"
              >
                Pedir ajuda ao Guardião
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
