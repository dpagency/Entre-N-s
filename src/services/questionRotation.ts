import { ADDITIONAL_QUESTIONS } from '../data/ethicsQuestions';

export type QuestionStorage = Pick<Storage, 'getItem' | 'setItem'>;
const memory = new WeakMap<QuestionStorage, Map<string, string>>();
function cache(storage: QuestionStorage) {
  let values = memory.get(storage);
  if (!values) { values = new Map(); memory.set(storage, values); }
  return values;
}
function read(storage: QuestionStorage, key: string) {
  try { return storage.getItem(key) ?? cache(storage).get(key) ?? null; } catch { return cache(storage).get(key) ?? null; }
}
function write(storage: QuestionStorage, key: string, value: string) {
  cache(storage).set(key, value);
  try { storage.setItem(key, value); } catch { /* Rotation still works in memory for this open page. */ }
}

/** Stable per opportunity; avoid the last draw and the previous draw for this mission when possible. */
export function rotatingItem<T extends { id: string }>(pool: readonly T[], storage: QuestionStorage,
  keys: { session: string; history: string; slot?: string; preferredId?: string }, random = Math.random): T {
  if (!pool.length) throw new Error('O banco de perguntas está vazio.');
  const saved = pool.find(item => item.id === read(storage, keys.session));
  if (saved) return saved;
  const previous = read(storage, keys.history);
  const previousSlot = keys.slot ? read(storage, keys.history + '-slot-' + keys.slot) : null;
  let available = pool.filter(item => item.id !== previous && item.id !== previousSlot);
  if (!available.length) available = pool.filter(item => item.id !== previous);
  if (!available.length) available = [...pool];
  const chosen = pool.find(item => item.id === keys.preferredId) ?? available[Math.min(available.length - 1, Math.floor(random() * available.length))];
  write(storage, keys.session, chosen.id);
  write(storage, keys.history, chosen.id);
  if (keys.slot) write(storage, keys.history + '-slot-' + keys.slot, chosen.id);
  return chosen;
}

export interface ChannelQuiz {
  roomCode: string;
  missionId: string;
  questionId: string;
  index: number;
  answer?: boolean;
  awarded?: boolean;
}
function quizKey(roomCode: string, missionId: string) { return 'entre-nos-channel-quiz-' + roomCode + '-' + missionId; }
export function loadChannelQuiz(storage: QuestionStorage, roomCode: string, missionId: string, random = Math.random): ChannelQuiz {
  const key = quizKey(roomCode, missionId);
  let saved: Partial<ChannelQuiz> | null = null;
  try { saved = JSON.parse(read(storage, key) || 'null'); } catch { /* Ignore an invalid old snapshot. */ }
  const oldQuestion = ADDITIONAL_QUESTIONS.find(q => q.id === saved?.questionId)
    ?? (Number.isInteger(saved?.index) ? ADDITIONAL_QUESTIONS[saved!.index!] : undefined);
  const question = rotatingItem(ADDITIONAL_QUESTIONS, storage, {
    session: key + '-question', history: 'entre-nos-channel-question-last', slot: missionId, preferredId: oldQuestion?.id,
  }, random);
  const quiz: ChannelQuiz = { roomCode, missionId, questionId: question.id, index: ADDITIONAL_QUESTIONS.indexOf(question) };
  if (oldQuestion?.id === question.id && typeof saved?.answer === 'boolean') {
    quiz.answer = saved.answer;
    quiz.awarded = saved.awarded === true;
  }
  saveChannelQuiz(storage, quiz);
  return quiz;
}
export function saveChannelQuiz(storage: QuestionStorage, quiz: ChannelQuiz) {
  write(storage, quizKey(quiz.roomCode, quiz.missionId), JSON.stringify(quiz));
}
