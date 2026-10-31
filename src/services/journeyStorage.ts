import type { RoomState } from '../types/game';
import { ORIGINAL_JOURNEY_ID } from '../data/journeys';

// This archive is additive. The old active snapshot remains a compatibility cache.
export const LEGACY_BACKUP_KEY = 'entre-nos-journeys-v1-legacy-backup';
const INDEX = 'entre-nos-journeys-v1-index';
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>;
type Snapshot = { rooms: [string, RoomState][]; tokens: unknown[]; evaluations: unknown[]; feedback: unknown[] };
export interface AttemptRef { journey: string; attempt: string; key: string }
export interface SavedAttempt extends AttemptRef {
  schemaVersion: 1;
  snapshot: Snapshot;
  credentials: { roomCode: string; sessionToken: string; playerId: string } | null;
}
const attemptKey = (journey: string, attempt: string) =>
  'entre-nos-journeys-v1-attempt-' + encodeURIComponent(journey) + '-' + encodeURIComponent(attempt);

function write(storage: Storage, key: string, value: string) {
  storage.setItem(key, value);
  if (storage.getItem(key) !== value) throw new Error('Não foi possível preservar a partida.');
}

export function listAttempts(storage: Storage): AttemptRef[] {
  const raw = storage.getItem(INDEX);
  if (!raw) return [];
  const index = JSON.parse(raw);
  if (!Array.isArray(index) || index.some(r => !r || typeof r.journey !== 'string' || typeof r.attempt !== 'string' || r.key !== attemptKey(r.journey, r.attempt))) {
    throw new Error('Índice de partidas inválido; dados preservados para recuperação.');
  }
  return index;
}

export function archiveSnapshot(storage: Storage, snapshot: Snapshot): void {
  const index = listAttempts(storage);
  for (const [roomCode, room] of snapshot.rooms) {
    const journey = room.journeyDefinitionId || ORIGINAL_JOURNEY_ID;
    const attempt = room.journeyId || 'legacy-' + roomCode + '-' + room.createdAt;
    const key = attemptKey(journey, attempt);
    const token = (snapshot.tokens as [string, { roomCode: string; playerId: string }][])
      .find(([, session]) => session.roomCode === roomCode && !room.players[session.playerId]?.isBot);
    const record: SavedAttempt = { schemaVersion: 1, journey, attempt, key,
      snapshot: { ...snapshot, rooms: [[roomCode, structuredClone(room)]],
        tokens: snapshot.tokens.filter(entry => (entry as [string, { roomCode: string }])[1].roomCode === roomCode) },
      credentials: token ? { roomCode, sessionToken: token[0], playerId: token[1].playerId } : null };
    write(storage, key, JSON.stringify(record));
    if (!index.some(r => r.key === key)) index.push({ journey, attempt, key });
  }
  write(storage, INDEX, JSON.stringify(index));
}

export function loadAttempt(storage: Storage, journey: string, attempt: string): SavedAttempt | null {
  const key = attemptKey(journey, attempt);
  const raw = storage.getItem(key);
  if (!raw) return null;
  const record = JSON.parse(raw) as SavedAttempt;
  if (record.schemaVersion !== 1 || record.journey !== journey || record.attempt !== attempt || record.key !== key
      || record.snapshot.rooms.length !== 1) throw new Error('Partida incompatível; registro não alterado.');
  return record;
}

export function migrateLegacySave(storage: Storage): void {
  const raw = storage.getItem('entre-nos-solo');
  if (!raw) return;
  // Back up exact bytes, including malformed data, before interpreting anything.
  if (storage.getItem(LEGACY_BACKUP_KEY) === null) write(storage, LEGACY_BACKUP_KEY, JSON.stringify({
    snapshot: raw,
    credentials: ['guardioes_room_code', 'guardioes_session_token', 'guardioes_player_id'].map(k => [k, storage.getItem(k)]),
  }));
  const snapshot = JSON.parse(raw) as Snapshot;
  if (!Array.isArray(snapshot.rooms) || !Array.isArray(snapshot.tokens)
      || !Array.isArray(snapshot.evaluations) || !Array.isArray(snapshot.feedback)
      || snapshot.rooms.some(entry => !Array.isArray(entry) || !entry[1]?.players || !Number.isFinite(entry[1]?.createdAt))) {
    throw new Error('Salvamento anterior inválido; cópia original preservada.');
  }
  archiveSnapshot(storage, snapshot);
}
