import { GUARDIAN_IDS, GUARDIAN_QUESTIONS } from '../data/pilot';
import type { CharacterId, RoomState } from '../types/game';

export function shuffledGuardianOrder(randomIndex = (length: number) => crypto.getRandomValues(new Uint32Array(1))[0] % length): CharacterId[] {
  const order = [...GUARDIAN_IDS];
  for (let i = order.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function knownJourneyGuardians(state: Pick<RoomState, 'guardianEncounters'>, missionIds: readonly string[]): CharacterId[] {
  const known = missionIds.flatMap(id => {
    const encounter = state.guardianEncounters?.[id];
    if (!encounter || encounter.answer === undefined || !GUARDIAN_IDS.includes(encounter.guardianId) ||
        !GUARDIAN_QUESTIONS.some(q => q.id === encounter.questionId && q.guardians.includes(encounter.guardianId))) return [];
    return [encounter.guardianId];
  });
  return [...new Set(known)];
}
