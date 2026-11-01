import { browserStorage } from './services/browserStorage';
import { hasMissionChannels } from './services/missionChannels';
import { LearningCelebration } from './components/ui/LearningCelebration';
import { INSTITUTIONAL } from './distribution';
import React, { useState, useEffect, useLayoutEffect, useSyncExternalStore } from 'react';
import { RoomState, SanitizedRoomState } from './types/game';
import { GAME_MISSIONS as MISSIONS } from './data/missionRegistry';
import { socketService } from './services/socket';
import { Navbar } from './components/ui/Navbar';
import { JourneyAudio } from './components/ui/JourneyAudio';
import { AccessibilityModal } from './components/ui/AccessibilityModal';
import { RulesModal } from './components/ui/RulesModal';
import { InstitutionalCardModal } from './components/cards/InstitutionalCardModal';
import { OrganizerDashboard } from './components/admin/OrganizerDashboard';
import { JourneyHome } from './components/lobby/JourneyHome';
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
import { MotionConfig } from 'motion/react';
import { readAccessibilityPreferences, saveAccessibilityPreferences, TextSize } from './services/accessibility';
import { useDialogAccessibility } from './hooks/useDialogAccessibility';
import { GuardianEncounter } from './components/mission/GuardianEncounter';
import { ParticipantReveal } from './components/mission/ParticipantReveal';
import { PilotSummary } from './components/summary/PilotSummary';

