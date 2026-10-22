import test from 'node:test';
import assert from 'node:assert/strict';
import { ADDITIONAL_QUESTIONS } from '../src/data/ethicsQuestions';
import { SECOND_CHANCE_SCENARIOS, SETBACK_SCENARIOS } from '../src/data/fortuneScenarios';
import { loadChannelQuiz, saveChannelQuiz, rotatingItem } from '../src/services/questionRotation';

function storage() {
  const values = new Map<string, string>();
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
test('approved question banks remain five shared questions and five scenarios of each kind', () => {
  assert.equal(ADDITIONAL_QUESTIONS.length, 5);
  assert.equal(SECOND_CHANCE_SCENARIOS.length, 5);
  assert.equal(SETBACK_SCENARIOS.length, 5);
});
test('two journeys receive different questions, including the corresponding mission slot', () => {
  const local = storage();
  const first = loadChannelQuiz(local, 'one', 'mission-1', () => 0);
  const nextMission = loadChannelQuiz(local, 'one', 'mission-2', () => 0);
  const second = loadChannelQuiz(local, 'two', 'mission-1', () => 0);
  assert.notEqual(first.questionId, nextMission.questionId);
  assert.notEqual(second.questionId, nextMission.questionId);
  assert.notEqual(second.questionId, first.questionId);
});
test('reopening, changing channels and restoring the page keep the same question and answer', () => {
  const local = storage();
  const first = loadChannelQuiz(local, 'one', 'mission-1', () => 0);
  saveChannelQuiz(local, { ...first, answer: false, awarded: false });
  assert.deepEqual(loadChannelQuiz(local, 'one', 'mission-1', () => .99), { ...first, answer: false, awarded: false });
  const otherRoom = loadChannelQuiz(local, 'two', 'mission-1', () => 0);
  assert.equal(otherRoom.answer, undefined);
  assert.notEqual(otherRoom.questionId, first.questionId);
});
test('old index-based snapshots preserve the approved question, answer and recorded award', () => {
  const local = storage();
  local.setItem('entre-nos-channel-quiz-one-mission-1', JSON.stringify({ index: 2, answer: true, awarded: true }));
  const quiz = loadChannelQuiz(local, 'one', 'mission-1', () => 0);
  assert.equal(quiz.questionId, 'ET-003');
  assert.equal(quiz.answer, true);
  assert.equal(quiz.awarded, true);
});
test('invalid or obsolete saved quiz indexes do not hide the challenge or preserve an unrelated answer', () => {
  for (const value of ['{', '{"index":99,"answer":true}', '{"questionId":"gone","answer":false}']) {
    const local = storage(); local.setItem('entre-nos-channel-quiz-one-mission-1', value);
    const quiz = loadChannelQuiz(local, 'one', 'mission-1', () => 0);
    assert.equal(quiz.questionId, 'ET-001');
    assert.equal(quiz.answer, undefined);
  }
});
test('second chance and setback avoid immediate repeats, remain stable on reopening and accept legacy keys', () => {
  for (const pool of [SECOND_CHANCE_SCENARIOS, SETBACK_SCENARIOS]) {
    const local = storage();
    local.setItem('last', pool[0].id);
    let previous = pool[0].id;
    for (let i = 0; i < 15; i++) {
      const keys = { session: 'room-' + i, history: 'last', slot: 'mission-1' };
      const chosen = rotatingItem(pool, local, keys, () => 0);
      assert.notEqual(chosen.id, previous);
      assert.equal(rotatingItem(pool, local, keys, () => .99).id, chosen.id);
      previous = chosen.id;
    }
    local.setItem('old-room', pool[0].id);
    assert.equal(rotatingItem(pool, local, { session: 'old-room', history: 'last' }).id, pool[0].id);
  }
});
test('rotation remains effective in memory when browser storage is blocked', () => {
  const local = { getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('blocked'); } };
  const first = loadChannelQuiz(local, 'one', 'mission-1', () => 0);
  const second = loadChannelQuiz(local, 'two', 'mission-1', () => 0);
  assert.notEqual(first.questionId, second.questionId);
  saveChannelQuiz(local, { ...second, answer: true, awarded: false });
  assert.equal(loadChannelQuiz(local, 'two', 'mission-1').answer, true);
});
test('small banks prioritize avoiding the immediately preceding item; singleton repetition is unavoidable', () => {
  const local = storage();
  const pool = [{ id: 'a' }, { id: 'b' }];
  local.setItem('history', 'a'); local.setItem('history-slot-one', 'b');
  assert.equal(rotatingItem(pool, local, { session: 'x', history: 'history', slot: 'one' }, () => 0).id, 'b');
  assert.equal(rotatingItem([{ id: 'only' }], local, { session: 'y', history: 'h' }).id, 'only');
  assert.throws(() => rotatingItem([], local, { session: 'z', history: 'h' }));
});
