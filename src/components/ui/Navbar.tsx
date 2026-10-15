import React from 'react';
import { RoomState } from '../../types/game';
import { Shield, BookOpen, Eye, Scale, LogOut, Copy, Wifi, WifiOff } from 'lucide-react';

interface NavbarProps {
  state: RoomState | null;
  isConnected: boolean;
  onOpenRules: () => void;
  onOpenInstitutionalGuide: () => void;
  onOpenAccessibility: () => void;
  onOpenOrganizer: () => void;
  onLeaveRoom: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  isConnected,
  onOpenRules,
  onOpenInstitutionalGuide,
  onOpenAccessibility,
  onOpenOrganizer,
  onLeaveRoom,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-2 sm:py-3 text-slate-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 mobile-navbar">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md select-none">
            EN
          </div>
          <div className="hidden sm:block">
            <span className="font-black text-sm sm:text-base tracking-tight text-slate-100 block leading-tight">
              Entre Nós
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-teal-400 block leading-none">
              Guardiões da Convivência
            </span>
          </div>
        </div>

        {/* Room Code Badge (if in a room) */}
        {state && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sala:
            </span>
            <span className="font-mono font-bold text-xs text-amber-400">
              {state.roomCode}
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 mobile-navbar-actions">
          {/* Connection status dot */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
              isConnected
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-950/60 text-rose-300 border-rose-500/40 animate-pulse'
            }`}
            title={isConnected ? 'Conectado ao servidor' : 'Reconectando...'}
          >
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden md:inline">{isConnected ? 'Online' : 'Reconectando'}</span>
          </div>

          {/* Institutional Guide Button */}
          <button
            onClick={onOpenInstitutionalGuide}
            className="hidden sm:flex p-2.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Guia de Canais Institucionais"
          >
            <Scale className="w-4 h-4 text-teal-400" />
            <span className="hidden lg:inline">Canais</span>
          </button>

          {/* Rules Button */}
          <button
            onClick={onOpenRules}
            className="hidden sm:flex p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 text-xs font-semibold items-center gap-1.5 transition-colors"
            title="Regras do Jogo"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="hidden lg:inline">Regras</span>
          </button>

          {/* Accessibility Button */}
          <button
            onClick={onOpenAccessibility}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Acessibilidade Visual"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Acessibilidade</span>
          </button>

          {/* Organizer Dashboard */}
          <button
            onClick={onOpenOrganizer}
            className="hidden sm:flex p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-300 border border-slate-800 text-xs font-semibold items-center gap-1.5 transition-colors"
            title="Painel do Organizador"
          >
            <Shield className="w-4 h-4 text-rose-400" />
            <span className="hidden lg:inline">Organizador</span>
          </button>

          {/* Leave room button */}
          {state && (
            <button
              onClick={onLeaveRoom}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors ml-1"
              title="Sair da Sala"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
