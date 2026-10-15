import type {CharacterId, RegionId, ClientMessage, RoomState, SanitizedRoomState, ServerMessage} from '../types/game';
import {MISSIONS} from '../data/missions';
import {PRE_TEST_QUESTIONS, POST_TEST_QUESTIONS} from '../data/evaluations';
export interface GameConnection {readyState: number; send(data: string): void}
function randomHex(bytes: number) {return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), b => b.toString(16).padStart(2,'0')).join('');}
// Persistent in-memory store for game rooms & analytics
interface PlayerConnection {
  ws: GameConnection;
  playerId: string;
  roomCode: string;
  sessionToken: string;
}

interface CompletedFeedback {
  timestamp: number;
  roomCode: string;
  playerId: string;
  usability: number;
  clarity: number;
  interest: number;
  comment?: string;
}

interface EvaluationRecord {
  timestamp: number;
  roomCode: string;
  playerId: string;
  preTestScore?: number;
  postTestScore?: number;
  preAnswers?: Record<string, string>;
  postAnswers?: Record<string, string>;
}

export const rooms = new Map<string, RoomState>();
const socketToPlayer = new Map<GameConnection, PlayerConnection>();
const playerToSocket = new Map<string, GameConnection>();
export const tokenToPlayer = new Map<string, { roomCode: string; playerId: string }>();

// Analytics store
export const evaluationRecords: EvaluationRecord[] = [];
export const feedbackRecords: CompletedFeedback[] = [];

