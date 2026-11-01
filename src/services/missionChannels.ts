import type { RoomState } from '../types/game';
import { CHANNEL_ACTIVITY_QUESTIONS } from '../data/channelActivity';

export type MissionChannelRecord = { questionId: string; answer?: number };
export type MissionChannelActivity = { version: 1; missions: Record<string, MissionChannelRecord> };
export function hasMissionChannels(state: Pick<RoomState, 'journeyDefinitionId' | 'missionChannelActivity' | 'learningRulesVersion'> | null | undefined): boolean {
  return state?.learningRulesVersion === 4 && ['cidade-dos-encontros', 'entre-escolhas-e-cuidados'].includes(state.journeyDefinitionId || 'cidade-dos-encontros') && state.missionChannelActivity?.version === 1;
}
export function missionChannelPoints(state: Pick<RoomState, 'missionChannelActivity' | 'journeyDefinitionId'>) {
  const records = state.missionChannelActivity?.missions || {};
  const used = new Set<string>();
  let points = 0, answered = 0;
  const ids = state.journeyDefinitionId === 'entre-escolhas-e-cuidados' ? ['j2-m01', 'j2-m02', 'j2-m03', 'j2-m04'] : ['missao-1', 'missao-2', 'missao-3', 'missao-4'];
  for (const id of ids) {
    const record = records[id];
    const q = CHANNEL_ACTIVITY_QUESTIONS.find(q => q.id === record?.questionId);
    if (!q || used.has(q.id) || !Number.isInteger(record?.answer) || record.answer! < 0 || record.answer! >= q.options.length) continue;
    used.add(q.id); answered++;
    if (record.answer === q.correctIndex) points += 5;
  }
  return { points, answered, maximum: 20 };
}
