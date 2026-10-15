import React from 'react';
import { RegionId, RoomState } from '../../types/game';
import { REGIONS, REGION_LIST } from '../../data/regions';
import { MISSIONS } from '../../data/missions';
import { socketService } from '../../services/socket';
import { Users, Building2, Wrench, Compass, CheckCircle2, Navigation, Sparkles } from 'lucide-react';

interface TownMapProps {
  state: RoomState;
  myPlayerId: string;
  onSelectRegionDetails?: (regionId: RegionId) => void;
}

export const TownMap: React.FC<TownMapProps> = ({
  state,
  myPlayerId,
  onSelectRegionDetails,
}) => {
  const isVoting = state.phase === 'BOARD_SELECT';
  const myVote = state.destinationVotes[myPlayerId];
  const isHost = state.hostId === myPlayerId;
  const isSolo = Object.values(state.players).filter(player => !player.isBot).length === 1;

  const currentRegion = REGIONS[state.currentRegionId] || REGIONS.praca;

  // Count votes per region
  const voteCounts: Record<RegionId, number> = {
    praca: 0,
    sala: 0,
    oficina: 0,
    portal: 0,
  };
  Object.values(state.destinationVotes).forEach((r) => {
    if (voteCounts[r] !== undefined) voteCounts[r]++;
  });

  const handleVote = (regionId: RegionId) => {
    if (!isVoting) {
      if (onSelectRegionDetails) onSelectRegionDetails(regionId);
      return;
    }
    socketService.send({
      type: 'VOTE_DESTINATION',
      regionId,
    });
  };

  const handleConfirmDestination = () => {
    socketService.send({
      type: 'CONFIRM_DESTINATION',
    });
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Users':
        return <Users className="w-6 h-6" />;
      case 'Building2':
        return <Building2 className="w-6 h-6" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6" />;
      case 'Compass':
        return <Compass className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl p-4 sm:p-6 text-white flex flex-col gap-4">
      {/* Header bar of map */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Vila dos Encontros
            </span>
            <span className="text-xs text-slate-400">
              Progresso da Equipe: <strong className="text-amber-400">{state.completedMissionIds.length}/4 Missões</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
            Mapa Territorial da Convivência
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            {isVoting
              ? 'Escolha o próximo destino da sua equipe.'
              : `Local Atual: ${currentRegion.name} (${currentRegion.subtitle})`}
          </p>
        </div>

        {/* Discoveries earned token row */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Descobertas:</span>
          {(['escuta', 'respeito', 'responsabilidade', 'orientacao'] as const).map((disc) => {
            const hasDisc = state.unlockedDiscoveries.includes(disc);
            const discLabels = {
              escuta: 'Escuta',
              respeito: 'Respeito',
              responsabilidade: 'Responsabilidade',
              orientacao: 'Orientação',
            };
            return (
              <span
                key={disc}
                className={`text-xs px-2 py-0.5 rounded-md font-medium flex items-center gap-1 transition-all ${
                  hasDisc
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-slate-800/60 text-slate-600 border border-slate-800 line-through'
                }`}
                title={hasDisc ? `Descoberta conquistada: ${discLabels[disc]}` : `Ainda não conquistada: ${discLabels[disc]}`}
              >
                {hasDisc && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                {discLabels[disc]}
              </span>
            );
          })}
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full hidden sm:block aspect-[16/10] sm:aspect-[16/9] max-h-[520px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-inner select-none">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full pointer-events-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background landscape texture */}
          <defs>
            <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
            </radialGradient>
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0369a1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.6" />
            </linearGradient>
            <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Land background */}
          <rect width="1000" height="600" fill="url(#mapGlow)" />

          {/* Gentle stylized river dividing regions */}
          <path
            d="M 520 -10 C 490 180 530 320 480 440 C 440 540 470 610 470 610"
            fill="none"
            stroke="url(#riverGrad)"
            strokeWidth="38"
            strokeLinecap="round"
          />
          <path
            d="M 520 -10 C 490 180 530 320 480 440 C 440 540 470 610 470 610"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="6 6"
            opacity="0.4"
          />

          {/* Cobblestone paths connecting the 4 regions */}
          {/* Praca (280, 210) to Sala (720, 192) */}
          <path
            d="M 280 210 Q 500 130 720 192"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="5"
            strokeDasharray="8 8"
            strokeOpacity="0.25"
          />
          {/* Praca (280, 210) to Oficina (320, 450) */}
          <path
            d="M 280 210 Q 300 330 320 450"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="5"
            strokeDasharray="8 8"
            strokeOpacity="0.25"
          />
          {/* Sala (720, 192) to Portal (750, 432) */}
          <path
            d="M 720 192 Q 740 310 750 432"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="5"
            strokeDasharray="8 8"
            strokeOpacity="0.25"
          />
          {/* Oficina (320, 450) to Portal (750, 432) via stone bridge over river */}
          <path
            d="M 320 450 Q 500 480 750 432"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="5"
            strokeDasharray="8 8"
            strokeOpacity="0.25"
          />
          {/* Central bridge overlay over river */}
          <rect x="475" y="445" width="40" height="20" rx="4" fill="#64748b" stroke="#94a3b8" strokeWidth="2" />

          {/* Decorative town elements (stylized trees, houses, lanterns) */}
          {/* Grove near Praca */}
          <circle cx="160" cy="180" r="18" fill="#065f46" opacity="0.6" />
          <circle cx="185" cy="165" r="14" fill="#047857" opacity="0.6" />
          <circle cx="150" cy="220" r="16" fill="#059669" opacity="0.6" />

          {/* Civic pillars near Sala */}
          <rect x="830" y="140" width="8" height="35" rx="2" fill="#475569" opacity="0.7" />
          <rect x="850" y="140" width="8" height="35" rx="2" fill="#475569" opacity="0.7" />
          <rect x="870" y="140" width="8" height="35" rx="2" fill="#475569" opacity="0.7" />
          <polygon points="820,140 860,115 900,140" fill="#334155" opacity="0.8" />

          {/* Workshop gears near Oficina */}
          <circle cx="180" cy="460" r="22" fill="#78350f" opacity="0.4" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="180" cy="460" r="8" fill="#1e293b" />

          {/* Harbor beacon near Portal */}
          <circle cx="860" cy="450" r="16" fill="#0891b2" opacity="0.4" />
          <polygon points="860,420 848,460 872,460" fill="#0284c7" opacity="0.7" />

          {/* Collective Pawn / Team Marker */}
          {(() => {
            const currentR = REGIONS[state.currentRegionId] || REGIONS.praca;
            const pawnX = (currentR.x / 100) * 1000;
            const pawnY = (currentR.y / 100) * 600 - 32;

            return (
              <g
                transform={`translate(${pawnX}, ${pawnY})`}
                filter="url(#shadowFilter)"
                className="transition-all duration-700 ease-out"
              >
                {/* Pulsing beacon glow */}
                <circle cx="0" cy="10" r="28" fill="#f59e0b" opacity="0.25">
                  <animate attributeName="r" values="24;34;24" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2.4s" repeatCount="indefinite" />
                </circle>
                {/* Team banner stand */}
                <path d="M -12 25 L 12 25 L 16 34 L -16 34 Z" fill="#b45309" stroke="#fcd34d" strokeWidth="1.5" />
                {/* Pawn Body */}
                <path d="M -10 24 C -12 12 -6 2 0 -2 C 6 2 12 12 10 24 Z" fill="#d97706" stroke="#fef08a" strokeWidth="2" />
                {/* Pawn Head (Star/Compass orb) */}
                <circle cx="0" cy="-12" r="14" fill="#fbbf24" stroke="#ffffff" strokeWidth="2.5" />
                {/* Compass star inside */}
                <polygon points="0,-20 4,-12 12,-12 5,-7 8,0 0,-4 -8,0 -5,-7 -12,-12 -4,-12" fill="#78350f" />
              </g>
            );
          })()}
        </svg>

        {/* Interactive Region Cards placed over SVG coordinates */}
        {REGION_LIST.map((region) => {
          const isCurrent = state.currentRegionId === region.id;
          const votes = voteCounts[region.id];
          const hasVotedForThis = myVote === region.id;
          const missionsInRegion = MISSIONS.filter((m) => m.regionId === region.id);
          const completedInRegion = missionsInRegion.filter((m) =>
            state.completedMissionIds.includes(m.id)
          ).length;

          return (
            <button
              key={region.id}
              onClick={() => handleVote(region.id)}
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute group p-3 sm:p-4 rounded-xl text-left transition-all duration-300 max-w-[170px] sm:max-w-[210px] shadow-xl border focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                isCurrent
                  ? 'bg-slate-900/95 border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/20'
                  : hasVotedForThis
                  ? 'bg-teal-950/90 border-teal-400 ring-2 ring-teal-400/40'
                  : 'bg-slate-900/85 hover:bg-slate-850 border-slate-700/80 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div
                  className="p-1.5 rounded-lg shadow-sm"
                  style={{ backgroundColor: `${region.color}25`, color: region.color }}
                >
                  {getIcon(region.iconName)}
                </div>

                {isCurrent && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
                    <Navigation className="w-2.5 h-2.5 fill-current" />
                    Aqui
                  </span>
                )}

                {isVoting && votes > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-500 text-white shadow-sm animate-pulse">
                    {votes} {votes === 1 ? 'voto' : 'votos'}
                  </span>
                )}
              </div>

              <div className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                {region.name}
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mb-1.5">
                {region.subtitle}
              </div>

              {/* Mission completion indicator */}
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 pt-1 border-t border-slate-800">
                <span>Missões:</span>
                <span className="text-teal-400 font-bold">
                  {completedInRegion}/{missionsInRegion.length}
                </span>
              </div>

              {isVoting && (
                <div className="mt-2 pt-1 border-t border-slate-800/80">
                  <span
                    className={`block text-center text-[11px] font-bold py-1 px-2 rounded-lg transition-colors ${
                      hasVotedForThis
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {hasVotedForThis ? 'Seu Voto ✓' : 'Votar Aqui'}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile-first region selection: no tiny cards squeezed onto the map. */}
      <div className="grid grid-cols-1 gap-3 sm:hidden" aria-label="Destinos da Vila dos Encontros">
        {REGION_LIST.map(region => {
          const missions = MISSIONS.filter(m => m.regionId === region.id);
          const completed = missions.filter(m => state.completedMissionIds.includes(m.id)).length;
          const selected = myVote === region.id;
          return <button type="button" key={region.id} onClick={() => handleVote(region.id)} aria-pressed={isVoting ? selected : undefined} className={`min-h-24 rounded-2xl border-2 p-4 text-left flex items-center gap-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-300 ${selected ? 'border-teal-400 bg-teal-950/70' : 'border-slate-700 bg-slate-900'}`}>
            <span className="shrink-0 rounded-xl bg-slate-800 p-3 text-teal-300" aria-hidden="true">{getIcon(region.iconName)}</span>
            <span className="flex-1 min-w-0"><span className="block font-bold text-base leading-snug">{region.name}</span><span className="block text-sm text-slate-300 mt-1">{region.subtitle}</span><span className="block text-sm text-amber-300 mt-2">{completed} de {missions.length} missões</span></span>
            <span className="text-sm font-bold text-teal-300">{selected ? '✓ Escolhido' : isVoting ? 'Escolher' : 'Ver'}</span>
          </button>;
        })}
      </div>

      {/* Deliberation Footer for Voting Phase */}
      {isVoting && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-teal-500/30 p-3 sm:p-4 rounded-xl shadow-lg">
          <div className="text-xs sm:text-sm text-slate-300">
            {myVote ? (
              <span className="text-teal-300">
                Você votou em <strong>{REGIONS[myVote]?.name}</strong>. Você pode mudar a escolha antes de confirmar.
              </span>
            ) : (
              <span className="text-amber-300">
                Escolha uma região para continuar a jornada.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isHost && (
              <button
                onClick={handleConfirmDestination}
                disabled={Object.keys(state.destinationVotes).length === 0}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Confirmar destino →
              </button>
            )}
            {!isHost && (
              <span className="text-xs text-slate-400 italic">
                Aguardando o anfitrião confirmar a escolha da maioria...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
