import { LEGACY_SECOND_CHANCE_SCENARIOS, LEGACY_SETBACK_SCENARIOS, SECOND_CHANCE_SCENARIOS, SETBACK_SCENARIOS, type CardScenario } from '../data/fortuneScenarios';
import { PATH_SCENARIOS } from '../data/pathScenarios';
import { rotatingItem, type QuestionStorage } from './questionRotation';

export type CardKind = 'segunda_chance' | 'reves' | 'caminhos';
export type CardRecord = { version: 1 | 2; kind: CardKind; questionId: string; answer?: number };
const key = (journey: string, mission: string) => `entre-nos-card-knowledge-v2-${journey}-${mission}`;
const poolFor = (kind: CardKind) => kind === 'caminhos' ? PATH_SCENARIOS : kind === 'reves' ? SETBACK_SCENARIOS : SECOND_CHANCE_SCENARIOS;
const legacyPool = (kind: CardKind) => kind === 'caminhos' ? [] : kind === 'reves' ? LEGACY_SETBACK_SCENARIOS : LEGACY_SECOND_CHANCE_SCENARIOS;
export function cardScenario(record: CardRecord): CardScenario {
  return (record.version === 1 ? legacyPool(record.kind) : poolFor(record.kind)).find(q => q.id === record.questionId)!;
}
export function readCardRecord(storage: QuestionStorage, journey: string, mission: string): CardRecord | null {
  try {
    const r = JSON.parse(storage.getItem(key(journey, mission)) || 'null') as CardRecord | null;
    if (!r || ![1, 2].includes(r.version) || !['reves', 'segunda_chance', 'caminhos'].includes(r.kind)) return null;
    const q = cardScenario(r);
    if (!q || (r.answer !== undefined && (!Number.isInteger(r.answer) || r.answer < 0 || r.answer >= q.options.length))) return null;
    if (r.version === 1 && r.answer === undefined) return null;
    return r;
  } catch { return null; }
}
export function presentCardQuestion(storage: QuestionStorage, journey: string, mission: string, kind: CardKind): CardRecord {
  const existing = readCardRecord(storage, journey, mission);
  if (existing && existing.kind === kind) return existing;
  // Keep already-confirmed old wording/answer read-only. Never grade it under the new wording.
  const oldId = storage.getItem(`entre-nos-card-scenario-${journey}-${mission}-${kind}`);
  const oldQuestion = legacyPool(kind).find(q => q.id === oldId);
  const rawAnswer = oldQuestion && storage.getItem(`entre-nos-reflection-${journey}-${mission}-${oldQuestion.id}`);
  const oldAnswer = rawAnswer == null ? -1 : Number(rawAnswer);
  let record: CardRecord;
  if (oldQuestion && Number.isInteger(oldAnswer) && oldAnswer >= 0 && oldAnswer < oldQuestion.options.length) {
    record = { version: 1, kind, questionId: oldQuestion.id, answer: oldAnswer };
  } else {
    const question = rotatingItem(poolFor(kind), storage, {
      session: key(journey, mission) + '-question', history: 'entre-nos-card-v2-last-' + kind, slot: mission,
    });
    record = { version: 2, kind, questionId: question.id };
  }
  storage.setItem(key(journey, mission), JSON.stringify(record));
  return record;
}
export function confirmCardAnswer(storage: QuestionStorage, journey: string, mission: string, answer: number): CardRecord | null {
  const record = readCardRecord(storage, journey, mission);
  if (!record || record.version !== 2 || record.answer !== undefined) return record;
  if (!Number.isInteger(answer) || answer < 0 || answer >= cardScenario(record).options.length) return record;
  const confirmed = { ...record, answer };
  // One authoritative record holds both the answer and the derived award; no additive credit to duplicate.
  storage.setItem(key(journey, mission), JSON.stringify(confirmed));
  return confirmed;
}
export function cardAward(record: CardRecord): number {
  return record.version === 2 && record.answer !== undefined && record.answer === poolFor(record.kind).find(q => q.id === record.questionId)?.correctIndex ? 5 : 0;
}
export function cardKnowledgePoints(storage: QuestionStorage, journey: string, fortunes: Record<string, { outcome: string }>, missionIds: string[]) {
  let points = 0, maximum = 0;
  for (const mission of missionIds) {
    const record = readCardRecord(storage, journey, mission);
    if (record?.version !== 2 || record.kind !== fortunes[mission]?.outcome) continue;
    maximum += 5;
    points += cardAward(record);
  }
  return { points, maximum };
}
