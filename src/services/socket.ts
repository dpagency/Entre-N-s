import { ClientMessage, SanitizedRoomState, ServerMessage } from '../types/game';
import * as engine from '../game/engine';

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
  public sessionToken: string | null = null;

  private intentionallyClosed = false;

  constructor() {
    // Migrate an unfinished journey from the previous tab-scoped storage.
    // Never overwrite an existing persistent journey with stale session data.
    const keys = ['entre-nos-mode', 'entre-nos-solo', 'guardioes_session_token', 'guardioes_room_code', 'guardioes_player_id'];
    for (const key of keys) {
      const previous = sessionStorage.getItem(key);
      if (previous !== null && localStorage.getItem(key) === null) {
        localStorage.setItem(key, previous);
      }
      sessionStorage.removeItem(key);
    }
    this.localMode = localStorage.getItem('entre-nos-mode') === 'solo';
    // Restore session credentials across reloads and browser restarts on this device
    const savedToken = localStorage.getItem('guardioes_session_token');
    const savedRoom = localStorage.getItem('guardioes_room_code');
    const savedPid = localStorage.getItem('guardioes_player_id');
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
      const saved = localStorage.getItem('entre-nos-solo');
      if (saved) {try {engine.restore(JSON.parse(saved));} catch {localStorage.removeItem('entre-nos-solo');}}
    }
    this.isConnected = true;
    this.notifyConnection(true);
    if (this.sessionToken && this.roomCode) this.send({type:'JOIN_ROOM',roomCode:this.roomCode,sessionToken:this.sessionToken,nickname:localStorage.getItem('guardioes_nickname') || 'Guardião',characterId:(localStorage.getItem('guardioes_character') as any) || 'alex',variantIndex:Number(localStorage.getItem('guardioes_variant')) || 0});
  }

  public setSoloMode(solo: boolean) {
    this.intentionallyClosed = false;
    this.localMode = solo;
    localStorage.setItem('entre-nos-mode',solo ? 'solo' : 'online');
  }

  public send(msg: ClientMessage) {
    this.queue = this.queue.then(async () => {
      if (this.localMode) {
        engine.handleClientMessage(this.localConnection,msg);
        localStorage.setItem('entre-nos-solo',JSON.stringify(engine.snapshot()));
      } else await this.request(msg);
    }).catch(error => this.errorListeners.forEach(l => l(error.message || 'Falha na conexão')));
  }

  private async request(message?: ClientMessage) {
    const response = await fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,sessionToken:this.sessionToken,roomCode:this.roomCode})});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível conectar à sala.');
    for (const frame of data.frames) this.handleServerMessage(frame);
    if (this.pollTimer) clearTimeout(this.pollTimer);
    if (this.roomCode && !this.intentionallyClosed) this.pollTimer = setTimeout(() => {
      this.queue = this.queue.then(() => this.request()).catch(error => {
        this.errorListeners.forEach(l => l(error.message));
        if (!this.intentionallyClosed) this.pollTimer = setTimeout(() => this.send({type:'JOIN_ROOM',roomCode:this.roomCode!,sessionToken:this.sessionToken!,nickname:localStorage.getItem('guardioes_nickname') || 'Guardião',characterId:(localStorage.getItem('guardioes_character') as any) || 'alex',variantIndex:Number(localStorage.getItem('guardioes_variant')) || 0}),3000);
      });
    },1500);
  }

  private handleServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case 'ROOM_JOINED':
        this.roomCode = msg.roomCode;
        this.myPlayerId = msg.playerId;
        this.sessionToken = msg.sessionToken;

        localStorage.setItem('guardioes_session_token', msg.sessionToken);
        localStorage.setItem('guardioes_room_code', msg.roomCode);
        localStorage.setItem('guardioes_player_id', msg.playerId);

        this.stateListeners.forEach((l) => l(msg.state));
        break;

      case 'STATE_UPDATE':
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
    else fetch('/api/game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...credentials,message:{type:'LEAVE_ROOM'}}),keepalive:true}).catch(()=>{});
    this.intentionallyClosed = true;
    if (this.pollTimer) clearTimeout(this.pollTimer);
    localStorage.removeItem('entre-nos-solo');
    localStorage.removeItem('guardioes_session_token');
    localStorage.removeItem('guardioes_room_code');
    localStorage.removeItem('guardioes_player_id');
    this.roomCode = null;
    this.myPlayerId = null;
    this.sessionToken = null;

  }
}

export const socketService = new GameSocketService();
