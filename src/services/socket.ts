import { archiveSnapshot, migrateLegacySave, loadAttempt } from './journeyStorage';
import { browserStorage } from './browserStorage';
import { INSTITUTIONAL } from '../distribution';
import { ClientMessage, SanitizedRoomState, ServerMessage } from '../types/game';
import * as engine from '../game/engine';
import { playableJourney } from '../data/journeys';

type StateListener = (state: SanitizedRoomState) => void;
type ErrorListener = (message: string) => void;
type NotificationListener = (message: string, variant?: 'info' | 'success' | 'warning') => void;
type PowerListener = (msg: Extract<ServerMessage, { type: 'POWER_ACTIVATED' }>) => void;
type ConnectionListener = (connected: boolean) => void;

class GameSocketService {
  private stateListeners = new Set<StateListener>();
  private errorListeners = new Set<ErrorListener>();
  private notificationListeners = new Set<NotificationListener>();
  private powerListeners = new Set<PowerListener>();
  private connectionListeners = new Set<ConnectionListener>();

  public isConnected = false;
  public myPlayerId: string | null = null;
  public roomCode: string | null = null;
  public learningId: string | null = null;
  public activeMissionId: string | null = null;
  public sessionToken: string | null = null;

  private intentionallyClosed = false;

  constructor() {
    // Migrate an unfinished journey from the previous tab-scoped storage.
    // Never overwrite an existing persistent journey with stale session data.
    const keys = ['entre-nos-mode', 'entre-nos-solo', 'guardioes_session_token', 'guardioes_room_code', 'guardioes_player_id'];
    // Preserve the complete old tab save before retiring its active credentials.
    const tabEntries = keys.map(key => {
      try { return [key, sessionStorage.getItem(key)] as const; } catch { return [key, null] as const; }
    });
    if (tabEntries.some(([, value]) => value !== null)) {
      const identity = tabEntries.find(([key]) => key === 'guardioes_session_token')?.[1]
        || tabEntries.find(([key]) => key === 'guardioes_room_code')?.[1] || 'unidentified';
      const backupKey = 'entre-nos-journeys-v1-tab-backup-' + encodeURIComponent(identity);
      if (browserStorage.getItem(backupKey) === null) browserStorage.setItem(backupKey, JSON.stringify(tabEntries));
    }
    for (const key of keys) {
      let previous: string | null = null;
      try { previous = sessionStorage.getItem(key); } catch { /* Storage may be denied. */ }
      if (previous !== null && browserStorage.getItem(key) === null) {
        browserStorage.setItem(key, previous);
      }
      try { sessionStorage.removeItem(key); } catch { /* The backup remains available. */ }
    }
    // This pilot is solo-only. A previously saved online waiting room must not
    // override the solo welcome screen after an upgrade. Preserve solo snapshots.
    const previousRoom = browserStorage.getItem('guardioes_room_code');
    const previousToken = browserStorage.getItem('guardioes_session_token');
    let savedSoloContainsSession = false;
    try {
      const savedSolo = JSON.parse(browserStorage.getItem('entre-nos-solo') || 'null');
      savedSoloContainsSession = !!previousRoom && !!previousToken
        && Array.isArray(savedSolo?.rooms)
        && savedSolo.rooms.some(([code]: [string, unknown]) => code === previousRoom)
        && Array.isArray(savedSolo?.tokens)
        && savedSolo.tokens.some(([token]: [string, unknown]) => token === previousToken);
    } catch { /* A malformed snapshot must not retain stale online credentials. */ }
    if (previousRoom && !savedSoloContainsSession && !browserStorage.getItem('entre-nos-solo')) {
      browserStorage.removeItem('guardioes_session_token');
      browserStorage.removeItem('guardioes_room_code');
      browserStorage.removeItem('guardioes_player_id');
    }
    this.localMode = true;
    browserStorage.setItem('entre-nos-mode', 'solo');
    // Restore session credentials across reloads and browser restarts on this device
    const savedToken = browserStorage.getItem('guardioes_session_token');
    const savedRoom = browserStorage.getItem('guardioes_room_code');
    const savedPid = browserStorage.getItem('guardioes_player_id');
    if (savedToken && savedRoom && savedPid) {
      this.sessionToken = savedToken;
      this.roomCode = savedRoom;
      this.myPlayerId = savedPid;
    }
  }

  private localMode = false;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private queue: Promise<void> = Promise.resolve();
  private localConnection = {readyState: 1, send: (data: string) => this.handleServerMessage(JSON.parse(data))};

  public async connect(): Promise<void> {
    this.intentionallyClosed = false;
    if (this.localMode) {
      const saved = browserStorage.getItem('entre-nos-solo');
      if (saved) {
        try { migrateLegacySave(browserStorage); engine.restore(JSON.parse(saved)); }
        catch {
          this.errorListeners.forEach(l => l('Não foi possível migrar o salvamento. O original foi preservado.'));
          return;
        }
      }
    }
    this.isConnected = true;
    this.notifyConnection(true);
    // Wait for an explicit decision: resume the saved journey or start a new one.
  }


