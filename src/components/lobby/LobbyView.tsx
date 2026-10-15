import React, { useState } from 'react';
import { CharacterId, RoomState } from '../../types/game';
import { CHARACTER_LIST, AVATAR_VARIANTS, CHARACTERS } from '../../data/characters';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { socketService } from '../../services/socket';
import { Copy, Check, Users, Play, ShieldAlert, Sparkles, BookOpen, Share2 } from 'lucide-react';

interface LobbyViewProps {
  state: RoomState;
  myPlayerId: string;
  onOpenRules?: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ state, myPlayerId, onOpenRules }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const myPlayer = state.players[myPlayerId];
  const isHost = state.hostId === myPlayerId;

  const connectedPlayers = Object.values(state.players).filter((p) => p.isConnected);
  const totalConnected = connectedPlayers.length;
  const allReady = connectedPlayers.length >= 1 && connectedPlayers.every((p) => p.isReady);

  // Bots are added when START_GAME runs, so the lobby must use the selected mode.
  const isSolo = sessionStorage.getItem('entre-nos-mode') === 'solo' || Object.values(state.players).some(p => p.isBot);
  const inviteUrl = `${window.location.origin}?room=${state.roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(state.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleToggleReady = () => {
    socketService.send({ type: 'TOGGLE_READY' });
  };

  const handleStartGame = () => {
    socketService.send({ type: 'START_GAME' });
  };

  if (isSolo) {
    return <main className="mx-auto w-full max-w-3xl space-y-5 text-slate-100">
      <header className="rounded-3xl border border-teal-500/30 bg-slate-900 p-5 sm:p-7">
        <p className="text-sm font-semibold text-teal-300">Vila dos Encontros</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-black">Conheça sua equipe</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-200">Você e três companheiros vão enfrentar quatro situações do cotidiano do serviço público. Suas escolhas abrirão caminhos para refletir sobre ética e convivência.</p>
      </header>
      <section aria-label="Companheiros da jornada" className="space-y-3">
        {CHARACTER_LIST.map(char => {
          const player = Object.values(state.players).find(p => p.characterId === char.id);
          const character = CHARACTERS[char.id];
          const me = state.players[myPlayerId]?.characterId === char.id;
          return <div key={char.id} className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <CharacterAvatar characterId={char.id} variantIndex={player?.variantIndex || 0} size="md" showBadge={false} />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold">{character.name} {me && <span className="text-sm font-normal text-teal-300">· Seu personagem</span>}</p>
              <p className="text-sm text-slate-200">{character.role}</p>
              <p className="mt-2 text-sm text-slate-300"><strong className="text-teal-300">{character.powerName}:</strong> {character.powerDescription}</p>
            </div>
          </div>;
        })}
      </section>
      <div className="flex flex-col gap-3 sm:flex-row">
        {onOpenRules && <button type="button" onClick={onOpenRules} className="rounded-xl border border-slate-600 px-5 py-3 text-base font-semibold">Como jogar</button>}
        {!myPlayer?.isReady ? <button type="button" onClick={handleToggleReady} className="min-h-12 flex-1 rounded-xl bg-teal-500 px-6 py-3 text-base font-bold text-slate-950">Estou pronto para começar</button> : <button type="button" onClick={handleStartGame} disabled={!isHost || !allReady} className="min-h-12 flex-1 rounded-xl bg-teal-500 px-6 py-3 text-base font-bold text-slate-950 disabled:opacity-50">Começar a jornada →</button>}
      </div>
    </main>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-100 animate-in fade-in">
      {/* Top Welcome & Room Invitation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {isSolo ? 'Partida com o computador' : 'Sala de Convivência Aberta'}
              </span>
              <span className="text-xs text-slate-400">
                1 a 6 participantes • modo solo disponível
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
              Vila dos Encontros • Sala de Espera
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Compartilhe o código ou o link direto com seus colegas de equipe para iniciarem a jornada ética.
            </p>
          </div>

          {/* Room Code & Copy Share button */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-teal-400 text-teal-300 font-mono font-bold text-sm transition-all shadow-md active:scale-95"
              title="Copiar código da sala"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{state.roomCode}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar Convite'}</span>
            </button>

            {onOpenRules && (
              <button
                onClick={onOpenRules}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
              >
                Regras do Jogo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Connected Players (Left) and Characters Reference (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Connected Players Roster */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                Guardiões na Sala ({totalConnected}/6)
              </h2>

              <span className="text-xs text-slate-400">
                {totalConnected < 2 ? 'Você pode jogar com o computador' : 'Prontos para começar'}
              </span>
            </div>

            {/* List of players */}
            <div className="space-y-3 flex-1">
              {Object.values(state.players).map((p) => {
                const char = CHARACTERS[p.characterId] || CHARACTERS.alex;
                const isMe = p.id === myPlayerId;

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isMe
                        ? 'bg-slate-850 border-teal-500/50 ring-1 ring-teal-500/30 shadow-md'
                        : 'bg-slate-950/70 border-slate-800'
                    } ${!p.isConnected ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <CharacterAvatar
                        characterId={p.characterId}
                        variantIndex={p.variantIndex}
                        size="md"
                        isOnline={p.isConnected}
                        isReady={p.isReady}
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          <span>{p.nickname}</span>
                          {isMe && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                              Você
                            </span>
                          )}
                          {p.isHost && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Anfitrião
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {char.name}, {char.title} • {AVATAR_VARIANTS[p.variantIndex % AVATAR_VARIANTS.length].label}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                          p.isReady
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {p.isReady ? 'Pronto ✓' : 'Aguardando'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Empty slot placeholders */}
              {Array.from({ length: Math.max(0, 6 - totalConnected) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="p-3.5 rounded-2xl border border-dashed border-slate-800 text-slate-600 flex items-center justify-center text-xs"
                >
                  Vaga disponível para guardião ({totalConnected + i + 1})
                </div>
              ))}
            </div>

            {/* Controls Bar */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleToggleReady}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all active:scale-95 ${
                  myPlayer?.isReady
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                }`}
              >
                {myPlayer?.isReady ? 'Alterar para Aguardando' : 'Marcar como Pronto ✓'}
              </button>

              {isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={!allReady}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{totalConnected === 1 ? 'Jogar com o computador' : 'Iniciar Partida'}</span>
                </button>
              )}

              {!isHost && (
                <span className="text-xs text-slate-400 italic text-center sm:text-right">
                  Aguardando o anfitrião iniciar quando todos estiverem prontos...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Characters & Powers Reference */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Os Quatro Personagens e Seus Poderes
              </h2>
              <p className="text-xs text-slate-400">
                Cada poder pode ser acionado uma vez por partida para ampliar a reflexão da equipe.
              </p>
            </div>

            <div className="space-y-3">
              {CHARACTER_LIST.map((char) => (
                <div
                  key={char.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <CharacterAvatar characterId={char.id} variantIndex={0} size="sm" showBadge={false} />
                    <div>
                      <div className="font-bold text-sm text-slate-100">
                        {char.name}, {char.title}
                      </div>
                      <div className="text-[11px] font-semibold text-teal-400">{char.role}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-serif italic pl-1">
                    {char.quote}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                    <strong className="text-amber-400">Poder “{char.powerName}”:</strong>{' '}
                    <span className="text-slate-300">{char.powerDescription}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
