import React, { useState, useEffect } from 'react';
import { CharacterId } from '../../types/game';
import { CHARACTER_LIST, CHARACTERS } from '../../data/characters';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { socketService } from '../../services/socket';
import { Play, PlusCircle, LogIn, Sparkles, BookOpen, Compass, HelpCircle } from 'lucide-react';

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
  const [mode, setMode] = useState<'create' | 'join' | 'solo'>('solo');
  const [nickname, setNickname] = useState(
    localStorage.getItem('guardioes_nickname') || ''
  );
  const [characterId, setCharacterId] = useState<CharacterId>(
    (localStorage.getItem('guardioes_character') as any) || 'alex'
  );
  const variantIndex = 0;
  const [roomCode, setRoomCode] = useState('');

  // Check URL query params for ?room=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('room');
    if (codeFromUrl) {
      setRoomCode(codeFromUrl.toUpperCase());
      setMode('join');
    }
  }, []);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = nickname.trim() || 'Guardião';
    localStorage.setItem('guardioes_nickname', cleanNick);
    localStorage.setItem('guardioes_character', characterId);

    socketService.setSoloMode(mode === 'solo');
    socketService.send({
      type: 'CREATE_ROOM',
      nickname: cleanNick,
      characterId,
      variantIndex,
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = nickname.trim() || 'Guardião';
    socketService.setSoloMode(false);
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) return;

    localStorage.setItem('guardioes_nickname', cleanNick);
    localStorage.setItem('guardioes_character', characterId);
    localStorage.setItem('guardioes_variant', String(variantIndex));

    socketService.send({
      type: 'JOIN_ROOM',
      roomCode: cleanCode,
      nickname: cleanNick,
      characterId,
      variantIndex,
    });
  };

  const selectedChar = CHARACTERS[characterId];

  return (
    <div className="flex flex-col items-center justify-start min-h-0 py-3 sm:py-8 px-0 sm:px-4 text-slate-100 max-w-4xl mx-auto w-full mobile-welcome">
      {/* Hero presentation */}
      <div className="text-center w-full min-w-0 max-w-2xl mx-auto mb-3 mobile-welcome-hero sm:mb-8 space-y-2 sm:space-y-3">
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm font-bold uppercase tracking-wide">
          <Compass className="w-3.5 h-3.5" />
          Jogo Sério Cooperativo de Ética Pública
        </div>

        <h1 className="text-2xl sm:text-5xl font-black tracking-tight text-slate-100 break-words">
          Entre Nós
          <span className="block text-lg sm:text-3xl font-bold text-amber-400 mt-1 break-words">
            Guardiões da Convivência
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Na <strong>Vila dos Encontros</strong>, suas escolhas revelam diferentes caminhos para a convivência ética.
        </p>
      </div>

      {/* Main interaction card */}
      <div className="w-full min-w-0 bg-slate-900 border border-slate-800 rounded-3xl mobile-welcome-card p-3 sm:p-8 shadow-2xl space-y-3 sm:space-y-6">
        {/* O multiplayer permanece no código para uma etapa futura. */}
        {false && <div>
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              mode === 'create'
                ? 'bg-teal-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Nova Sala</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('join')}
            className={`py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              mode === 'join'
                ? 'bg-teal-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar em Sala Existente</span>
          </button>
        </div>

        </div>}
        <form onSubmit={mode !== 'join' ? handleCreateRoom : handleJoinRoom} className="space-y-3 sm:space-y-5">
          {/* Room Code input (if joining) */}
          {mode === 'join' && (
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                Código da Sala (Ex: VILA-7K4):
              </label>
              <input
                type="text"
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Ex: VILA-XXXX"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono font-bold tracking-widest text-base focus:outline-none focus:ring-2 focus:ring-teal-400 uppercase"
              />
            </div>
          )}

          {/* Nickname input (no real name required) */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className="text-sm font-bold text-slate-300">
                Seu Apelido na Sessão:
              </label>
              <span className="text-xs text-slate-400">Não exige nome real</span>
            </div>
            <input
              type="text"
              maxLength={16}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: Guardião Alex, Carol, Lucas..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          {/* Character selection cards */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-300">
                Escolha seu Personagem:
              </label>

            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {CHARACTER_LIST.map((char) => {
                const isSelected = characterId === char.id;
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setCharacterId(char.id)}
                    className={`mobile-character-card p-2 sm:p-3 min-h-28 sm:min-h-32 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      isSelected
                        ? 'bg-teal-950/70 border-teal-400 ring-2 ring-teal-400/40 text-white shadow-md'
                        : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-300'
                    }`}
                  >
                    <CharacterAvatar characterId={char.id} variantIndex={variantIndex} size="md" showBadge={false} />
                    <div className="font-bold text-base">{char.name}</div>
                    <div className="text-sm text-slate-300 leading-snug">{char.title}</div>
                  </button>
                );
              })}
            </div>

            {/* Character power info preview */}
            {selectedChar && (
              <div className="hidden sm:flex p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-300 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-100">
                    Poder Único: “{selectedChar.powerName}”
                  </div>
                  <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                    {selectedChar.powerDescription} (Uso único por partida)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full min-h-14 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{mode === 'solo' ? 'Começar' : mode === 'create' ? 'Criar e Entrar na Sala' : 'Entrar na Sala'}</span>
          </button>
        </form>

        {/* Informational quick links */}
        <div className="pt-2 sm:pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-300">
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
            className="hidden sm:flex hover:text-indigo-300 transition-colors items-center gap-1.5"
          >
            <span>Painel do Organizador</span>
          </button>
        </div>
      </div>
    </div>
  );
};
