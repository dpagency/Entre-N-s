import React from 'react';
import { ActionOption, Perspective, AdditionalContext, DiscoveryDef } from '../../types/game';
import { Eye, Shield, Users, HelpCircle, FileText, Sparkles, AlertCircle, Share2, Check } from 'lucide-react';

interface PerspectiveCardProps {
  perspective: Perspective;
  isPrivateToMe?: boolean;
  isSharedWithGroup?: boolean;
  onShareWithGroup?: () => void;
}

export const PerspectiveCard: React.FC<PerspectiveCardProps> = ({
  perspective,
  isPrivateToMe,
  isSharedWithGroup,
  onShareWithGroup,
}) => {
  return (
    <div className="flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden text-slate-100 transition-all hover:border-teal-500/50">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-2xl shadow-inner">
            {perspective.actorAvatar}
          </div>
          <div>
            <div className="font-bold text-base text-slate-100 flex items-center gap-2">
              {perspective.actorName}
            </div>
            <div className="text-xs font-medium text-teal-400">
              {perspective.actorRole}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isPrivateToMe && !isSharedWithGroup && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Privada (Sua)
            </span>
          )}
          {isSharedWithGroup && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Compartilhada
            </span>
          )}
        </div>
      </div>

      <div data-narration="story" className="text-xs sm:text-sm text-slate-300 font-medium mb-3 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        {perspective.details}
      </div>

      {isPrivateToMe && !isSharedWithGroup && onShareWithGroup && (
        <button
          onClick={onShareWithGroup}
          className="mt-3 w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
        >
          <Share2 className="w-3.5 h-3.5" />
          Compartilhar Perspectiva com a Equipe
        </button>
      )}
    </div>
  );
};

interface ActionCardProps {
  action: ActionOption;
  isSelected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  showConsequencePreview?: boolean;
  voteCount?: number;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  isSelected,
  onSelect,
  disabled,
  showConsequencePreview,
  voteCount,
}) => {
  const badgeStyles = {
    orientacao: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    acolhimento: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    dialogo: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    formalizacao: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    cautela: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  }[action.actionType];

  return (
    <div
      onClick={() => !disabled && onSelect && onSelect()}
      role="button"
      aria-pressed={Boolean(isSelected)}
      aria-disabled={Boolean(disabled)}
      aria-label={action.title}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`relative flex flex-col p-4 sm:p-5 rounded-2xl border transition-all text-left shadow-lg cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-amber-400 ${
        isSelected
          ? 'bg-gradient-to-b from-teal-950/90 to-slate-900 border-teal-400 ring-2 ring-teal-400/50 shadow-teal-500/20'
          : 'bg-slate-900 hover:bg-slate-850 border-slate-700/80 hover:border-slate-500'
      } ${disabled ? 'opacity-80 cursor-default' : 'active:scale-99'}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyles}`}>
          {action.actionType}
        </span>

        {voteCount !== undefined && voteCount > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow">
            {voteCount} {voteCount === 1 ? 'voto' : 'votos'}
          </span>
        )}
      </div>

      <h4 className="font-bold text-sm sm:text-base text-slate-100 mb-2 leading-snug">
        {action.title}
      </h4>

      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
        {action.description}
      </p>

      <div className="mt-auto pt-3 border-t border-slate-800 text-xs text-slate-400">
        <span className="font-semibold text-slate-300">Fundamentação:</span> {action.justification}
      </div>

      {showConsequencePreview && (
        <div className="mt-3 p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-xs text-blue-200">
          <strong className="text-blue-300 block mb-0.5">Visão Adiante (Poder Joana):</strong>
          {action.consequenceSummary}
        </div>
      )}

      {onSelect && (
        <div className="mt-3 pt-2">
          <div
            className={`w-full py-2 rounded-xl text-xs font-bold text-center transition-all ${
              isSelected
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
            }`}
          >
            {isSelected ? 'Sua Escolha Selecionada ✓' : 'Escolher esta Ação'}
          </div>
        </div>
      )}
    </div>
  );
};

interface DiscoveryCardProps {
  discovery: DiscoveryDef;
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ discovery }) => {
  return (
    <div className="flex flex-col bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Descoberta Coletiva Conquistada
          </span>
          <h3 className="text-lg font-black text-slate-100">
            {discovery.title}
          </h3>
        </div>
      </div>

      <div className="text-xs text-amber-200/90 font-medium mb-3 italic">
        {discovery.subtitle}
      </div>

      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
        {discovery.description}
      </p>

      <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-3 text-xs text-slate-200">
        <strong className="text-amber-300 block mb-1">Para reflexão em equipe:</strong>
        {discovery.reflectionQuestion}
      </div>
    </div>
  );
};
