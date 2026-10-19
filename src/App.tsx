import React, { useState, useEffect, useLayoutEffect } from 'react';
import { RoomState, SanitizedRoomState } from './types/game';
import { MISSIONS } from './data/missions';
import { socketService } from './services/socket';
import { Navbar } from './components/ui/Navbar';
import { JourneyAudio } from './components/ui/JourneyAudio';
import { AccessibilityModal } from './components/ui/AccessibilityModal';
import { RulesModal } from './components/ui/RulesModal';
import { InstitutionalCardModal } from './components/cards/InstitutionalCardModal';
import { OrganizerDashboard } from './components/admin/OrganizerDashboard';
import { WelcomeScreen } from './components/lobby/WelcomeScreen';
import { LobbyView } from './components/lobby/LobbyView';
import { TownMap } from './components/board/TownMap';
import { MissionSituation } from './components/mission/MissionSituation';
import { MissionIndividualChoice } from './components/mission/MissionIndividualChoice';
import { MissionReveal } from './components/mission/MissionReveal';
import { MissionCollectiveVote } from './components/mission/MissionCollectiveVote';
import { TrueFalseChallenge } from './components/mission/TrueFalseChallenge';
import { MissionConsequence } from './components/mission/MissionConsequence';
import { PreTestModal } from './components/evaluation/PreTestModal';
import { PostTestModal } from './components/evaluation/PostTestModal';
import { FeedbackModal } from './components/evaluation/FeedbackModal';
import { GameSummary } from './components/summary/GameSummary';
import { Zap, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<SanitizedRoomState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(socketService.myPlayerId);

  // A transição de fase deve reposicionar a leitura antes de pintar a nova tela.
  // Repetimos após a atualização de layout para evitar restauração de scroll no mobile.
  useLayoutEffect(() => {
    if (!state?.phase) return;
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const main = document.querySelector('main');
      if (main) main.scrollTop = 0;
    };
    resetScroll();
    const frame = window.requestAnimationFrame(resetScroll);
    const delayed = window.setTimeout(resetScroll, 100);
    return () => { window.cancelAnimationFrame(frame); window.clearTimeout(delayed); };
  }, [state?.phase, state?.activeMissionId]);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isInstitutionalGuideOpen, setIsInstitutionalGuideOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Accessibility settings
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; text: string; variant: 'info' | 'success' | 'warning' }[]>([]);

  const addNotification = (text: string, variant: 'info' | 'success' | 'warning' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setNotifications((prev) => [...prev, { id, text, variant }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  useEffect(() => {

    const unsubConnection = socketService.onConnection((conn) => {
      setIsConnected(conn);
    });

    const unsubState = socketService.onState((newState) => {
      setState(newState);
      if (socketService.myPlayerId) {
        setMyPlayerId(socketService.myPlayerId);
      }
    });

    const unsubError = socketService.onError((msg) => {
      addNotification(msg, 'warning');
    });

    const unsubNotification = socketService.onNotification((msg, variant) => {
      addNotification(msg, variant || 'info');
    });

    const unsubPower = socketService.onPower((pMsg) => {
      addNotification(
        `⚡ PODER ATIVADO: ${pMsg.playerName} acionou “${pMsg.powerName}”! ${pMsg.details}`,
        'success'
      );
    });

    void socketService.connect();

    return () => {
      unsubConnection();
      unsubState();
      unsubError();
      unsubNotification();
      unsubPower();
    };
  }, []);

  const handleLeaveRoom = () => {
    if (window.confirm('Deseja realmente sair da sala atual?')) {
      socketService.leaveRoom();
      setState(null);
      setMyPlayerId(null);
    }
  };

  // Find active mission definition if in mission phase
  const activeMission = state?.activeMissionId
    ? MISSIONS.find((m) => m.id === state.activeMissionId) || MISSIONS[0]
    : MISSIONS[0];

  const fontSizeClass = {
    normal: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl',
  }[fontSize];

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950 ${fontSizeClass} ${
        highContrast ? 'contrast-125' : ''
      } ${reducedMotion ? 'motion-reduce' : ''}`}
    >
      {/* Toast notifications */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-2xl text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in slide-in-from-top duration-300 ${
              n.variant === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
                : n.variant === 'warning'
                ? 'bg-amber-950/90 border-amber-500/60 text-amber-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            {n.variant === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : n.variant === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            )}
            <span className="flex-1 leading-snug">{n.text}</span>
            <button
              onClick={() => setNotifications((prev) => prev.filter((item) => item.id !== n.id))}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main navigation */}
      <Navbar
        state={state as any}
        isConnected={isConnected}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenInstitutionalGuide={() => setIsInstitutionalGuideOpen(true)}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenOrganizer={() => setIsOrganizerOpen(true)}
        onLeaveRoom={handleLeaveRoom}
      />

      <JourneyAudio phase={state?.phase} missionId={state?.activeMissionId} />

      {/* Main content body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {!state || !myPlayerId ? (
          /* Welcome screen when not in a room */
          <WelcomeScreen
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenInstitutionalGuide={() => setIsInstitutionalGuideOpen(true)}
            onOpenOrganizer={() => setIsOrganizerOpen(true)}
          />
        ) : (
          /* Game Phase Routing */
          <>
            {state.phase === 'LOBBY' && (
              <LobbyView
                state={state as any}
                myPlayerId={myPlayerId}
                onOpenRules={() => setIsRulesOpen(true)}
                onBackToGuardianSelection={() => {
                  socketService.leaveRoom();
                  setState(null);
                  setMyPlayerId(null);
                }}
              />
            )}

            {state.phase === 'PRE_TEST' && (
              <div className="flex flex-col gap-6">
                <TownMap state={state as any} myPlayerId={myPlayerId} />
                <PreTestModal
                  isOpen={!state.players[myPlayerId]?.preTestCompleted}
                />
              </div>
            )}

            {state.phase === 'BOARD_SELECT' && (
              <TownMap state={state as any} myPlayerId={myPlayerId} />
            )}

            {state.phase === 'MISSION_SITUATION' && (
              <MissionSituation
                mission={activeMission}
                state={state as any}
                myPlayerId={myPlayerId}
              />
            )}

            {(state.phase === 'MISSION_EXPLORE' || state.phase === 'MISSION_INDIVIDUAL_CHOICE') && (
              <MissionIndividualChoice
                mission={activeMission}
                state={state as any}
                myPlayerId={myPlayerId}
                onOpenInstitutionalGuide={() => setIsInstitutionalGuideOpen(true)}
              />
            )}

            {state.phase === 'MISSION_REVEAL' && (
              <MissionReveal
                mission={activeMission}
                state={state as any}
                myPlayerId={myPlayerId}
              />
            )}

            {state.phase === 'MISSION_COLLECTIVE_VOTE' && (
              <MissionCollectiveVote
                mission={activeMission}
                state={state as any}
                myPlayerId={myPlayerId}
              />
            )}

            {state.phase === 'MISSION_TF_CHALLENGE' && (
              <TrueFalseChallenge
                mission={activeMission}
                state={state as any}
                myPlayerId={myPlayerId}
              />
            )}

            {state.phase === 'MISSION_CONSEQUENCE' && (
              <MissionConsequence
                mission={activeMission}
                state={state as any}
                myPlayerId={myPlayerId}
              />
            )}

            {state.phase === 'POST_TEST' && (
              <PostTestModal
                isOpen={true}
                onCompleted={() => {
                  // After seeing comparative report
                  if (state.completedMissionIds.length >= 4) {
                    // host or player can advance to summary
                    socketService.send({ type: 'PROCEED_AFTER_CONSEQUENCE' });
                  }
                }}
              />
            )}

            {(state.phase === 'GAME_SUMMARY' || state.phase === 'FEEDBACK') && (
              <GameSummary
                state={state as any}
                myPlayerId={myPlayerId}
                onOpenFeedback={() => setIsFeedbackOpen(true)}
                onRestartGame={() => {
                  if (window.confirm('Começar uma nova jornada? O progresso e as decisões desta partida serão substituídos.')) {
                    socketService.send({ type: 'START_GAME' });
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/90 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            “Entre Nós — Guardiões da Convivência” • Jogo Sério Cooperativo de Ética no Cotidiano do Serviço Público
          </span>
          <span className="text-[11px] text-slate-600">
            Vila dos Encontros • v1.2.0 • Banco Curatorial com 6 Missões
          </span>
        </div>
      </footer>

      {/* Global Modals */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <InstitutionalCardModal
        isOpen={isInstitutionalGuideOpen}
        onClose={() => setIsInstitutionalGuideOpen(false)}
      />
      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
      />
      <OrganizerDashboard
        isOpen={isOrganizerOpen}
        onClose={() => setIsOrganizerOpen(false)}
      />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}
