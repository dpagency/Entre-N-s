export type CharacterId = 'alex' | 'joana' | 'ravi' | 'bia';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  title: string;
  role: string;
  description: string;
  quote: string;
  powerName: string;
  powerDescription: string;
  color: string; // Tailwind color token or hex
  accentBg: string;
  borderColor: string;
}

export type RegionId = 'praca' | 'sala' | 'oficina' | 'portal';

export interface RegionDef {
  id: RegionId;
  name: string;
  subtitle: string;
  theme: string;
  description: string;
  color: string;
  bgGradient: string;
  iconName: string;
  x: number; // SVG % coord
  y: number; // SVG % coord
}

export type MissionType = 'fundamentada' | 'reflexiva';

export interface Perspective {
  id: string;
  actorName: string;
  actorRole: string;
  actorAvatar: string;
  summary: string;
  details: string;
  privateToPlayerId?: string; // If distributed privately
  isSharedWithGroup?: boolean;
}

export interface ActionOption {
  id: string;
  title: string;
  actionType: 'orientacao' | 'acolhimento' | 'dialogo' | 'formalizacao' | 'cautela';
  description: string;
  justification: string;
  isPreferableInContext?: boolean; // For fundamentadas
  pedagogicalFeedback: string;
  consequenceSummary: string;
  consequenceDetails: string;
}

export interface AdditionalContext {
  id: string;
  label: string;
  unlockedByPower?: 'alex' | 'joana' | 'bia';
  content: string;
}

export interface TrueFalseQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
  sourceNote: string;
}

export type DiscoveryKey = 'escuta' | 'respeito' | 'responsabilidade' | 'orientacao';

export interface DiscoveryDef {
  key: DiscoveryKey;
  title: string;
  subtitle: string;
  description: string;
  reflectionQuestion: string;
  icon: string;
}

export interface MissionDef {
  id: string;
  title: string;
  code: string;
  regionId: RegionId;
  missionType: MissionType;
  pedagogicalGoal: string;
  situation: {
    context: string;
    trigger: string;
    knownFacts: string[];
    uncertainties: string[];
    institutionalNote: string;
  };
  perspectives: Perspective[];
  additionalContexts: AdditionalContext[];
  actions: ActionOption[];
  discovery: DiscoveryDef;
  tfChallenge?: TrueFalseQuestion;
  editorialInfo: {
    source: string;
    version: string;
    reviewStatus: string;
  };
}

export interface InstitutionalChannelDef {
  id: string;
  name: string;
  role: string;
  whenToUse: string;
  whenNotToUse: string;
  exampleInGame: string;
  flowClarification: string;
  icon: string;
}

export interface PrePostQuestion {
  id: string;
  situation: string;
  type: 'fundamentada' | 'reflexiva';
  options: {
    id: string;
    text: string;
    isOptimal?: boolean;
    feedback: string;
  }[];
  pedagogicalReflection: string;
}

export type GamePhase =
  | 'LOBBY'
  | 'PRE_TEST'
  | 'BOARD_SELECT'
  | 'MISSION_SITUATION'
  | 'MISSION_EXPLORE'
  | 'MISSION_INDIVIDUAL_CHOICE'
  | 'MISSION_REVEAL'
  | 'MISSION_COLLECTIVE_VOTE'
  | 'MISSION_TF_CHALLENGE'
  | 'MISSION_CONSEQUENCE'
  | 'POST_TEST'
  | 'GAME_SUMMARY'
  | 'FEEDBACK';

export interface PlayerSession {
  id: string;
  nickname: string;
  characterId: CharacterId;
  variantIndex: number;
  lastSeenAt?: number;
  isBot?: boolean;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  hasUsedPower: boolean;
  preTestCompleted?: boolean;
  postTestCompleted?: boolean;
  preTestScore?: number;
  postTestScore?: number;
}