  public hasSavedJourney(): boolean {
    if (!this.sessionToken || !this.roomCode || !this.myPlayerId) return false;
    try {
      const saved = JSON.parse(browserStorage.getItem('entre-nos-solo') || 'null');
      return Array.isArray(saved?.rooms) && saved.rooms.some(([code]: [string, unknown]) => code === this.roomCode);
    } catch { return false; }
  }

  public resumeSavedJourney(): void {
    if (!this.hasSavedJourney() || !this.roomCode || !this.sessionToken) return;
    if (INSTITUTIONAL && engine.snapshot().rooms.find(([code]) => code === this.roomCode)?.[1].pilotVersion !== 2) {
      this.errorListeners.forEach(listener => listener('Esta partida usa a dinâmica anterior e foi preservada. Retome-a na edição original ou inicie uma nova partida nesta edição.'));
      return;
    }
    const savedRoom = engine.snapshot().rooms.find(([code]) => code === this.roomCode)?.[1];
    try { playableJourney(savedRoom?.journeyDefinitionId); } catch { this.errorListeners.forEach(l => l('Esta jornada está disponível somente para testes locais. O progresso foi preservado.')); return; }
    this.send({type:'JOIN_ROOM',roomCode:this.roomCode,sessionToken:this.sessionToken,nickname:browserStorage.getItem('guardioes_nickname') || 'Jogador',characterId:(browserStorage.getItem('guardioes_character') as any) || 'alex',variantIndex:Number(browserStorage.getItem('guardioes_variant')) || 0});
  }

  // Restore the selected attempt without erasing other archived journeys.
  public resumeAttempt(journey: string, attempt: string): void {
    this.queue = this.queue.then(() => {
      playableJourney(journey);
      const record = loadAttempt(browserStorage, journey, attempt);
      if (!record?.credentials) throw new Error('Partida sem credenciais de retomada.');
      archiveSnapshot(browserStorage, engine.snapshot());
      engine.handleClientDisconnect(this.localConnection);
      engine.restore(record.snapshot as ReturnType<typeof engine.snapshot>);
      this.localMode = true;
      this.roomCode = record.credentials.roomCode;
      this.sessionToken = record.credentials.sessionToken;
      this.myPlayerId = record.credentials.playerId;
      browserStorage.setItem('entre-nos-solo', JSON.stringify(engine.snapshot()));
      browserStorage.setItem('guardioes_room_code', this.roomCode);
      browserStorage.setItem('guardioes_session_token', this.sessionToken);
      browserStorage.setItem('guardioes_player_id', this.myPlayerId);
      this.resumeSavedJourney();
    }).catch(error => this.errorListeners.forEach(l => l(error.message)));
  }

  public startNewJourney(journey: string, profile: { nickname: string; variantIndex: number }): Promise<void> {
    const task = this.queue.then(() => {
      const definition = playableJourney(journey);
      migrateLegacySave(browserStorage);
      archiveSnapshot(browserStorage, engine.snapshot());
      engine.handleClientDisconnect(this.localConnection);
      this.localMode = true;
      this.intentionallyClosed = false;
      this.roomCode = this.myPlayerId = this.sessionToken = this.learningId = this.activeMissionId = null;
      browserStorage.setItem('entre-nos-mode', 'solo');
      browserStorage.setItem('guardioes_nickname', profile.nickname);
      browserStorage.setItem('guardioes_variant', String(profile.variantIndex));
      browserStorage.setItem('guardioes_character', 'alex');
      browserStorage.setItem('entre-nos-selected-journey', definition.id);
      engine.handleClientMessage(this.localConnection, { type: 'CREATE_ROOM', pilotVersion: 2,
        journeyDefinitionId: definition.id, nickname: profile.nickname, variantIndex: profile.variantIndex, characterId: 'alex' });
      engine.handleClientMessage(this.localConnection, { type: 'START_GAME' });
      archiveSnapshot(browserStorage, engine.snapshot());
      browserStorage.setItem('entre-nos-solo', JSON.stringify(engine.snapshot()));
    });
    this.queue = task.catch(error => this.errorListeners.forEach(l => l(error.message)));
    return task;
  }

  public discardSavedJourney(): void {
    // A new solo room must not reuse a connection still bound to the previous player.
    if (this.localMode) { migrateLegacySave(browserStorage); archiveSnapshot(browserStorage, engine.snapshot()); engine.handleClientDisconnect(this.localConnection); }
    this.sessionToken = null;
    this.roomCode = null;
    this.myPlayerId = null;
    this.activeMissionId = null;
    this.learningId = null;
    for (const key of ['entre-nos-solo','guardioes_session_token','guardioes_room_code','guardioes_player_id']) browserStorage.removeItem(key);
  }

