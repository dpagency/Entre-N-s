import { journeyMissions } from '../data/journeys';
import { browserStorage } from './browserStorage';
import type { RoomState } from '../types/game';
import { GUARDIAN_QUESTIONS, PILOT_MISSIONS } from '../data/pilot';
import { cardKnowledgePoints } from './cardKnowledge';
import { channelActivityPoints } from './channelActivity';
import { hasMissionChannels, missionChannelPoints } from './missionChannels';
// Pontos de aprendizagem: consultas e conhecimento, nunca decisões éticas.
// A chave da sala separa jornadas e mantém o registro após recarregar a página.
type LearningRecord = { guardian: string[]; commission: string[]; correct: string[]; channelCorrect: string[] };
const empty = (): LearningRecord => ({ guardian: [], commission: [], correct: [], channelCorrect: [] });
function key(roomCode: string) { return 'entre-nos-learning-' + roomCode; }
export function getLearning(roomCode: string): LearningRecord {
  try {
    const data = JSON.parse(browserStorage.getItem(key(roomCode)) || 'null');
    return { guardian: Array.isArray(data?.guardian) ? data.guardian : [], commission: Array.isArray(data?.commission) ? data.commission : [], correct: Array.isArray(data?.correct) ? data.correct : [], channelCorrect: Array.isArray(data?.channelCorrect) ? data.channelCorrect : [] };
  } catch { return empty(); }
}
export function recordLearning(roomCode: string | null, missionId: string | null, kind: keyof LearningRecord): boolean {
  if (!roomCode || !missionId) return false;
  const data = getLearning(roomCode);
  if (data[kind].includes(missionId)) return false;
  data[kind].push(missionId);
  browserStorage.setItem(key(roomCode), JSON.stringify(data));
  window.dispatchEvent(new Event('entre-nos-learning-update'));
  return true;
}
export function learningPoints(roomCode: string | null, fortuneCards?: Record<string, { outcome: string }>, state?: RoomState) {
  const data = roomCode ? getLearning(roomCode) : empty();
  const pilot = state?.pilotVersion === 2;
  const voluntary = state?.learningRulesVersion === 4;
  const current = state?.learningRulesVersion === 3 || voluntary;
  const encounters = Object.values(state?.guardianEncounters || {});
  const missions = journeyMissions(state?.journeyDefinitionId);
  const missionCount = missions.length;
  const consultationMax = voluntary ? 0 : pilot ? encounters.filter(e => e.questionId).length * 5 + (current ? 0 : data.commission.length * 5) : missionCount * 10;
  const knowledgeMax = pilot ? encounters.filter(e => e.questionId).length * 15 + (current ? 0 : data.channelCorrect.length * 5) : 60;
  const consultation = Math.min(consultationMax, ((pilot ? encounters.filter(e => e.questionId).length : data.guardian.length) + (current ? 0 : data.commission.length)) * 5);
  const correctCount = pilot ? encounters.filter(e => e.answer !== undefined && GUARDIAN_QUESTIONS.find(q => q.id === e.questionId)?.isTrue === e.answer).length : data.correct.length;
  const knowledge = Math.min(knowledgeMax, correctCount * 15 + (current ? 0 : data.channelCorrect.length * 5));
  const fortune = Object.values(fortuneCards || {}).reduce((sum, card) => sum + (card.outcome === 'sorte' ? (current ? 0 : 3) : card.outcome === 'reves' ? -3 : card.outcome === 'segunda_chance' ? 1 : 0), 0);
  const cards = pilot && roomCode ? cardKnowledgePoints(browserStorage, roomCode, fortuneCards || {}, missions.map(m => m.id)) : { points: 0, maximum: 0 };
  const journeyMax = consultationMax + knowledgeMax;
  const channels = hasMissionChannels(state) ? missionChannelPoints(state!) : channelActivityPoints(browserStorage, roomCode, state?.learningRulesVersion);
  const maximum = pilot ? journeyMax + cards.maximum + channels.maximum : 87;
  return { consultation, knowledge, fortune, maximum, consultationMax, knowledgeMax, journeyTotal: consultation + knowledge, journeyMax, cardPoints: cards.points, cardMax: cards.maximum, channelPoints: channels.points, channelMax: channels.maximum, channelAnswered: channels.answered, total: pilot ? consultation + knowledge + cards.points + channels.points : Math.max(0, Math.min(100, consultation + knowledge + fortune)), ...data };
}
