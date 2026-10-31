import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHANNEL_ACTIVITY_QUESTIONS as questions } from '../src/data/channelActivity';
import { GUARDIAN_QUESTIONS, PILOT_MISSIONS } from '../src/data/pilot';
import { PATH_SCENARIOS } from '../src/data/pathScenarios';
import { channelActivityPoints, confirmChannelAnswer, readChannelAnswer, pendingChannelQuestion, rememberChannelQuestion } from '../src/services/channelActivity';
import { browserStorage } from '../src/services/browserStorage';
import { learningPoints } from '../src/services/learningScore';
import { presentCardQuestion, confirmCardAnswer, cardScenario } from '../src/services/cardKnowledge';
import type { RoomState } from '../src/types/game';

function storage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
test('reopening preserves a pending selection and advances only after confirmation', () => {
  const s = storage();
  assert.equal(pendingChannelQuestion(s, 'j'), 0);
  rememberChannelQuestion(s, 'j', 'cv-4');
  assert.equal(pendingChannelQuestion(s, 'j'), 3);
  assert.deepEqual(channelActivityPoints(s, 'j', 4), { points: 0, maximum: 20, answered: 0 });
  confirmChannelAnswer(s, 'j', 4, 'cv-4', 0);
  assert.equal(pendingChannelQuestion(s, 'j'), 0);
  rememberChannelQuestion(s, 'j', 'cv-4');
  assert.equal(pendingChannelQuestion(s, 'j'), 0, 'reviewing an answer does not replace the pending selection');
  assert.equal(pendingChannelQuestion(s, 'new'), 0);
});
test('completion opens without a pending question and keeps all answer records for review', () => {
  const s = storage();
  for (const q of questions) {
    rememberChannelQuestion(s, 'j', q.id);
    confirmChannelAnswer(s, 'j', 4, q.id, q.correctIndex);
  }
  assert.equal(pendingChannelQuestion(s, 'j'), null);
  assert.deepEqual(channelActivityPoints(s, 'j', 4), { points: 20, maximum: 20, answered: 5 });
  for (const q of questions) {
    assert.equal(readChannelAnswer(s, 'j', q.id)?.answer, q.correctIndex);
    confirmChannelAnswer(s, 'j', 4, q.id, q.correctIndex);
  }
  assert.equal(channelActivityPoints(s, 'j', 4).points, 20);
});
test('five voluntary questions have independent identities, content, alternatives and feedback', () => {
  assert.equal(questions.length, 5);
  assert.equal(new Set(questions.map(q => q.correctIndex)).size, 3);
  for (const q of questions) {
    assert.equal(new Set(q.options).size, 3); assert.equal(q.feedback.length, 3);
    assert(q.feedback.every(Boolean) && q.basis && q.rationale);
    assert(!GUARDIAN_QUESTIONS.some(g => g.id === q.id || g.statement === q.prompt));
    assert(!PATH_SCENARIOS.some(p => p.id === q.id || p.prompt === q.prompt));
  }
});
test('voluntary awards are single per journey/question and errors cannot be retried for points', () => {
  const s = storage();
  questions.forEach((q, index) => {
    const answer = index % 2 ? (q.correctIndex + 1) % 3 : q.correctIndex;
    const saved = confirmChannelAnswer(s, 'j', 4, q.id, answer);
    assert(saved);
    assert.deepEqual(confirmChannelAnswer(s, 'j', 4, q.id, q.correctIndex), saved);
    assert.deepEqual(readChannelAnswer(s, 'j', q.id), saved);
  });
  assert.deepEqual(channelActivityPoints(s, 'j', 4), { points: 12, maximum: 20, answered: 5 });
  assert.deepEqual(channelActivityPoints(s, 'new', 4), { points: 0, maximum: 20, answered: 0 });
});
test('no access, old practice, missing journey or invalid response generates voluntary credit', () => {
  const s = storage();
  s.setItem('entre-nos-channel-quiz-j-m', JSON.stringify({ questionId: 'ET-001', answer: true, awarded: true }));
  assert.equal(confirmChannelAnswer(s, null, 4, 'cv-1', 1), null);
  assert.equal(confirmChannelAnswer(s, 'j', 3, 'cv-1', 1), null);
  assert.equal(confirmChannelAnswer(s, 'j', undefined, 'cv-1', 1), null);
  for (const invalid of [-1, 3, NaN, 0.5]) assert.equal(confirmChannelAnswer(s, 'j', 4, 'cv-1', invalid), null);
  assert.equal(confirmChannelAnswer(s, 'j', 4, 'ET-001', 1), null);
  assert.deepEqual(channelActivityPoints(s, 'j', 4), { points: 0, maximum: 20, answered: 0 });
  assert.deepEqual(channelActivityPoints(s, 'j', 3), { points: 0, maximum: 0, answered: 0 });
  for (const record of ['invalid', JSON.stringify({ version: 2, journey: 'j', questionId: 'cv-1', answer: 1 }), JSON.stringify({ version: 1, journey: 'other', questionId: 'cv-1', answer: 1 })]) {
    s.setItem('entre-nos-channel-activity-v1-j-cv-1', record);
    assert.equal(readChannelAnswer(s, 'j', 'cv-1'), null);
    assert.equal(channelActivityPoints(s, 'j', 4).points, 0);
  }
});
test('version 4 removes opening points, keeps dynamic cards and totals 100 with all opportunities', () => {
  const state = { pilotVersion: 2, learningRulesVersion: 4, journeyId: 'score-v4', guardianEncounters: {}, fortuneCards: {} } as unknown as RoomState;
  assert.equal(learningPoints(state.journeyId!, {}, state).maximum, 20);
  for (const mission of PILOT_MISSIONS) {
    const question = GUARDIAN_QUESTIONS.find(q => q.guardians.includes('alex'))!;
    state.guardianEncounters![mission.id] = { guardianId: 'alex', questionId: question.id };
    assert.equal(learningPoints(state.journeyId!, {}, state).total, Object.values(state.guardianEncounters!).filter(e => e.answer !== undefined).length * 15);
    state.guardianEncounters![mission.id].answer = question.isTrue;
    state.fortuneCards![mission.id] = { cardIndex: 0, outcome: 'caminhos' };
    const record = presentCardQuestion(browserStorage, state.journeyId!, mission.id, 'caminhos');
    const correct = PATH_SCENARIOS.find(q => q.id === cardScenario(record).id)!.correctIndex;
    confirmCardAnswer(browserStorage, state.journeyId!, mission.id, correct);
  }
  assert.equal(learningPoints(state.journeyId!, state.fortuneCards, state).total, 80);
  assert.equal(learningPoints(state.journeyId!, state.fortuneCards, state).maximum, 100);
  for (const q of questions) confirmChannelAnswer(browserStorage, state.journeyId!, 4, q.id, q.correctIndex);
  const points = learningPoints(state.journeyId!, state.fortuneCards, state);
  assert.equal(points.total, 100); assert.equal(points.consultation, 0); assert.equal(points.channelPoints, 20);
  assert.equal(points.knowledge, 60); assert.equal(points.cardPoints, 20);
  // Reopening a question, recomputing, or reading under a legacy rule never adds points.
  for (const q of questions) confirmChannelAnswer(browserStorage, state.journeyId!, 4, q.id, q.correctIndex);
  assert.equal(learningPoints(state.journeyId!, state.fortuneCards, state).total, 100);
  const old = { ...state, learningRulesVersion: 3 as const };
  assert.equal(learningPoints(old.journeyId!, old.fortuneCards, old).total, 100);
  assert.equal(learningPoints(old.journeyId!, old.fortuneCards, old).channelPoints, 0);
  assert.equal(learningPoints(old.journeyId!, old.fortuneCards, old).consultation, 20);
});
