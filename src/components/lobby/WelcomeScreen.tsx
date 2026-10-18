import React, { useState, useEffect } from 'react';
import { CharacterId } from '../../types/game';
import { CHARACTER_LIST, AVATAR_VARIANTS, CHARACTERS } from '../../data/characters';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { socketService } from '../../services/socket';
import { Play, Sparkles, BookOpen, Compass, HelpCircle } from 'lucide-react';

interface WelcomeScreenProps {
  onOpenRules: () => void;
  onOpenInstitutionalGuide: () => void;
  onOpenOrganizer: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onOpenRules,
  onOpenInstitutionalGuide,
  onOpenOrganizer,
}) => {
  const [starting, setStarting] = useState(false);
  const [nickname, setNickname] = useState(
    localStorage.getItem('guardioes_nickname') || ''
  );
  const [characterId, setCharacterId] = useState<CharacterId>(
    (localStorage.getItem('guardioes_character') as any) || 'alex'
  );
  const [variantIndex, setVariantIndex] = useState(
    Number(localStorage.getItem('guardioes_variant')) || 0
  );
  const [previewCharacter, setPreviewCharacter] = useState<CharacterId | null>(null);

  const handleStartJourney = (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);
    window.setTimeout(() => setStarting(false), 4500);
    const cleanNick = nickname.trim() || 'Jogador';
    localStorage.setItem('guardioes_nickname', cleanNick);
    localStorage.setItem('guardioes_character', characterId);
    localStorage.setItem('guardioes_variant', String(variantIndex));

    socketService.setSoloMode(true);
    socketService.send({
      type: 'CREATE_ROOM',
      nickname: cleanNick,
      characterId,
      variantIndex,
    });
  };

  const selectedChar = CHARACTERS[characterId];
  const [characterConfirmed, setCharacterConfirmed] = useState(false);
  const confirmCharacter = (id: CharacterId) => {
    setCharacterId(id);
    localStorage.setItem('guardioes_character', id);
    setCharacterConfirmed(true);
    setPreviewCharacter(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-0 py-2 sm:py-4 px-2 text-slate-100 max-w-5xl mx-auto w-full game-welcome">
      {/* Hero presentation */}
      <div className="text-center max-w-2xl mx-auto mb-3 space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          Jogo Sério Cooperativo de Ética Pública
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-100">
          Entre Nós
          <span className="block text-base sm:text-2xl font-bold text-amber-400 mt-1">
            Guardiões da Convivência
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif">
          Na <strong>Vila dos Encontros</strong>, cada escolha abre caminhos para refletir sobre a convivência ética.
        </p>
      </div>

      {/* Main interaction card */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-5 shadow-2xl space-y-3">
        <p className="rounded-xl bg-teal-950/50 border border-teal-500/30 p-3 text-sm text-teal-200">Você participa como você mesmo. Escolha um Guardião para acompanhar suas decisões; os outros três oferecerão perspectivas diferentes ao longo da jornada.</p>
        <form onSubmit={handleStartJourney} className="space-y-2">
          {/* Nickname input (no real name required) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Seu Apelido na Sessão:
              </label>
              <span className="text-[11px] text-slate-500">Não exige nome real</span>
            </div>
            <input
              type="text"
              maxLength={16}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex.: Lua, Sol, Visitante..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          {/* Character selection cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Escolha seu Guardião acompanhante:
              </label>
              <span className="text-[11px] text-teal-400">Quatro caminhos de reflexão</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CHARACTER_LIST.map((char) => {
                const isSelected = characterId === char.id;
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setPreviewCharacter(char.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      isSelected
                        ? 'bg-teal-950/70 border-teal-400 ring-2 ring-teal-400/40 text-white shadow-md'
                        : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-300'
                    }`}
                  >
                    <CharacterAvatar characterId={char.id} variantIndex={variantIndex} size="sm" showBadge={false} />
                    <div className="font-bold text-xs sm:text-sm">{char.name}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{char.title}</div>
                  </button>
                );
              })}
            </div>

            <div role="status" aria-live="polite" className="rounded-xl border border-teal-500/40 bg-teal-950/40 px-4 py-3 text-sm text-teal-200">
              {characterConfirmed ? '✓ Seu Guardião acompanhante: ' : 'Guardião em destaque: '}
              <strong>{selectedChar.name}</strong>. {characterConfirmed ? 'Ele acompanhará você, mas as decisões serão sempre suas.' : 'Toque em um Guardião para conhecê-lo e confirmar quem acompanhará você.'}
            </div>

            {/* Character power info preview */}
            {selectedChar && (
              <div className="hidden sm:flex p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-100">
                    Poder Único: “{selectedChar.powerName}”
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {selectedChar.powerDescription} (Uso único por partida)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Visual Variant Selector */}
          <div className="hidden sm:block space-y-2">
            <label className="text-xs font-bold text-slate-300">
              Aparência do Guardião acompanhante:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_VARIANTS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantIndex(v.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                    variantIndex === v.id
                      ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${v.badgeColor}`} />
                  <span>{v.label} ({v.suffix})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={starting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{starting ? 'Preparando sua jornada…' : 'Começar minha jornada'}</span>
          </button>
        </form>

        <p className="text-xs text-slate-400 leading-relaxed text-center">Seu progresso é preservado ao atualizar esta página na mesma sessão do navegador. Para evitar perder a jornada, não feche a aba antes de concluir as quatro missões. Não há sincronização entre aparelhos.</p>

        {/* Informational quick links */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <button
            type="button"
            onClick={onOpenRules}
            className="hover:text-teal-300 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Como Jogar</span>
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenInstitutionalGuide}
            className="hover:text-teal-300 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guia de Canais Éticos</span>
          </button>
          <span className="hidden sm:inline">•</span>
          <button
            type="button"
            onClick={onOpenOrganizer}
            className="hover:text-indigo-300 transition-colors flex items-center gap-1.5"
          >
            <span>Painel do Organizador</span>
          </button>
        </div>
      </div>
      {previewCharacter && (
        <div className="fixed inset-0 z-[80] bg-slate-950/85 flex items-center justify-center p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setPreviewCharacter(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="persona-title" className="w-full max-w-md rounded-3xl border border-teal-500/50 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-4">
                <CharacterAvatar characterId={previewCharacter} variantIndex={variantIndex} size="lg" showBadge={false} />
                <div><h2 id="persona-title" className="text-2xl font-black">{CHARACTERS[previewCharacter].name}</h2><p className="text-teal-300">{CHARACTERS[previewCharacter].title}</p></div>
              </div>
              <button type="button" aria-label="Fechar apresentação" onClick={() => setPreviewCharacter(null)} className="text-slate-300 hover:text-white text-2xl">×</button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{CHARACTERS[previewCharacter].description}</p>
            <p className="italic text-amber-200 text-sm">{CHARACTERS[previewCharacter].quote}</p>
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 space-y-2 text-sm">
              <p className="font-bold text-teal-300">Perspectiva: {CHARACTERS[previewCharacter].role}</p>
              <p className="font-bold text-amber-300">Habilidade: {CHARACTERS[previewCharacter].powerName}</p>
              <p className="text-slate-300">{CHARACTERS[previewCharacter].powerDescription}</p>
              <p className="text-xs text-slate-400">A persona amplia o olhar, mas não determina a resposta ética.</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setPreviewCharacter(null)} className="flex-1 rounded-xl border border-slate-600 p-3">Voltar</button>
              <button type="button" autoFocus onClick={() => confirmCharacter(previewCharacter)} className="flex-1 rounded-xl bg-teal-400 text-slate-950 font-bold p-3">Escolher personagem</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
