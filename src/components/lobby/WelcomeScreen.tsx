import React, { useState } from 'react';
import { CharacterId } from '../../types/game';
import { CHARACTER_LIST, CHARACTERS } from '../../data/characters';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { socketService } from '../../services/socket';
import { Play } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const [starting, setStarting] = useState(false);
  const [savedJourney, setSavedJourney] = useState(() => socketService.hasSavedJourney());
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
  const [previewAvatar, setPreviewAvatar] = useState<number | null>(null);
  const playerAvatars = [
    { name: 'Exploradora', image: '/personagens/avatar_exploradora.png', body: '/personagens/avatar_exploradora_corpo.png', description: 'Curiosidade e abertura para descobrir novos caminhos.' },
    { name: 'Observador', image: '/personagens/avatar_observador.png', body: '/personagens/avatar_observador_corpo.png', description: 'Atenção aos detalhes e disposição para observar.' },
    { name: 'Construtora', image: '/personagens/avatar_construtora.png', body: '/personagens/avatar_construtora_corpo.png', description: 'Colaboração e criatividade para construir possibilidades.' },
    { name: 'Estrategista', image: '/personagens/avatar_estrategista.png', body: '/personagens/avatar_estrategista_corpo.png', description: 'Um olhar criativo e independente para explorar diferentes possibilidades.' },
  ];

  const handleStartJourney = (e: React.FormEvent) => {
    e.preventDefault();
    socketService.discardSavedJourney();
    setSavedJourney(false);
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
    <div className="flex flex-col items-center justify-center min-h-0 py-2 sm:py-4 text-slate-100 mx-auto w-full game-welcome">
      {/* Hero presentation */}
      <div className="text-center max-w-3xl mx-auto mb-3 space-y-1">
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-100">
          Entre Nós
          <span className="block text-base sm:text-2xl font-bold text-amber-400 mt-1">
            Guardiões da Convivência
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Na <strong>Cidade dos Encontros</strong>, cada escolha abre caminhos para refletir sobre a convivência ética.
        </p>
      </div>

      {savedJourney && (
        <section className="w-full rounded-2xl border border-amber-400/60 bg-amber-950/25 p-4 space-y-3" aria-label="Jornada salva">
          <h2 className="text-lg font-bold text-amber-200">Você tem uma jornada em andamento</h2>
          <p className="text-sm text-slate-200">Quer continuar de onde parou ou começar uma nova jornada?</p>
          <button type="button" onClick={() => socketService.resumeSavedJourney()} className="w-full rounded-xl bg-teal-400 text-slate-950 font-bold p-3">Continuar minha jornada</button>
          <button type="button" onClick={() => { if (window.confirm('Começar uma nova jornada? O progresso salvo neste endereço será substituído.')) { socketService.discardSavedJourney(); setSavedJourney(false); } }} className="w-full rounded-xl border border-slate-500 p-3 text-slate-100">Começar nova jornada</button>
        </section>
      )}
      {/* Main interaction card */}
      <div className={`w-full bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-5 lg:p-6 shadow-2xl space-y-5 ${savedJourney ? "opacity-50 pointer-events-none" : ""}`}>
        <p className="text-base sm:text-lg leading-relaxed text-slate-200">Escolha seu avatar e seu Guardião para iniciar a jornada.</p>
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
                      <img src={avatar.image} alt={avatar.name} className="welcome-selection-portrait rounded-full object-cover border-2 border-teal-300/60" />
                    </div>
                    <span className="w-full text-center text-base sm:text-lg font-bold text-slate-200">{avatar.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Character selection cards */}
            <div className="min-w-0 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-lg sm:text-xl font-bold text-slate-300">Escolha seu Guardião acompanhante:</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {CHARACTER_LIST.map((char) => {
                  const isSelected = characterId === char.id;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setPreviewCharacter(char.id)}
                      className={`min-w-0 p-2 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-stretch gap-3 ${
                        isSelected
                          ? 'bg-teal-950/70 border-teal-400 ring-2 ring-teal-400/40 text-white shadow-md'
                          : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex w-full justify-center">
                        <CharacterAvatar characterId={char.id} variantIndex={variantIndex} size="lg" showBadge={false} className="welcome-selection-guardian" />
                      </div>
                      <div className="w-full text-center font-bold text-base sm:text-lg">{char.name}</div>

                    </button>
                  );
                })}
              </div>

              <div role="status" aria-live="polite" className="rounded-xl border border-teal-500/40 bg-teal-950/40 px-4 py-3 text-base sm:text-lg leading-relaxed text-teal-200">
                {characterConfirmed ? '✓ Seu Guardião acompanhante: ' : 'Guardião em destaque: '}
                <strong>{selectedChar.name}</strong>. As decisões serão sempre suas.
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
            <img src={playerAvatars[previewAvatar].body} alt={playerAvatars[previewAvatar].name} className="mx-auto w-full max-w-[230px] h-64 rounded-2xl object-contain bg-slate-950" onError={(event) => { event.currentTarget.src = playerAvatars[previewAvatar].image; }} />
            <h2 id="avatar-preview-title" className="text-xl font-black">{playerAvatars[previewAvatar].name}</h2>
            <p className="text-sm text-slate-300">{playerAvatars[previewAvatar].description}</p>
            <p className="text-sm text-slate-400">Seu avatar representa você, mas não determina suas decisões durante a jornada.</p>
            <div className="flex gap-3"><button type="button" onClick={() => setPreviewAvatar(null)} className="flex-1 rounded-xl border border-slate-600 p-3">Voltar</button><button type="button" onClick={() => { setVariantIndex(previewAvatar); localStorage.setItem('guardioes_variant', String(previewAvatar)); setPreviewAvatar(null); }} className="flex-1 rounded-xl bg-teal-400 text-slate-950 font-bold p-3">Escolher avatar</button></div>
          </section>
        </div>
      )}
      {previewCharacter && (
        <div className="fixed inset-0 z-[80] bg-slate-950/85 flex items-center justify-center p-4" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setPreviewCharacter(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="persona-title" className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-3xl border border-teal-500/50 bg-slate-900 p-4 sm:p-6 shadow-2xl space-y-3 sm:space-y-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img src={`/personagens/${({alex:"rin",joana:"wa",ravi:"satori",bia:"yuki"} as Record<string,string>)[previewCharacter]}_corpo.png`} alt={CHARACTERS[previewCharacter].name} className="w-36 h-48 sm:w-44 sm:h-56 shrink-0 rounded-2xl object-contain bg-slate-950" onError={(event) => { event.currentTarget.src = `/personagens/${({alex:"rin",joana:"wa",ravi:"satori",bia:"yuki"} as Record<string,string>)[previewCharacter]}.png`; }} />
                <div><h2 id="persona-title" className="text-2xl font-black">{CHARACTERS[previewCharacter].name}</h2><p className="text-teal-300">{CHARACTERS[previewCharacter].title}</p></div>
              </div>
              <button type="button" aria-label="Fechar apresentação" onClick={() => setPreviewCharacter(null)} className="text-slate-300 hover:text-white text-2xl">×</button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{CHARACTERS[previewCharacter].description}</p>
            <p className="italic text-amber-200 text-sm">{CHARACTERS[previewCharacter].quote}</p>
            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 space-y-2 text-sm">
              <p className="font-bold text-teal-300">Perspectiva: {CHARACTERS[previewCharacter].role}</p>
              <p className="text-sm text-slate-400">A persona amplia o olhar, mas não determina a resposta ética.</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setPreviewCharacter(null)} className="flex-1 rounded-xl border border-slate-600 p-3">Voltar</button>
              <button type="button" autoFocus onClick={() => confirmCharacter(previewCharacter)} className="flex-1 rounded-xl bg-teal-400 text-slate-950 font-bold p-3">Escolher Guardião</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