export default function App() {
  const storagePersistent = useSyncExternalStore(browserStorage.subscribe, () => browserStorage.persistent);
  const [state, setState] = useState<SanitizedRoomState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(socketService.myPlayerId);
  const [showWelcome, setShowWelcome] = useState(true);

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
    const late = window.setTimeout(resetScroll, 350);
    return () => { window.cancelAnimationFrame(frame); window.clearTimeout(delayed); window.clearTimeout(late); };
  }, [state?.phase, state?.activeMissionId, state?.fortuneCards?.[state?.activeMissionId || '']?.outcome, state?.myChoice]);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isInstitutionalGuideOpen, setIsInstitutionalGuideOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Accessibility settings
  const [preferences, setPreferences] = useState(() => readAccessibilityPreferences(browserStorage));
  const { reducedMotion, fontSize, highContrast } = preferences;
  const setReducedMotion = (value: boolean) => setPreferences(p => ({ ...p, reducedMotion: value }));
  const setFontSize = (value: TextSize) => setPreferences(p => ({ ...p, fontSize: value }));
  const setHighContrast = (value: boolean) => setPreferences(p => ({ ...p, highContrast: value }));
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = fontSize;
    root.dataset.highContrast = String(highContrast);
    root.dataset.reducedMotion = String(reducedMotion);
    saveAccessibilityPreferences(browserStorage, preferences);
  }, [preferences, fontSize, highContrast, reducedMotion]);
  useDialogAccessibility();

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; text: string; variant: 'info' | 'success' | 'warning' }[]>([]);

  const addNotification = (text: string, variant: 'info' | 'success' | 'warning' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setNotifications((prev) => [...prev.slice(-1), { id, text, variant }]);
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
      setShowWelcome(false);
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

  useEffect(() => {
    if (!showWelcome) {
      const heading = document.querySelector<HTMLElement>('main h1, main h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    }
  }, [showWelcome]);

  const handleReturnHome = () => {
    // Pausar apenas a visualização: o snapshot solo permanece salvo no navegador.
    setShowWelcome(true);
    setNotifications([]);
    window.scrollTo(0, 0);
  };


  // Find active mission definition if in mission phase
  const activeMission = state?.activeMissionId
    ? MISSIONS.find((m) => m.id === state.activeMissionId) || MISSIONS[0]
    : MISSIONS[0];
  useEffect(() => {
    if (!showWelcome && state?.phase === 'MISSION_CHANNELS') setIsInstitutionalGuideOpen(true);
  }, [showWelcome, state?.phase, state?.journeyId, state?.activeMissionId]);
  const closeChannels = () => {
    setIsInstitutionalGuideOpen(false);
    if (state?.missionFlowVersion === 2 && state.phase === 'MISSION_CHANNELS' &&
        (!hasMissionChannels(state) || state.missionChannelActivity?.missions[state.activeMissionId!]?.answer !== undefined)) {
      socketService.send({ type: 'PROCEED_AFTER_CONSEQUENCE' });
    }
  };

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'user'}>
    <LearningCelebration phase={showWelcome ? undefined : state?.phase} />
    <div
      data-game-screen={showWelcome || !state || !myPlayerId ? 'welcome' : 'journey'}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950"
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
              aria-label="Fechar notificação"
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
        state={showWelcome ? null : state}
        isConnected={isConnected}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenInstitutionalGuide={() => setIsInstitutionalGuideOpen(true)}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onReturnHome={handleReturnHome}
      />

      <JourneyAudio phase={showWelcome ? undefined : state?.phase} missionId={showWelcome ? undefined : state?.activeMissionId} />

      {/* Main content body */}
      <main className={`flex-1 max-w-[1440px] ${showWelcome || !state || !myPlayerId ? '' : 'game-journey'} w-full mx-auto p-4 sm:p-6 flex flex-col`}>
        {!showWelcome && state?.journeyId && myPlayerId && !(state.missionFlowVersion === 2 && state.phase.startsWith('MISSION_')) && <div className="mx-auto mb-4 flex w-full max-w-5xl justify-end">
          <button type="button" data-channel-invitation onClick={() => setIsInstitutionalGuideOpen(true)} className="min-h-11 w-full max-w-full whitespace-normal break-words rounded-xl border border-amber-300 bg-amber-400 px-4 py-3 text-sm font-bold leading-relaxed text-slate-950 shadow-md hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400 sm:w-auto">
            {hasMissionChannels(state) ? 'Canais de Atendimento' : 'Explore os Canais de Atendimento e ganhe pontos!'}
          </button>
        </div>}
        {!storagePersistent && <p role="status" className="rounded-xl border border-amber-400 p-3 text-sm text-amber-200">Não foi possível salvar seu progresso neste navegador. Você pode continuar jogando, mas suas respostas mais recentes poderão ser perdidas se sair ou atualizar a página.</p>}
        {!showWelcome && state && state.pilotVersion !== 2 && <p className="rounded-xl border border-slate-600 p-3 text-sm">Esta partida salva usa a dinâmica anterior. Ela foi preservada; ao jogar novamente, você encontrará a nova dinâmica dos quatro Guardiões.</p>}
        {showWelcome || !state || !myPlayerId ? (
          /* Welcome screen when not in a room */
          <JourneyHome />
        ) : (
          /* Game Phase Routing */
          <>
            {state.phase === 'LOBBY' && (
              <LobbyView
                state={state as any}
                myPlayerId={myPlayerId}
                onOpenRules={() => setIsRulesOpen(true)}
                onBackToGuardianSelection={handleReturnHome}
              />
            )}

            {!INSTITUTIONAL && state.phase === 'PRE_TEST' && (
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

            {state.phase === 'MISSION_GUARDIAN' && <GuardianEncounter key={`${state.journeyId}-${activeMission.id}`} state={state} mission={activeMission} />}
            {state.phase === 'MISSION_CHANNELS' && <section className="mx-auto w-full max-w-3xl space-y-4 rounded-2xl border border-teal-500 p-5"><h1 className="text-2xl font-black">Desafio dos Canais de Atendimento</h1><button type="button" onClick={() => setIsInstitutionalGuideOpen(true)} className="min-h-12 rounded-xl bg-teal-400 p-4 font-bold text-slate-950">Continuar desafio dos Canais</button></section>}
            {(state.phase === 'MISSION_EXPLORE' || state.phase === 'MISSION_INDIVIDUAL_CHOICE') && (
              <MissionIndividualChoice
                mission={activeMission}
                state={state as any}
                myPlayerId={myPlayerId}
              />
            )}

            {state.phase === 'MISSION_REVEAL' && (
              INSTITUTIONAL || state.pilotVersion === 2 ? <ParticipantReveal key={`${state.journeyId}-${activeMission.id}`} state={state} mission={activeMission} myPlayerId={myPlayerId} /> :
              <MissionReveal
                mission={activeMission}
                state={state as any}
                myPlayerId={myPlayerId}
              />
            )}

            {!INSTITUTIONAL && state.phase === 'MISSION_COLLECTIVE_VOTE' && (
              <MissionCollectiveVote
                mission={activeMission}
                state={state as any}
                myPlayerId={myPlayerId}
              />
            )}

            {!INSTITUTIONAL && state.phase === 'MISSION_TF_CHALLENGE' && (
              <TrueFalseChallenge
                mission={activeMission}
                state={state as any}
                myPlayerId={myPlayerId}
              />
            )}

            {(state.phase === 'MISSION_CONSEQUENCE' || state.phase === 'MISSION_CARDS') && (
              <MissionConsequence key={`${state.journeyId}-${activeMission.id}`}
                onOpenChannels={() => setIsInstitutionalGuideOpen(true)}
                mission={activeMission}
                state={state as any}
                myPlayerId={myPlayerId}
              />
            )}

            {!INSTITUTIONAL && state.phase === 'POST_TEST' && (
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
              <SummaryForVersion
                onReturnHome={handleReturnHome}
                state={state as any}
                myPlayerId={myPlayerId}
                onOpenFeedback={() => setIsFeedbackOpen(true)}
                onRestartGame={() => {
                  if (window.confirm('Começar uma nova jornada? O progresso e as decisões desta partida serão substituídos.')) {
                    if (state.pilotVersion === 2) socketService.send({ type: 'START_GAME' });
                    else {
                      const player = state.players[myPlayerId];
                      socketService.discardSavedJourney();
                      socketService.send({ type: 'CREATE_ROOM', pilotVersion: 2, nickname: player.nickname, variantIndex: player.variantIndex, characterId: player.characterId });
                    }
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <RulesModal integratedFlow={showWelcome || state?.missionFlowVersion === 2} missionChannels={showWelcome || hasMissionChannels(state)} rulesVersion={showWelcome ? 4 : state?.learningRulesVersion} isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <InstitutionalCardModal
        state={showWelcome ? null : state}
        isOpen={isInstitutionalGuideOpen}
        onClose={closeChannels}
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
      {!INSTITUTIONAL && isOrganizerOpen && <OrganizerDashboard
        isOpen={isOrganizerOpen}
        onClose={() => setIsOrganizerOpen(false)}
      />}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
    </MotionConfig>
  );
}

function SummaryForVersion(props: React.ComponentProps<typeof GameSummary> & { onReturnHome: () => void }) {
  return INSTITUTIONAL || props.state.pilotVersion === 2 ? <PilotSummary {...props} /> : <GameSummary {...props} />;
}