// Helper to generate non-sequential friendly room codes (e.g. VILA-4K8)
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VILA-${randomPart}`;
}

// Sanitization function: hides individual secret choices until revelation phase
function getSanitizedState(room: RoomState, viewerPlayerId: string): SanitizedRoomState {
  const individualChoiceStatus: Record<string, boolean> = {};
  for (const [pid, choice] of Object.entries(room.individualChoices)) {
    if (choice) {
      individualChoiceStatus[pid] = true;
    }
  }

  const isRevealOrLater = [
    'MISSION_REVEAL',
    'MISSION_COLLECTIVE_VOTE',
    'MISSION_TF_CHALLENGE',
    'MISSION_CONSEQUENCE',
    'POST_TEST',
    'GAME_SUMMARY',
    'FEEDBACK',
  ].includes(room.phase);

  const sanitized: SanitizedRoomState = {
    roomCode: room.roomCode,
    createdAt: room.createdAt,
    phase: room.phase,
    players: Object.fromEntries(Object.entries(room.players).map(([id, p]) => [id, id === viewerPlayerId ? p : {...p, preTestScore: undefined, postTestScore: undefined}])),
    perspectiveAssignments: room.perspectiveAssignments,
    hostId: room.hostId,
    currentRegionId: room.currentRegionId,
    completedMissionIds: room.completedMissionIds,
    activeMissionId: room.activeMissionId,
    destinationVotes: room.destinationVotes,
    sharedPerspectiveIds: room.sharedPerspectiveIds,
    unlockedContextIds: room.unlockedContextIds,
    revealedActors: room.revealedActors,
    futureLooks: room.futureLooks,
    isRaviSecondRoundActive: room.isRaviSecondRoundActive,
    individualChoiceStatus,
    collectiveVotes: room.collectiveVotes,
    collectiveVoteRound: room.collectiveVoteRound,
    isNonConsensualResult: room.isNonConsensualResult,
    nonConsensualActionIds: room.nonConsensualActionIds,
    chosenCollectiveActionId: room.chosenCollectiveActionId,
    tfAnsweredPlayers: room.tfAnsweredPlayers,
    unlockedDiscoveries: room.unlockedDiscoveries,
    historyLog: room.historyLog,
    myChoice: room.individualChoices[viewerPlayerId],
  };

  if (isRevealOrLater) {
    sanitized.revealedIndividualChoices = { ...room.individualChoices };
  }

  return sanitized;
}

// Broadcast updated room state to all connected room members
function broadcastRoomState(room: RoomState, notificationMsg?: string, notifVariant: 'info' | 'success' | 'warning' = 'info') {
  for (const [playerId] of Object.entries(room.players)) {
    const ws = playerToSocket.get(playerId);
    if (ws && ws.readyState === 1) {
      const sanitized = getSanitizedState(room, playerId);
      const payload: ServerMessage = {
        type: 'STATE_UPDATE',
        state: sanitized,
      };
      ws.send(JSON.stringify(payload));

      if (notificationMsg) {
        const notif: ServerMessage = {
          type: 'NOTIFICATION',
          message: notificationMsg,
          variant: notifVariant,
        };
        ws.send(JSON.stringify(notif));
      }
    }
  }
}

// Broadcast custom server message to room
function broadcastToRoom(roomCode: string, msg: ServerMessage) {
  const room = rooms.get(roomCode);
  if (!room) return;
  for (const [playerId] of Object.entries(room.players)) {
    const ws = playerToSocket.get(playerId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(msg));
    }
  }
}

export function handleClientDisconnect(ws: GameConnection) {
  const conn = socketToPlayer.get(ws);
  if (!conn) return;

  const { roomCode, playerId } = conn;
  socketToPlayer.delete(ws);
  if (playerToSocket.get(playerId) !== ws) return;
  playerToSocket.delete(playerId);

  const room = rooms.get(roomCode);
  if (!room) return;

  const player = room.players[playerId];
  if (player) {
    player.isConnected = false;

    // If host left, transfer host to next connected player
    if (room.hostId === playerId) {
      const activePlayers = Object.values(room.players).filter((p) => p.isConnected && !p.isBot && p.id !== playerId);
      if (activePlayers.length > 0) {
        const newHost = activePlayers[0];
        room.hostId = newHost.id;
        newHost.isHost = true;
        player.isHost = false;
      }
    }

    broadcastRoomState(room, `${player.nickname} desconectou-se. A partida continua com os jogadores ativos.`);
  }
}

export function handleClientMessage(ws: GameConnection, msg: ClientMessage) {
  if (!msg || typeof msg.type !== 'string') return;
  if (msg.type === 'CREATE_ROOM' || msg.type === 'JOIN_ROOM') {
    if (typeof msg.nickname !== 'string' || !['alex','joana','ravi','bia'].includes(msg.characterId) || !Number.isInteger(msg.variantIndex) || msg.variantIndex < 0 || msg.variantIndex > 20) return;
    if (msg.type === 'JOIN_ROOM' && typeof msg.roomCode !== 'string') return;
    if (socketToPlayer.has(ws) && !('sessionToken' in msg && msg.sessionToken)) return;
  }
  // 1. CREATE_ROOM
  if (msg.type === 'CREATE_ROOM') {
    let roomCode = generateRoomCode();
    while (rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const playerId = `p_${randomHex(4)}`;
    const sessionToken = randomHex(16);

    const newRoom: RoomState = {
      roomCode,
      createdAt: Date.now(),
      phase: 'LOBBY',
      players: {
        [playerId]: {
          id: playerId,
          nickname: msg.nickname.trim().slice(0, 16) || 'Guardião',
          characterId: msg.characterId,
          variantIndex: msg.variantIndex || 0,
          isHost: true,
          isReady: true,
          isConnected: true,
          hasUsedPower: false,
        },
      },
      hostId: playerId,
      currentRegionId: 'praca',
      completedMissionIds: [],
      destinationVotes: {},
      sharedPerspectiveIds: [],
      unlockedContextIds: [],
      revealedActors: [],
      futureLooks: [],
      isRaviSecondRoundActive: false,
      individualChoices: {},
      collectiveVotes: {},
      collectiveVoteRound: 1,
      isNonConsensualResult: false,
      tfAnsweredPlayers: {},
      unlockedDiscoveries: [],
      historyLog: [],
    };

    rooms.set(roomCode, newRoom);
    socketToPlayer.set(ws, { ws, playerId, roomCode, sessionToken });
    playerToSocket.set(playerId, ws);
    tokenToPlayer.set(sessionToken, { roomCode, playerId });

    const sanitized = getSanitizedState(newRoom, playerId);
    ws.send(
      JSON.stringify({
        type: 'ROOM_JOINED',
        roomCode,
        playerId,
        sessionToken,
        state: sanitized,
      })
    );
    return;
  }

  // 2. JOIN_ROOM / RECONNECT
  if (msg.type === 'JOIN_ROOM') {
    const code = msg.roomCode.trim().toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Código de sala não encontrado. Verifique os dados.' }));
      return;
    }

    // Check for reconnection via sessionToken
    if (msg.sessionToken && tokenToPlayer.has(msg.sessionToken)) {
      const existing = tokenToPlayer.get(msg.sessionToken)!;
      if (existing.roomCode === code && room.players[existing.playerId]) {
        const p = room.players[existing.playerId];
        p.isConnected = true;
        // Optionally update nickname / character if still in lobby
        if (room.phase === 'LOBBY') {
          p.nickname = msg.nickname.trim().slice(0, 16) || p.nickname;
          p.characterId = msg.characterId;
          p.variantIndex = msg.variantIndex || 0;
        }

        socketToPlayer.set(ws, { ws, playerId: p.id, roomCode: code, sessionToken: msg.sessionToken });
        playerToSocket.set(p.id, ws);

        const sanitized = getSanitizedState(room, p.id);
        ws.send(
          JSON.stringify({
            type: 'ROOM_JOINED',
            roomCode: code,
            playerId: p.id,
            sessionToken: msg.sessionToken,
            state: sanitized,
          })
        );
        broadcastRoomState(room, `${p.nickname} reconectou-se à sala.`);
        return;
      }
    }

    // New player joining
    const playerCount = Object.keys(room.players).length;
    if (playerCount >= 6) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'A sala já atingiu o limite máximo de 6 guardiões.' }));
      return;
    }

    if (room.phase !== 'LOBBY') {
      ws.send(
        JSON.stringify({
          type: 'ERROR',
          message: 'Esta partida já foi iniciada. Entre em uma nova sala ou solicite reinício.',
        })
      );
      return;
    }

    const playerId = `p_${randomHex(4)}`;
    const sessionToken = randomHex(16);

    room.players[playerId] = {
      id: playerId,
      nickname: msg.nickname.trim().slice(0, 16) || `Guardião ${playerCount + 1}`,
      characterId: msg.characterId,
      variantIndex: msg.variantIndex || 0,
      isHost: false,
      isReady: false,
      isConnected: true,
      hasUsedPower: false,
    };

    socketToPlayer.set(ws, { ws, playerId, roomCode: code, sessionToken });
    playerToSocket.set(playerId, ws);
    tokenToPlayer.set(sessionToken, { roomCode: code, playerId });

    const sanitized = getSanitizedState(room, playerId);
    ws.send(
      JSON.stringify({
        type: 'ROOM_JOINED',
        roomCode: code,
        playerId,
        sessionToken,
        state: sanitized,
      })
    );

    broadcastRoomState(room, `${room.players[playerId].nickname} entrou na sala!`);
    return;
  }

  // Find player connection for subsequent actions
  const conn = socketToPlayer.get(ws);
  if (!conn) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Sessão não identificada. Conecte-se novamente.' }));
    return;
  }

  const { roomCode, playerId } = conn;
  const room = rooms.get(roomCode);
  if (!room) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Sala inexistente.' }));
    return;
  }

  const player = room.players[playerId];
  if (!player) return;

  // 3. TOGGLE_READY
  if (msg.type === 'TOGGLE_READY') {
    if (room.phase !== 'LOBBY') return;
    player.isReady = !player.isReady;
    broadcastRoomState(room);
    return;
  }

  // 4. START_GAME (Host only)
  if (msg.type === 'START_GAME') {
    if (room.hostId !== playerId) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Apenas o anfitrião pode iniciar a partida.' }));
      return;
    }

    if (room.phase !== 'LOBBY' && room.phase !== 'GAME_SUMMARY') return;
    const humans = Object.values(room.players).filter(p => p.isConnected && !p.isBot);
    if (!humans.length || humans.some(p => !p.isReady)) return;
    if (humans.length === 1 && !Object.values(room.players).some(p => p.isBot)) {
      for (const characterId of ['alex','joana','ravi','bia'] as CharacterId[]) {
        if (characterId === player.characterId) continue;
        const id = `bot_${characterId}`;
        room.players[id] = {id, nickname: `${characterId.toUpperCase()} • computador`, characterId, variantIndex: 0, isBot: true, isHost: false, isReady: true, isConnected: true, hasUsedPower: false};
      }
    }
    room.completedMissionIds = []; room.historyLog = []; room.unlockedDiscoveries = []; room.destinationVotes = {};
    for (const p of Object.values(room.players)) {
      p.hasUsedPower = false; p.preTestCompleted = !!p.isBot; p.postTestCompleted = !!p.isBot;
      p.preTestScore = undefined; p.postTestScore = undefined;
    }
    // The four missions now form the complete journey; no mandatory diagnostic questionnaire.
    room.phase = 'BOARD_SELECT';
    broadcastRoomState(room, 'A jornada começou! Escolha o primeiro destino no mapa.');
    return;
  }

  // 5. SUBMIT_PRE_TEST
  if (msg.type === 'SUBMIT_PRE_TEST') {
    if (room.phase !== 'PRE_TEST' || player.preTestCompleted || !validAnswers(PRE_TEST_QUESTIONS, msg.answers)) return;
    player.preTestCompleted = true;
    let score = 0;
    for (const q of PRE_TEST_QUESTIONS) {
      const chosenOptId = msg.answers[q.id];
      const opt = q.options.find((o) => o.id === chosenOptId);
      if (opt?.isOptimal) score++;
    }
    player.preTestScore = score;

    // Record evaluation
    evaluationRecords.push({
      timestamp: Date.now(),
      roomCode: room.roomCode,
      playerId: player.id,
      preTestScore: score,
      preAnswers: msg.answers,
    });

    // Check if all connected players completed pre-test
    const allDone = Object.values(room.players)
      .filter((p) => p.isConnected)
      .every((p) => p.preTestCompleted);

    if (allDone) {
      room.phase = 'BOARD_SELECT';
      broadcastRoomState(room, 'Todos concluíram a avaliação inicial! O grupo agora decide o primeiro destino no mapa.');
    } else {
      broadcastRoomState(room);
    }
    return;
  }

  // 6. VOTE_DESTINATION (on the board)
  if (msg.type === 'VOTE_DESTINATION') {
    if (room.phase !== 'BOARD_SELECT') return;
    if (!MISSIONS.some(m => m.regionId === msg.regionId && !room.completedMissionIds.includes(m.id))) return;
    room.destinationVotes[playerId] = msg.regionId;
    broadcastRoomState(room);
    return;
  }

  // 7. CONFIRM_DESTINATION (Host or majority confirmation)
  if (msg.type === 'CONFIRM_DESTINATION') {
    if (room.hostId !== playerId) return;
    if (room.phase !== 'BOARD_SELECT') return;

    // Tally votes
    const votes = Object.values(room.destinationVotes);
    if (votes.length === 0) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Vote em uma região antes de confirmar o destino.' }));
      return;
    }

    const counts: Record<string, number> = {};
    for (const v of votes) counts[v] = (counts[v] || 0) + 1;
    let chosenRegion: RegionId = votes[0];
    let maxVotes = 0;
    for (const [reg, c] of Object.entries(counts)) {
      if (c > maxVotes) {
        maxVotes = c;
        chosenRegion = reg as RegionId;
      }
    }

    room.currentRegionId = chosenRegion;

    // Select an uncompleted mission for this region
    const availableForRegion = MISSIONS.filter(
      (m) => m.regionId === chosenRegion && !room.completedMissionIds.includes(m.id)
    );

    let nextMission = availableForRegion[0];
    if (!nextMission) {
      // If all missions in this region are done, pick any remaining mission from pool
      const remainingOverall = MISSIONS.filter((m) => !room.completedMissionIds.includes(m.id));
      nextMission = remainingOverall[0] || MISSIONS[0];
    }

    // Set mission and advance to MISSION_SITUATION
    startMission(room, nextMission.id);
    broadcastRoomState(room, `Destino escolhido: ${chosenRegion.toUpperCase()}! Iniciando nova missão.`);
    return;
  }

  // 8. START_MISSION directly
  if (msg.type === 'START_MISSION') {
    if (room.hostId !== playerId || room.phase !== 'BOARD_SELECT' || !MISSIONS.some(m => m.id === msg.missionId && !room.completedMissionIds.includes(m.id))) return;
    startMission(room, msg.missionId);
    broadcastRoomState(room);
    return;
  }

  if (msg.type === 'EXPLORE_MISSION') {
    if (room.hostId !== playerId || room.phase !== 'MISSION_SITUATION') return;
    room.phase = 'MISSION_EXPLORE'; broadcastRoomState(room); return;
  }
  if (msg.type === 'OPEN_COLLECTIVE_VOTE') {
    if (room.hostId !== playerId || room.phase !== 'MISSION_REVEAL') return;
    room.phase = 'MISSION_COLLECTIVE_VOTE'; broadcastRoomState(room); return;
  }
  if (msg.type === 'LEAVE_ROOM') {
    handleClientDisconnect(ws);
    if (room.phase === 'LOBBY') delete room.players[playerId];
    tokenToPlayer.delete(conn.sessionToken); broadcastRoomState(room); return;
  }
  // 9. SHARE_PERSPECTIVE
  if (msg.type === 'SHARE_PERSPECTIVE') {
    if (!['MISSION_SITUATION','MISSION_EXPLORE','MISSION_INDIVIDUAL_CHOICE'].includes(room.phase) || room.perspectiveAssignments?.[msg.perspectiveId] !== playerId) return;
    if (!room.sharedPerspectiveIds.includes(msg.perspectiveId)) {
      room.sharedPerspectiveIds.push(msg.perspectiveId);
      broadcastRoomState(room, `${player.nickname} compartilhou uma nova perspectiva com o grupo!`, 'success');
    }
    return;
  }

  // 10. USE_POWER (Alex, Joana, Ravi, Bia)
  if (msg.type === 'USE_POWER') {
    if (msg.powerType !== player.characterId || !['MISSION_EXPLORE','MISSION_INDIVIDUAL_CHOICE','MISSION_REVEAL'].includes(room.phase)) return;
    if (player.hasUsedPower) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Seu poder especial só pode ser usado uma vez por partida.' }));
      return;
    }

    const currentMission = MISSIONS.find((m) => m.id === room.activeMissionId);
    if (!currentMission) return;

    player.hasUsedPower = true;
    let powerDetails = '';

    if (msg.powerType === 'alex') {
      // Alex: reveals additional context
      for (const ctx of currentMission.additionalContexts) {
        if (!room.unlockedContextIds.includes(ctx.id)) {
          room.unlockedContextIds.push(ctx.id);
          powerDetails = `Informação contextual revelada: “${ctx.label}”`;
          break;
        }
      }
      if (!powerDetails && currentMission.additionalContexts.length > 0) {
        powerDetails = 'Todos os contextos conhecidos já haviam sido explorados.';
      }
    } else if (msg.powerType === 'joana') {
      // Joana: reveals 2 consequences
      room.futureLooks = [
        currentMission.actions[0]?.consequenceSummary || '',
        currentMission.actions[1]?.consequenceSummary || '',
      ];
      powerDetails = 'Duas consequências futuras plausíveis foram antecipadas para o debate.';
    } else if (msg.powerType === 'ravi') {
      // Ravi: triggers extra deliberation round
      room.isRaviSecondRoundActive = true;
      room.individualChoices = {}; room.phase = 'MISSION_INDIVIDUAL_CHOICE';
      powerDetails = 'Ravi ativou “Nova Escuta”! Uma rodada extra de reconsideração das escolhas está aberta.';
    } else if (msg.powerType === 'bia') {
      // Bia: reveals third actor perspective
      const unshared = currentMission.perspectives.find((p) => !room.sharedPerspectiveIds.includes(p.id));
      if (unshared) {
        room.sharedPerspectiveIds.push(unshared.id);
        room.revealedActors.push(unshared.actorName);
        powerDetails = `Perspectiva de ${unshared.actorName} (${unshared.actorRole}) foi ouvida pelo grupo.`;
      } else {
        powerDetails = 'Todas as perspectivas conhecidas já foram compartilhadas.';
      }
    }

    broadcastToRoom(room.roomCode, {
      type: 'POWER_ACTIVATED',
      characterId: player.characterId,
      playerName: player.nickname,
      powerName: msg.powerType.toUpperCase(),
      details: powerDetails,
    });

    broadcastRoomState(room, `${player.nickname} usou o poder de ${player.characterId.toUpperCase()}!`, 'success');
    return;
  }

  // 11. SUBMIT_INDIVIDUAL_CHOICE
  if (msg.type === 'SUBMIT_INDIVIDUAL_CHOICE') {
    if (room.phase !== 'MISSION_INDIVIDUAL_CHOICE' && room.phase !== 'MISSION_EXPLORE') {
      return;
    }
    if (!MISSIONS.find(m => m.id === room.activeMissionId)?.actions.some(a => a.id === msg.actionId)) return;
    room.individualChoices[playerId] = msg.actionId;
    fillBotChoices(room, false);

    // Check if all connected players submitted their secret choice
    const activeConnectedPlayers = Object.values(room.players).filter((p) => p.isConnected);
    const allSubmitted = activeConnectedPlayers.every((p) => room.individualChoices[p.id]);

    if (allSubmitted && activeConnectedPlayers.length >= 2) {
      room.phase = 'MISSION_REVEAL';
      broadcastRoomState(room, 'Todos responderam em sigilo! As escolhas foram reveladas simultaneamente.', 'success');
    } else {
      broadcastRoomState(room);
    }
    return;
  }

  // 12. PROCEED_TO_REVEAL
  if (msg.type === 'PROCEED_TO_REVEAL') {
    if (room.hostId === playerId && Object.values(room.players).filter(p => p.isConnected).every(p => room.individualChoices[p.id]) && (room.phase === 'MISSION_INDIVIDUAL_CHOICE' || room.phase === 'MISSION_EXPLORE')) {
      room.phase = 'MISSION_REVEAL';
      broadcastRoomState(room, 'Revelando escolhas individuais e perspectivas dos atores.');
    }
    return;
  }

  // 13. SUBMIT_COLLECTIVE_VOTE
  if (msg.type === 'SUBMIT_COLLECTIVE_VOTE') {
    if (room.phase !== 'MISSION_COLLECTIVE_VOTE' || !MISSIONS.find(m => m.id === room.activeMissionId)?.actions.some(a => a.id === msg.actionId)) return;
    room.collectiveVotes[playerId] = msg.actionId;
    fillBotChoices(room, true);

    const activePlayers = Object.values(room.players).filter((p) => p.isConnected);
    const allVoted = activePlayers.every((p) => room.collectiveVotes[p.id]);

    if (allVoted) {
      // Tally collective votes
      tallyCollectiveVotes(room);
    } else {
      broadcastRoomState(room);
    }
    return;
  }

  // 14. CONTINUE_WITHOUT_DISCONNECTED
  if (msg.type === 'CONTINUE_WITHOUT_DISCONNECTED') {
    if (room.hostId !== playerId) return;
    if (['MISSION_INDIVIDUAL_CHOICE','MISSION_EXPLORE'].includes(room.phase) && Object.values(room.players).filter(p => p.isConnected).every(p => room.individualChoices[p.id])) {
      room.phase = 'MISSION_REVEAL';
      broadcastRoomState(room, 'Prosseguindo com os guardiões ativos conectados.');
    } else if (room.phase === 'MISSION_COLLECTIVE_VOTE') {
      tallyCollectiveVotes(room);
    }
    return;
  }

  // 15. SUBMIT_TF_ANSWER
  if (msg.type === 'SUBMIT_TF_ANSWER') {
    if (room.phase !== 'MISSION_TF_CHALLENGE' || typeof msg.answer !== 'boolean') return;
    room.tfAnsweredPlayers[playerId] = msg.answer;
    broadcastRoomState(room);
    return;
  }

  // 16. PROCEED_AFTER_CONSEQUENCE
  if (msg.type === 'PROCEED_AFTER_CONSEQUENCE') {
    if (room.hostId !== playerId) return;
    if (room.phase === 'MISSION_TF_CHALLENGE') {
      if (!Object.values(room.players).filter(p => p.isConnected && !p.isBot).every(p => typeof room.tfAnsweredPlayers[p.id] === 'boolean')) return;
      room.phase = 'MISSION_CONSEQUENCE';
      broadcastRoomState(room);
      return;
    }

    if (room.phase === 'MISSION_CONSEQUENCE') {
      // Record completed mission
      if (room.activeMissionId && !room.completedMissionIds.includes(room.activeMissionId)) {
        room.completedMissionIds.push(room.activeMissionId);
      }

      // Check if 4 missions are completed
      if (room.completedMissionIds.length >= 4) {
        room.phase = 'GAME_SUMMARY';
        broadcastRoomState(room, 'Parabéns! As quatro missões foram concluídas. Veja suas descobertas e o resumo da jornada.');
      } else {
        // Return to board for next destination
        room.phase = 'BOARD_SELECT';
        room.destinationVotes = {};
        broadcastRoomState(
          room,
          `Missão concluída com sucesso! Missões cumpridas: ${room.completedMissionIds.length}/4. Escolham o próximo destino.`
        );
      }
      return;
    }
    return;
  }

  // 17. SUBMIT_POST_TEST
  if (msg.type === 'SUBMIT_POST_TEST') {
    if (room.phase !== 'POST_TEST' || player.postTestCompleted || !validAnswers(POST_TEST_QUESTIONS, msg.answers)) return;
    player.postTestCompleted = true;
    let score = 0;
    for (const q of POST_TEST_QUESTIONS) {
      const chosenOptId = msg.answers[q.id];
      const opt = q.options.find((o) => o.id === chosenOptId);
      if (opt?.isOptimal) score++;
    }
    player.postTestScore = score;

    // Record evaluation
    const rec = [...evaluationRecords].reverse().find((r) => r.roomCode === room.roomCode && r.playerId === player.id);
    if (rec) {
      rec.postTestScore = score;
      rec.postAnswers = msg.answers;
    } else {
      evaluationRecords.push({
        timestamp: Date.now(),
        roomCode: room.roomCode,
        playerId: player.id,
        postTestScore: score,
        postAnswers: msg.answers,
      });
    }

    const allDone = Object.values(room.players)
      .filter((p) => p.isConnected)
      .every((p) => p.postTestCompleted);

    if (allDone) {
      room.phase = 'GAME_SUMMARY';
      broadcastRoomState(room, 'Todos concluíram a avaliação final! Vejam o resumo da jornada coletiva.');
    } else {
      broadcastRoomState(room);
    }
    return;
  }

  // 18. SUBMIT_FEEDBACK
  if (msg.type === 'SUBMIT_FEEDBACK') {
    if (!['GAME_SUMMARY','FEEDBACK'].includes(room.phase) || ![msg.usability,msg.clarity,msg.interest].every(n => Number.isInteger(n) && n >= 1 && n <= 5) || (msg.comment !== undefined && typeof msg.comment !== 'string') || feedbackRecords.some(f => f.roomCode === roomCode && f.playerId === playerId)) return;
    feedbackRecords.push({
      timestamp: Date.now(),
      roomCode: room.roomCode,
      playerId: player.id,
      usability: msg.usability,
      clarity: msg.clarity,
      interest: msg.interest,
      comment: msg.comment?.trim().slice(0, 500),
    });
    ws.send(JSON.stringify({ type: 'NOTIFICATION', message: 'Obrigado pela sua avaliação!', variant: 'success' }));
    return;
  }
}

function startMission(room: RoomState, missionId: string) {
  const mission = MISSIONS.find((m) => m.id === missionId) || MISSIONS[0];
  room.activeMissionId = mission.id;
  room.currentRegionId = mission.regionId;
  room.phase = 'MISSION_SITUATION';
  room.individualChoices = {};
  room.collectiveVotes = {};
  room.collectiveVoteRound = 1;
  room.isNonConsensualResult = false;
  room.nonConsensualActionIds = undefined;
  room.chosenCollectiveActionId = undefined;
  room.sharedPerspectiveIds = [];
  room.unlockedContextIds = [];
  room.revealedActors = [];
  room.futureLooks = [];
  room.isRaviSecondRoundActive = false;
  room.tfAnsweredPlayers = {};

  const playerIds = Object.keys(room.players);
  room.perspectiveAssignments = Object.fromEntries(mission.perspectives.map((p, i) => [p.id, playerIds[i % playerIds.length]]));
  for (const p of mission.perspectives) {
    if (room.players[room.perspectiveAssignments[p.id]]?.isBot) room.sharedPerspectiveIds.push(p.id);
  }
  // Always share at least the first perspective or let players share
  if (mission.perspectives[0]) {
    room.sharedPerspectiveIds.push(mission.perspectives[0].id);
  }
}

function tallyCollectiveVotes(room: RoomState) {
  const mission = MISSIONS.find((m) => m.id === room.activeMissionId);
  if (!mission) return;

  const counts: Record<string, number> = {};
  for (const p of Object.values(room.players).filter(p => p.isConnected)) {
    const actId = room.collectiveVotes[p.id];
    if (!actId) continue;
    counts[actId] = (counts[actId] || 0) + 1;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return;

  const topCount = sorted[0][1];
  const tiedTop = sorted.filter((s) => s[1] === topCount);

  if (tiedTop.length > 1) {
    // TIE!
    if (room.collectiveVoteRound === 1) {
      // Offer an additional round
      room.collectiveVoteRound = 2;
      room.collectiveVotes = {};
      broadcastRoomState(
        room,
        'Houve um empate na votação! Uma segunda rodada de deliberação está aberta para construir consenso.',
        'warning'
      );
      return;
    } else {
      // Persistent tie: Show non-consensual outcome and compare both paths
      room.isNonConsensualResult = true;
      room.nonConsensualActionIds = [tiedTop[0][0], tiedTop[1][0]];
      room.chosenCollectiveActionId = tiedTop[0][0]; // For fallback consequence text
    }
  } else {
    // Clear majority or unanimity
    room.isNonConsensualResult = false;
    room.chosenCollectiveActionId = sorted[0][0];
  }

  // Log history
  const activeCount = Object.values(room.players).filter((p) => p.isConnected).length;
  room.historyLog.push({
    timestamp: Date.now(),
    missionId: mission.id,
    actionChosenId: room.chosenCollectiveActionId || mission.actions[0].id,
    voteType: room.isNonConsensualResult
      ? 'non_consensual'
      : topCount === activeCount
      ? 'unanimous'
      : 'majority',
    perspectivesExploredCount: room.sharedPerspectiveIds.length,
    reconsiderationOccurred: room.collectiveVoteRound > 1 || room.isRaviSecondRoundActive,
  });

  // Unlock discovery token
  if (!room.unlockedDiscoveries.includes(mission.discovery.key)) {
    room.unlockedDiscoveries.push(mission.discovery.key);
  }

  // Check if mission has True/False challenge
  if (mission.tfChallenge) {
    room.phase = 'MISSION_TF_CHALLENGE';
  } else {
    room.phase = 'MISSION_CONSEQUENCE';
  }

  broadcastRoomState(room, 'Deliberação concluída! Revelando os desdobramentos.', 'success');
}

function validAnswers(questions: typeof PRE_TEST_QUESTIONS, answers: Record<string, string>) {
  return !!answers && typeof answers === 'object' && questions.every(q => q.options.some(o => o.id === answers[q.id]));
}
// Scripted companions choose by their character's approach, without reading human choices or answer keys.
function fillBotChoices(room: RoomState, collective: boolean) {
  const mission = MISSIONS.find(m => m.id === room.activeMissionId);
  if (!mission) return;
  const preferences: Record<CharacterId, string[]> = {alex:['cautela','orientacao'], joana:['orientacao','formalizacao'], ravi:['dialogo','orientacao'], bia:['acolhimento','dialogo']};
  for (const bot of Object.values(room.players).filter(p => p.isBot)) {
    const preferred = preferences[bot.characterId];
    const action = preferred.map(type => mission.actions.find(a => a.actionType === type)).find(Boolean) || mission.actions[0];
    (collective ? room.collectiveVotes : room.individualChoices)[bot.id] = action.id;
  }
}

export function snapshot() {return {rooms: [...rooms], tokens: [...tokenToPlayer], evaluations: evaluationRecords, feedback: feedbackRecords};}
export function restore(data: ReturnType<typeof snapshot>) {
  rooms.clear(); tokenToPlayer.clear(); socketToPlayer.clear(); playerToSocket.clear();
  for (const [k,v] of data.rooms) rooms.set(k,v);
  for (const [k,v] of data.tokens) tokenToPlayer.set(k,v);
  evaluationRecords.splice(0,evaluationRecords.length,...data.evaluations);
  feedbackRecords.splice(0,feedbackRecords.length,...data.feedback);
}
