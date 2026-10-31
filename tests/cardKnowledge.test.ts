import { test } from 'node:test';
import { PATH_SCENARIOS } from '../src/data/pathScenarios';
import assert from 'node:assert/strict';
import { SECOND_CHANCE_SCENARIOS, SETBACK_SCENARIOS, LEGACY_SECOND_CHANCE_SCENARIOS } from '../src/data/fortuneScenarios';
import { presentCardQuestion, confirmCardAnswer, cardKnowledgePoints, cardScenario, readCardRecord } from '../src/services/cardKnowledge';

function storage() {
  const values = new Map<string, string>();
  return { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
}
test('ten revised card questions have three distinct alternatives, varied keys and pedagogical grounds', () => {
  assert.equal(SECOND_CHANCE_SCENARIOS.length, 5); assert.equal(SETBACK_SCENARIOS.length, 5);
  for (const pool of [SECOND_CHANCE_SCENARIOS, SETBACK_SCENARIOS]) {
    assert.equal(new Set(pool.map(q => q.correctIndex)).size, 3);
    for (const q of pool) {
      assert.equal(q.options.length, 3); assert.equal(new Set(q.options).size, 3);
      assert.equal(q.feedback.length, 3); assert(q.options[q.correctIndex]);
      assert(q.rationale && q.basis && q.feedback.every(Boolean)); assert.equal(q.version, 2);
    }
  }
});
test('card awards are derived once, survive resume and reject repeated confirmations or invalid answers', () => {
  const s = storage(), fortunes = { m1: { outcome: 'segunda_chance' }, m2: { outcome: 'reves' }, m3: { outcome: 'sorte' } };
  assert.deepEqual(cardKnowledgePoints(s, 'j', fortunes, ['m1', 'm2', 'm3']), { points: 0, maximum: 0 });
  const first = presentCardQuestion(s, 'j', 'm1', 'segunda_chance');
  const question = SECOND_CHANCE_SCENARIOS.find(q => q.id === first.questionId)!;
  assert.equal(confirmCardAnswer(s, 'j', 'm1', -1)?.answer, undefined);
  assert.equal(confirmCardAnswer(s, 'j', 'm1', 3)?.answer, undefined);
  assert.equal(confirmCardAnswer(s, 'j', 'm1', question.correctIndex)?.answer, question.correctIndex);
  assert.equal(confirmCardAnswer(s, 'j', 'm1', (question.correctIndex + 1) % 3)?.answer, question.correctIndex);
  assert.deepEqual(presentCardQuestion(s, 'j', 'm1', 'segunda_chance'), readCardRecord(s, 'j', 'm1'));
  const second = presentCardQuestion(s, 'j', 'm2', 'reves');
  const q2 = SETBACK_SCENARIOS.find(q => q.id === second.questionId)!;
  confirmCardAnswer(s, 'j', 'm2', (q2.correctIndex + 1) % 3);
  confirmCardAnswer(s, 'j', 'm2', q2.correctIndex);
  assert.deepEqual(cardKnowledgePoints(s, 'j', fortunes, ['m1', 'm2', 'm3']), { points: 5, maximum: 10 });
  assert.deepEqual(cardKnowledgePoints(s, 'new', fortunes, ['m1', 'm2', 'm3']), { points: 0, maximum: 0 });
  assert.deepEqual(cardKnowledgePoints(s, 'j', { m1: { outcome: 'sorte' } }, ['m1']), { points: 0, maximum: 0 });
});
test('confirmed old questions retain original wording and answers without reinterpretation or retroactive bonus', () => {
  const s = storage(), old = LEGACY_SECOND_CHANCE_SCENARIOS[0];
  s.setItem('entre-nos-card-scenario-old-m1-segunda_chance', old.id);
  s.setItem(`entre-nos-reflection-old-m1-${old.id}`, '1');
  const record = presentCardQuestion(s, 'old', 'm1', 'segunda_chance');
  assert.equal(record.version, 1); assert.equal(record.answer, 1);
  assert.deepEqual(cardScenario(record), old);
  assert.deepEqual(confirmCardAnswer(s, 'old', 'm1', 0), record);
  assert.deepEqual(cardKnowledgePoints(s, 'old', { m1: { outcome: 'segunda_chance' } }, ['m1']), { points: 0, maximum: 0 });
  s.setItem('entre-nos-card-scenario-old-m2-segunda_chance', old.id);
  assert.equal(presentCardQuestion(s, 'old', 'm2', 'segunda_chance').version, 2);
});
test('corrupted, unknown or future-version card records never award points', () => {
  const s = storage();
  for (const value of ['bad-json', JSON.stringify({ version: 3, kind: 'reves', questionId: 'rv-1', answer: 2 }), JSON.stringify({ version: 2, kind: 'reves', questionId: 'missing', answer: 0 }), JSON.stringify({ version: 2, kind: 'reves', questionId: 'rv-1', answer: 9 })]) {
    s.setItem('entre-nos-card-knowledge-v2-j-m', value);
    assert.equal(readCardRecord(s, 'j', 'm'), null);
    assert.deepEqual(cardKnowledgePoints(s, 'j', { m: { outcome: 'reves' } }, ['m']), { points: 0, maximum: 0 });
  }
});

test('Caminhos offers five grounded questions, rotates and awards only one confirmed answer', () => {
  assert.equal(PATH_SCENARIOS.length, 5);
  assert.equal(new Set(PATH_SCENARIOS.map(q => q.correctIndex)).size, 3);
  for (const q of PATH_SCENARIOS) {
    assert.equal(new Set(q.options).size, 3);
    assert.equal(q.feedback.length, 3);
    assert(q.rationale && q.basis && q.feedback.every(Boolean));
  }
  const s = storage();
  let previous = '';
  for (let i = 0; i < 20; i++) {
    const journey = 'path-' + i;
    const record = presentCardQuestion(s, journey, 'm', 'caminhos');
    assert.notEqual(record.questionId, previous);
    previous = record.questionId;
    const q = PATH_SCENARIOS.find(q => q.id === record.questionId)!;
    const answer = i % 2 ? (q.correctIndex + 1) % 3 : q.correctIndex;
    const fortunes = { m: { outcome: 'caminhos' } };
    assert.deepEqual(cardKnowledgePoints(s, journey, fortunes, ['m']), { points: 0, maximum: 5 });
    confirmCardAnswer(s, journey, 'm', answer);
    confirmCardAnswer(s, journey, 'm', q.correctIndex);
    assert.deepEqual(presentCardQuestion(s, journey, 'm', 'caminhos'), readCardRecord(s, journey, 'm'));
    assert.deepEqual(cardKnowledgePoints(s, journey, fortunes, ['m']), { points: i % 2 ? 0 : 5, maximum: 5 });
  }
});
