import { CHANNEL_ACTIVITY_QUESTIONS, CHANNEL_BANK_VERSION } from '../data/channelActivity';
import type { QuestionStorage } from './questionRotation';

export type ChannelActivityAnswer = { version: typeof CHANNEL_BANK_VERSION; journey: string; questionId: string; answer: number };
const key = (journey: string, questionId: string) => `entre-nos-channel-activity-v${CHANNEL_BANK_VERSION}-${journey}-${questionId}`;
const currentKey = (journey: string) => `entre-nos-channel-current-v${CHANNEL_BANK_VERSION}-${journey}`;
export function pendingChannelQuestion(storage: QuestionStorage, journey: string): number | null {
  let saved: string | null = null;
  try { saved = storage.getItem(currentKey(journey)); } catch { /* Fall back to the first unanswered question. */ }
  const preferred = CHANNEL_ACTIVITY_QUESTIONS.findIndex(q => q.id === saved && !readChannelAnswer(storage, journey, q.id));
  if (preferred >= 0) return preferred;
  const first = CHANNEL_ACTIVITY_QUESTIONS.findIndex(q => !readChannelAnswer(storage, journey, q.id));
  return first < 0 ? null : first;
}
export function rememberChannelQuestion(storage: QuestionStorage, journey: string, questionId: string): void {
  if (!CHANNEL_ACTIVITY_QUESTIONS.some(q => q.id === questionId) || readChannelAnswer(storage, journey, questionId)) return;
  try { storage.setItem(currentKey(journey), questionId); } catch { /* Answer records and scoring are unaffected. */ }
}
export function readChannelAnswer(storage: QuestionStorage, journey: string, questionId: string): ChannelActivityAnswer | null {
  try {
    const record = JSON.parse(storage.getItem(key(journey, questionId)) || 'null') as ChannelActivityAnswer | null;
    const question = CHANNEL_ACTIVITY_QUESTIONS.find(q => q.id === questionId);
    return question && record?.version === CHANNEL_BANK_VERSION && record.journey === journey && record.questionId === questionId
      && Number.isInteger(record.answer) && record.answer >= 0 && record.answer < question.options.length ? record : null;
  } catch { return null; }
}
export function confirmChannelAnswer(storage: QuestionStorage, journey: string | null, rulesVersion: number | undefined, questionId: string, answer: number): ChannelActivityAnswer | null {
  if (!journey || rulesVersion !== 4) return null;
  const question = CHANNEL_ACTIVITY_QUESTIONS.find(q => q.id === questionId);
  if (!question) return null;
  const existing = readChannelAnswer(storage, journey, questionId);
  if (existing) return existing;
  if (!Number.isInteger(answer) || answer < 0 || answer >= question.options.length) return null;
  const record: ChannelActivityAnswer = { version: CHANNEL_BANK_VERSION, journey, questionId, answer };
  storage.setItem(key(journey, questionId), JSON.stringify(record));
  return record;
}
export function channelActivityPoints(storage: QuestionStorage, journey: string | null, rulesVersion: number | undefined) {
  if (!journey || rulesVersion !== 4) return { points: 0, maximum: 0, answered: 0 };
  let points = 0, answered = 0;
  for (const question of CHANNEL_ACTIVITY_QUESTIONS) {
    const record = readChannelAnswer(storage, journey, question.id);
    if (!record) continue;
    answered++;
    if (record.answer === question.correctIndex) points += 4;
  }
  return { points, maximum: CHANNEL_ACTIVITY_QUESTIONS.length * 4, answered };
}
