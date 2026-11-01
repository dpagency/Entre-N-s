import { JourneyOpening } from './JourneyOpening';
import { ORIGINAL_JOURNEY_ID, journeyDefinition } from '../../data/journeys';
import { assetUrl } from '../../distribution';
import { PLAYER_AVATARS } from '../../data/pilot';
import { browserStorage } from '../../services/browserStorage';
import React, { useEffect, useRef, useState } from 'react';
import { socketService } from '../../services/socket';
import { Play } from 'lucide-react';

export const WelcomeScreen = ({ journeyDefinitionId = ORIGINAL_JOURNEY_ID, onBack }: { journeyDefinitionId?: string; onBack?: () => void }) => {
  const journey = journeyDefinition(journeyDefinitionId);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { title.current?.focus(); }, []);
  const [openingDone, setOpeningDone] = useState(!journey.presentation?.opening);
  const [starting, setStarting] = useState(false);
  const [nickname, setNickname] = useState(
    browserStorage.getItem('guardioes_nickname') || ''
  );
  const [variantIndex, setVariantIndex] = useState(
    Number(browserStorage.getItem('guardioes_variant')) || 0
  );
  const [previewAvatar, setPreviewAvatar] = useState<number | null>(null);
  const playerAvatars = PLAYER_AVATARS;

  const handleStartJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (starting) return;
    setStarting(true);
    try { await socketService.startNewJourney(journey.id, { nickname: nickname.trim() || 'Jogador', variantIndex }); }
    catch { setStarting(false); }
  };


  if (!openingDone) return <JourneyOpening journey={journey} onContinue={() => setOpeningDone(true)} onBack={onBack} />;

  return (
    <div className="flex flex-col items-center justify-center min-h-0 py-2 sm:py-4 text-slate-100 mx-auto w-full game-welcome">
      {onBack && <button type="button" disabled={starting} onClick={onBack} className="mb-4 min-h-12 rounded-xl border border-teal-400 px-5 py-3 font-bold text-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Voltar às jornadas</button>}
      {/* Hero presentation */}
      <div className="text-center max-w-3xl mx-auto mb-3 space-y-1">
        <h1 ref={title} tabIndex={-1} className="text-2xl sm:text-4xl font-black tracking-tight text-slate-100 focus:outline-none">
          {journey.id === ORIGINAL_JOURNEY_ID ? 'Cidade dos Encontros' : journey.title}
          <span className="block text-base sm:text-2xl font-bold text-amber-400 mt-1">
            Guardiões da Integridade
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Na <strong>Cidade dos Encontros</strong>, cada escolha abre caminhos para refletir sobre a convivência ética.
        </p>
      </div>


      {/* Main interaction card */}
      <div className={`w-full bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-5 lg:p-6 shadow-2xl space-y-5 `}>
        <p className="text-base sm:text-lg leading-relaxed text-slate-200">Escolha seu avatar para iniciar. Os quatro Guardiões da Integridade apresentarão desafios ao longo da jornada.</p>
        <form onSubmit={handleStartJourney} className="space-y-6 sm:space-y-8">
          {/* Nickname input (no real name required) */}
          <div className="w-full sm:max-w-md space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="player-nickname" className="text-lg font-bold text-slate-300">
                Seu Apelido na Sessão:
              </label>
              <span className="text-sm text-slate-500">Não exige nome real</span>
            </div>
            <input
              id="player-nickname"
              type="text"
              maxLength={16}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex.: Lua, Sol, Visitante..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:gap-10">
            {/* Player avatar selection: independent from Guardian choice */}
            <div className="min-w-0 space-y-3">
              <p className="text-lg sm:text-xl font-bold text-slate-300">Escolha seu avatar:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {playerAvatars.map((avatar, index) => (
                  <button key={avatar.name} type="button" onClick={() => setPreviewAvatar(index)} aria-label={`Conhecer avatar ${avatar.name}`} aria-pressed={variantIndex === index}
                    className={`min-w-0 flex flex-col items-stretch gap-3 rounded-2xl border p-2 sm:p-4 text-center transition-all ${variantIndex === index ? 'border-teal-400 ring-2 ring-teal-400/40 bg-teal-950/70' : 'border-slate-700 bg-slate-950'}`}>
                    <div className="flex w-full justify-center">
                      <img src={assetUrl(avatar.image)} alt={avatar.name} className="welcome-selection-portrait rounded-full object-cover border-2 border-teal-300/60" />
                    </div>
                    <span className="w-full text-center text-base sm:text-lg font-bold text-slate-200">{avatar.name}</span>
                  </button>
                ))}
              </div>
            </div>


          </div>

          {/* Submit button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={starting}
              className="min-h-16 max-w-full px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-base sm:text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{starting ? 'Preparando…' : 'Começar'}</span>
            </button>
          </div>
        </form>

      </div>
      {previewAvatar !== null && (
        <div className="fixed inset-0 z-[80] bg-slate-950/85 flex items-center justify-center p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setPreviewAvatar(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="avatar-preview-title" className="w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-3xl border border-teal-500/50 bg-slate-900 p-5 text-center space-y-4 shadow-2xl">
            <img src={assetUrl(playerAvatars[previewAvatar].body)} alt={playerAvatars[previewAvatar].name} className="mx-auto w-full max-w-[230px] h-64 rounded-2xl object-contain bg-slate-950" onError={(event) => { event.currentTarget.src = assetUrl(playerAvatars[previewAvatar].image); }} />
            <h2 id="avatar-preview-title" className="text-xl font-black">{playerAvatars[previewAvatar].name}</h2>

            <p className="text-sm text-slate-400">Seu avatar representa você, mas não determina suas decisões durante a jornada.</p>
            <div className="flex gap-3"><button type="button" onClick={() => setPreviewAvatar(null)} className="flex-1 rounded-xl border border-slate-600 p-3">Voltar</button><button type="button" onClick={() => { setVariantIndex(previewAvatar); browserStorage.setItem('guardioes_variant', String(previewAvatar)); setPreviewAvatar(null); }} className="flex-1 rounded-xl bg-teal-400 text-slate-950 font-bold p-3">Escolher avatar</button></div>
          </section>
        </div>
      )}

    </div>
  );
};
