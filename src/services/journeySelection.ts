import type { JourneyDefinition } from '../data/journeys';
import { journeyDefinition, isJourneyAvailable } from '../data/journeys';
import type { RoomState } from '../types/game';
import { listAttempts, loadAttempt, migrateLegacySave, type SavedAttempt } from './journeyStorage';

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>;
export function savedJourneyAttempts(storage: Storage, journey: string): SavedAttempt[] {
  migrateLegacySave(storage);
  const candidates = listAttempts(storage).slice().reverse().filter(ref => ref.journey === journey)
    .map(ref => loadAttempt(storage, ref.journey, ref.attempt))
    .filter((record): record is SavedAttempt => !!record?.credentials && record.snapshot.rooms[0][1].pilotVersion === 2);
  // Preserve resumability of old lobby saves; suppress only redundant pre-start checkpoints.
  const records = candidates.filter(record => {
    const room = record.snapshot.rooms[0][1];
    return room.journeyId || room.phase !== 'LOBBY' || !candidates.some(other =>
      other.snapshot.rooms[0][0] === record.snapshot.rooms[0][0] && !!other.snapshot.rooms[0][1].journeyId);
  });
  const activeRoom = storage.getItem('guardioes_room_code');
  const cached = JSON.parse(storage.getItem('entre-nos-solo') || 'null');
  const activeAttempt = cached?.rooms?.find(([code]: [string]) => code === activeRoom)?.[1]?.journeyId;
  return records.sort((a, b) => Number(b.attempt === activeAttempt) - Number(a.attempt === activeAttempt));
}

export function completedJourneyResources(state: Pick<RoomState, 'journeyDefinitionId' | 'completedMissionIds' | 'phase'>,
  definition: JourneyDefinition = journeyDefinition(state.journeyDefinitionId)) {
  if (state.phase !== 'GAME_SUMMARY' || !isJourneyAvailable(definition)
      || !definition.missionIds.every(id => state.completedMissionIds.includes(id))) return [];
  return (definition.presentation?.resources || []).filter(resource => {
    if (resource.editorialStatus !== 'approved') return false;
    try { return new URL(resource.url).protocol === 'https:'; } catch { return false; }
  });
}