export interface RoomState {
  roomCode: string;
  createdAt: number;
  phase: GamePhase;
  players: Record<string, PlayerSession>;
  hostId: string;
  currentRegionId: RegionId;
  completedMissionIds: string[];
  activeMissionId?: string;
  // Destination vote in Board
  destinationVotes: Record<string, RegionId>; // playerId -> regionId
  // Mission progression state
  perspectiveAssignments?: Record<string, string>;
  sharedPerspectiveIds: string[]; // ids of perspectives shared with the entire room
  unlockedContextIds: string[]; // contexts unlocked via power or exploration
  revealedActors: string[]; // actors revealed via Bia's power
  futureLooks: string[]; // consequences previewed via Joana's power
  isRaviSecondRoundActive: boolean;
  // Individual choices: stored secretly on server, revealed only on REVEAL phase
  individualChoices: Record<string, string>; // playerId -> actionId (sanitized on client in non-reveal phases)
  // Collective vote
  collectiveVotes: Record<string, string>; // playerId -> actionId
  collectiveVoteRound: number;
  isNonConsensualResult: boolean;
  nonConsensualActionIds?: [string, string];
  chosenCollectiveActionId?: string;
  // True False challenge
  tfAnsweredPlayers: Record<string, boolean>; // playerId -> answer
  // Discoveries acquired by team
  unlockedDiscoveries: DiscoveryKey[];
  // Sorteio registrado por missão: independente das respostas éticas.
  fortuneCards?: Record<string, { cardIndex: number; outcome: 'sorte' | 'reves' | 'segunda_chance' }>;
  // History
  historyLog: {
    timestamp: number;
    missionId: string;
    actionChosenId: string;
    voteType: 'unanimous' | 'majority' | 'non_consensual';
    perspectivesExploredCount: number;
    reconsiderationOccurred: boolean;
    affinityGuardianIds?: CharacterId[];
  }[];
}

// Server to client sanitized payload
export interface SanitizedRoomState extends Omit<RoomState, 'individualChoices'> {
  // Only indicates whether player has chosen, hiding the value until REVEAL
  individualChoiceStatus: Record<string, boolean>; // playerId -> boolean
  // Revealing only the current player's own choice, or all if phase >= MISSION_REVEAL
  revealedIndividualChoices?: Record<string, string>;
  myChoice?: string;
}

// Socket messages
export type ClientMessage =
  | { type: 'JOIN_ROOM'; roomCode: string; nickname: string; characterId: CharacterId; variantIndex: number; sessionToken?: string }
  | { type: 'CREATE_ROOM'; nickname: string; characterId: CharacterId; variantIndex: number }
  | { type: 'TOGGLE_READY' }
  | { type: 'START_GAME' }
  | { type: 'EXPLORE_MISSION' }
  | { type: 'OPEN_COLLECTIVE_VOTE' }
  | { type: 'SUBMIT_PRE_TEST'; answers: Record<string, string> }
  | { type: 'VOTE_DESTINATION'; regionId: RegionId }
  | { type: 'CONFIRM_DESTINATION' }
  | { type: 'START_MISSION'; missionId: string }
  | { type: 'SHARE_PERSPECTIVE'; perspectiveId: string }
  | { type: 'USE_POWER'; powerType: 'alex' | 'joana' | 'ravi' | 'bia' }
  | { type: 'SUBMIT_INDIVIDUAL_CHOICE'; actionId: string }
  | { type: 'PROCEED_TO_REVEAL' }
  | { type: 'SUBMIT_COLLECTIVE_VOTE'; actionId: string }
  | { type: 'CONTINUE_WITHOUT_DISCONNECTED' }
  | { type: 'SUBMIT_TF_ANSWER'; answer: boolean }
  | { type: 'DRAW_FORTUNE_CARD'; cardIndex: number }
  | { type: 'PROCEED_AFTER_CONSEQUENCE' }
  | { type: 'SUBMIT_POST_TEST'; answers: Record<string, string> }
  | { type: 'SUBMIT_FEEDBACK'; usability: number; clarity: number; interest: number; comment?: string }
  | { type: 'LEAVE_ROOM' };

export type ServerMessage =
  | { type: 'ROOM_JOINED'; roomCode: string; playerId: string; sessionToken: string; state: SanitizedRoomState }
  | { type: 'STATE_UPDATE'; state: SanitizedRoomState }
  | { type: 'ERROR'; message: string }
  | { type: 'POWER_ACTIVATED'; characterId: CharacterId; playerName: string; powerName: string; details: string }
  | { type: 'NOTIFICATION'; message: string; variant?: 'info' | 'success' | 'warning' };
