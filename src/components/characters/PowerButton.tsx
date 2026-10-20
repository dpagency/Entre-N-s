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
  const [showAdvice, setShowAdvice] = useState(false);
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
          onClick={() => hasUsed ? setShowAdvice(true) : !disabled && setShowConfirm(true)}
          disabled={!hasUsed && disabled}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md border ${
            hasUsed
              ? 'bg-slate-800 text-slate-500 border-slate-700/60 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-300 active:scale-95'
          }`}
          title={hasUsed ? 'Rever a orientação do Guardião sem gastar outro poder' : `Pedir ajuda a ${char.name}: ${char.powerName}`}
        >
          <Zap className={`w-4 h-4 ${hasUsed ? 'text-slate-500' : 'text-slate-950 fill-current'}`} />
          <span>
            {hasUsed ? `Reler orientação de ${char.name}` : `Ajuda de ${char.name}: ${char.powerName}`}
          </span>
        </button>
      </div>

      {showAdvice && hasUsed && (
        <div role="dialog" aria-modal="true" aria-label="Orientação do Guardião" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85">
          <div className="w-full max-w-md max-h-[85dvh] overflow-y-auto rounded-3xl border border-amber-500/50 bg-slate-900 p-5 space-y-4 text-slate-100">
            <h3 className="text-lg font-black text-amber-200">Orientação de {char.name}</h3>
            <p className="text-sm leading-relaxed">{char.powerDescription}</p>
            {player.characterId === 'alex' && <div className="space-y-2">{state.unlockedContextIds.length ? <p className="text-sm">O Guardião ajudou a revelar mais contexto. Consulte também a seção “Mais Contexto” desta missão.</p> : <p className="text-sm">Considere que pode haver informações importantes ainda não exploradas.</p>}</div>}
            {player.characterId === 'joana' && <div className="space-y-2">{state.futureLooks.length ? state.futureLooks.map((look, index) => <p key={index} className="text-sm leading-relaxed">{look}</p>) : <p className="text-sm">Reflita sobre as possíveis consequências de cada caminho.</p>}</div>}
            {player.characterId === 'ravi' && <p className="text-sm leading-relaxed">Que voz ainda não ouvimos? Que consequência merece mais atenção? Sua decisão original permanece preservada.</p>}
            {player.characterId === 'bia' && <p className="text-sm leading-relaxed">Que perspectiva ainda não foi considerada? Releia as vozes dos envolvidos antes de seguir.</p>}
            <p className="text-xs text-slate-400">Você pode reler esta orientação quantas vezes quiser. O poder continua sendo de uso único.</p>
            <button type="button" onClick={() => setShowAdvice(false)} className="w-full rounded-xl bg-amber-400 p-3 font-bold text-slate-950">Terminei de ler</button>
          </div>
        </div>
      )}
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