  public setSoloMode(solo: boolean) {
    this.intentionallyClosed = false;
    this.localMode = INSTITUTIONAL || solo;
    browserStorage.setItem('entre-nos-mode',this.localMode ? 'solo' : 'online');
  }

  public send(msg: ClientMessage) {
    this.queue = this.queue.then(async () => {
      if (this.localMode) {
        // Preserve the current attempt before START_GAME can replace its room state.
        migrateLegacySave(browserStorage);
        archiveSnapshot(browserStorage, engine.snapshot());
        engine.handleClientMessage(this.localConnection,msg);
        archiveSnapshot(browserStorage, engine.snapshot());
        browserStorage.setItem('entre-nos-solo',JSON.stringify(engine.snapshot()));
      } else await this.request(msg);
    }).catch(error => this.errorListeners.forEach(l => l(error.message || 'Falha na conexão')));
  }

  private async request(message?: ClientMessage) {
    if (INSTITUTIONAL) throw new Error('Esta distribuição executa somente partidas locais.');
    const response = await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,sessionToken:this.sessionToken,roomCode:this.roomCode})});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível conectar à sala.');
    for (const frame of data.frames) this.handleServerMessage(frame);
    if (this.pollTimer) clearTimeout(this.pollTimer);
    if (this.roomCode && !this.intentionallyClosed) this.pollTimer = setTimeout(() => {
      this.queue = this.queue.then(() => this.request()).catch(error => {
        this.errorListeners.forEach(l => l(error.message));
        if (!this.intentionallyClosed) this.pollTimer = setTimeout(() => this.send({type:'JOIN_ROOM',roomCode:this.roomCode!,sessionToken:this.sessionToken!,nickname:browserStorage.getItem('guardioes_nickname') || 'Guardião',characterId:(browserStorage.getItem('guardioes_character') as any) || 'alex',variantIndex:Number(browserStorage.getItem('guardioes_variant')) || 0}),3000);
      });
    },1500);
  }

  private handleServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case 'ROOM_JOINED':
        this.learningId = msg.state.journeyId || msg.roomCode;
        this.activeMissionId = msg.state.activeMissionId ?? null;
        this.roomCode = msg.roomCode;
        this.myPlayerId = msg.playerId;
        this.sessionToken = msg.sessionToken;

        browserStorage.setItem('guardioes_session_token', msg.sessionToken);
        browserStorage.setItem('guardioes_room_code', msg.roomCode);
        browserStorage.setItem('guardioes_player_id', msg.playerId);

        this.stateListeners.forEach((l) => l(msg.state));
        break;

      case 'STATE_UPDATE':
        this.learningId = msg.state.journeyId || msg.state.roomCode;
        this.activeMissionId = msg.state.activeMissionId ?? null;
        this.stateListeners.forEach((l) => l(msg.state));
        break;

      case 'ERROR':
        this.errorListeners.forEach((l) => l(msg.message));
        break;

      case 'NOTIFICATION':
        this.notificationListeners.forEach((l) => l(msg.message, msg.variant));
        break;

      case 'POWER_ACTIVATED':
        this.powerListeners.forEach((l) => l(msg));
        break;
    }
  }

  public onState(cb: StateListener) {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  public onError(cb: ErrorListener) {
    this.errorListeners.add(cb);
    return () => this.errorListeners.delete(cb);
  }

  public onNotification(cb: NotificationListener) {
    this.notificationListeners.add(cb);
    return () => this.notificationListeners.delete(cb);
  }

  public onPower(cb: PowerListener) {
    this.powerListeners.add(cb);
    return () => this.powerListeners.delete(cb);
  }

  public onConnection(cb: ConnectionListener) {
    this.connectionListeners.add(cb);
    return () => this.connectionListeners.delete(cb);
  }

  private notifyConnection(val: boolean) {
    this.connectionListeners.forEach((l) => l(val));
  }

  public leaveRoom() {
    const credentials = {sessionToken:this.sessionToken,roomCode:this.roomCode};
    if (this.localMode) engine.handleClientDisconnect(this.localConnection);
    else if (!INSTITUTIONAL) fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...credentials,message:{type:'LEAVE_ROOM'}}),keepalive:true}).catch(()=>{});
    this.intentionallyClosed = true;
    if (this.pollTimer) clearTimeout(this.pollTimer);
    browserStorage.removeItem('entre-nos-solo');
    browserStorage.removeItem('guardioes_session_token');
    browserStorage.removeItem('guardioes_room_code');
    browserStorage.removeItem('guardioes_player_id');
    this.roomCode = null;
    this.myPlayerId = null;
    this.sessionToken = null;

  }
}

export const socketService = new GameSocketService();
