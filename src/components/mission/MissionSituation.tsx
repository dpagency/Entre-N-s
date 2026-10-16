import React from 'react';
import { MissionDef, RoomState } from '../../types/game';
import { PerspectiveCard } from '../cards/CardView';
import { REGIONS } from '../../data/regions';
import { socketService } from '../../services/socket';
import { AlertCircle, HelpCircle, ArrowRight, ShieldCheck, BookOpen, Share2 } from 'lucide-react';

interface MissionSituationProps {
  mission: MissionDef;
  state: RoomState;
  myPlayerId: string;
}

export const MissionSituation: React.FC<MissionSituationProps> = ({
  mission,
  state,
  myPlayerId,
}) => {
  const isSolo = Object.values(state.players).some(player => player.isBot);
  const region = REGIONS[mission.regionId];

  // Perspectives visible to me: either shared with group or assigned privately to me
  const myPlayer = state.players[myPlayerId];
  const myAssignedPerspectives = mission.perspectives.filter(
    (p) => state.perspectiveAssignments?.[p.id] === myPlayerId
  );

  const sharedPerspectives = mission.perspectives.filter((p) =>
    state.sharedPerspectiveIds.includes(p.id)
  );

  const handleShare = (perspId: string) => {
    socketService.send({
      type: 'SHARE_PERSPECTIVE',
      perspectiveId: perspId,
    });
  };

  const handleProceedToExplore = () => {
    // In server, can jump to explore or directly individual choice
    socketService.send({
      type: 'EXPLORE_MISSION'
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-100">
      {/* Top Banner with Mission Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Missão {mission.code} • {region.name}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                mission.missionType === 'fundamentada'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              Questão {mission.missionType === 'fundamentada' ? 'Fundamentada' : 'Reflexiva'}
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Fase 1 de 4 • Leitura do Cenário e Perspectivas
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight mb-2">
          {mission.title}
        </h1>

        {/* Narrative Context & Trigger */}
        <div className="space-y-3 bg-slate-950/70 border border-slate-800 p-4 sm:p-5 rounded-2xl mb-5">
          <p data-narration="story" className="text-sm sm:text-base text-slate-200 leading-relaxed font-serif">
            {mission.situation.context}
          </p>
          <div className="p-3 rounded-xl bg-amber-950/30 border-l-4 border-amber-500 text-xs sm:text-sm text-amber-200/90">
            <strong className="text-amber-300 block mb-0.5">O Dilema em Questão:</strong>
            <p data-narration="story">{mission.situation.trigger}</p>
          </div>
        </div>

        {/* Known Facts & Uncertainties Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-wide mb-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Fatos Conhecidos:
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 list-disc list-inside">
              {mission.situation.knownFacts.map((fact, i) => (
                <li key={i}>{fact}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wide mb-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Incertezas a Considerar:
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 list-disc list-inside">
              {mission.situation.uncertainties.map((unc, i) => (
                <li key={i}>{unc}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Institutional Note */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
          <AlertCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-300">Nota Institucional:</strong> {mission.situation.institutionalNote}
          </span>
        </div>
      </div>

      {/* Perspectives Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400" />
              Perspectivas dos Atores Envolvidos
            </h3>
            <p className="text-xs text-slate-400">
              {isSolo ? 'Conheça os relatos disponíveis. Outras perspectivas poderão surgir durante a jornada.' : 'Cada Guardião recebe uma visão do cenário e pode compartilhá-la com os colegas.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mission.perspectives.map((persp) => {
            const isAssignedToMe = state.perspectiveAssignments?.[persp.id] === myPlayerId;
            const isShared = state.sharedPerspectiveIds.includes(persp.id);

            // If not shared and not assigned to me, show anonymized sealed card
            if (!isShared && !isAssignedToMe) {
              return (
                <div
                  key={persp.id}
                  className="bg-slate-900/60 border border-slate-800/80 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center text-slate-500 min-h-[200px]"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl mb-2">
                    🔒
                  </div>
                  <div className="font-bold text-xs text-slate-400">
                    Perspectiva de {persp.actorName}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isSolo ? 'Este relato ainda não foi revelado. O poder de Yūki pode ajudar a conhecê-lo.' : 'Esta perspectiva foi distribuída a outro colega ou pode ser revelada pelo poder de Yūki.'}
                  </p>
                </div>
              );
            }

            return (
              <PerspectiveCard
                key={persp.id}
                perspective={persp}
                isPrivateToMe={isAssignedToMe}
                isSharedWithGroup={isShared}
                onShareWithGroup={isSolo ? undefined : () => handleShare(persp.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Action to proceed to individual choice */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-slate-300">
          {isSolo ? 'Depois de conhecer o cenário, escolha como deseja agir. Você poderá ouvir os Guardiões após confirmar sua decisão.' : <>Quando todos tiverem lido e compartilhado suas impressões, passem para a <strong className="text-teal-300">escolha individual em sigilo</strong>.</>}
        </div>

        <button
          onClick={handleProceedToExplore}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <span>{isSolo ? 'Escolher como agir' : 'Ir para Escolha Individual'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
