import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { handleClientMessage, restore, snapshot } from '../src/game/engine';
import { GUARDIAN_QUESTIONS, PILOT_MISSIONS, PLAYER_AVATARS } from '../src/data/pilot';
import { learningPoints, recordLearning } from '../src/services/learningScore';
import { selectGuardianQuestion } from '../src/services/guardianQuestions';
import type { ClientMessage } from '../src/types/game';
import { browserStorage } from '../src/services/browserStorage';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
before(() => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  } });
});
after(() => {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else Reflect.deleteProperty(globalThis, 'localStorage');
});

test('each avatar plays four missions with three other avatars, four guardians and preserved human choices', () => {
  for (let avatar = 0; avatar < 4; avatar++) {
    restore({ rooms: [], tokens: [], evaluations: [], feedback: [] });
    const frames: any[] = [];
    const connection = { readyState: 1, send: (data: string) => frames.push(JSON.parse(data)) };
    const send = (message: ClientMessage) => handleClientMessage(connection, message);
    send({ type: 'CREATE_ROOM', nickname: 'Teste', characterId: 'alex', variantIndex: avatar, pilotVersion: 2 });
    send({ type: 'START_GAME' });
    const room = () => snapshot().rooms[0][1];
    const journey = room().journeyId!;
    const bots = Object.values(room().players).filter(p => p.isBot);
    assert.equal(Object.keys(room().players).length, 4);
    assert.deepEqual(bots.map(p => p.variantIndex).sort(), [0, 1, 2, 3].filter(i => i !== avatar));
    assert.deepEqual(bots.map(p => p.nickname).sort(), PLAYER_AVATARS.filter((_, i) => i !== avatar).map(a => a.name).sort());
    assert.equal(new Set(room().guardianOrder).size, 4);
    for (const mission of PILOT_MISSIONS) {
      send({ type: 'VOTE_DESTINATION', regionId: mission.regionId }); send({ type: 'CONFIRM_DESTINATION' });
      send({ type: 'SUBMIT_INDIVIDUAL_CHOICE', actionId: mission.actions[0].id });
      assert.equal(room().phase, 'MISSION_SITUATION');
      send({ type: 'EXPLORE_MISSION' }); assert.equal(room().phase, 'MISSION_GUARDIAN');
      send({ type: 'COMPLETE_GUARDIAN_CHALLENGE' }); assert.equal(room().phase, 'MISSION_GUARDIAN');
      const encounter = room().guardianEncounters![mission.id];
      send({ type: 'OPEN_GUARDIAN_CHALLENGE', questionId: 'unknown-question' });
      assert.equal(encounter.questionId, undefined);
      const question = GUARDIAN_QUESTIONS.find(q => q.guardians.includes(encounter.guardianId))!;
      send({ type: 'OPEN_GUARDIAN_CHALLENGE', questionId: question.id });
      send({ type: 'SUBMIT_GUARDIAN_ANSWER', answer: question.isTrue });
      send({ type: 'SUBMIT_GUARDIAN_ANSWER', answer: !question.isTrue }); assert.equal(encounter.answer, question.isTrue);
      send({ type: 'COMPLETE_GUARDIAN_CHALLENGE' });
      send({ type: 'SUBMIT_INDIVIDUAL_CHOICE', actionId: mission.actions[0].id });
      const human = room().hostId;
      send({ type: 'SUBMIT_INDIVIDUAL_CHOICE', actionId: mission.actions[1].id });
      assert.equal(room().individualChoices[human], mission.actions[0].id);
      for (const bot of bots) assert(mission.actions.some(a => a.id === room().individualChoices[bot.id]));
      send({ type: 'PROCEED_TO_REVEAL' }); send({ type: 'OPEN_COLLECTIVE_VOTE' });
      assert.equal(room().phase, 'MISSION_CONSEQUENCE');
      send({ type: 'DRAW_FORTUNE_CARD', cardIndex: avatar % 3 });
      const outcome = room().fortuneCards![mission.id].outcome;
      send({ type: 'DRAW_FORTUNE_CARD', cardIndex: (avatar + 1) % 3 }); assert.equal(room().fortuneCards![mission.id].outcome, outcome);
      send({ type: 'PROCEED_AFTER_CONSEQUENCE' });
    }
    assert.equal(room().phase, 'GAME_SUMMARY');
    assert(room().historyLog.every(h => h.affinityGuardianIds === undefined));
    assert.equal(learningPoints(journey, room().fortuneCards, room()).total, 60);
    // Calls to learning records are browser operations; provide just the event surface.
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { dispatchEvent() {} } });
    for (const mission of PILOT_MISSIONS) { recordLearning(journey, mission.id, 'commission'); recordLearning(journey, mission.id, 'channelCorrect'); }
    if (previous) Object.defineProperty(globalThis, 'window', previous); else Reflect.deleteProperty(globalThis, 'window');
    assert.equal(learningPoints(journey, room().fortuneCards, room()).total, 60);
    assert.equal(learningPoints(journey, room().fortuneCards, room()).maximum, 80);
    send({ type: 'SELECT_FINAL_GUARDIAN', guardianId: 'bia' });
    assert.equal(room().finalGuardianId, 'bia');
    const saved = snapshot(); restore(saved);
    assert.equal(snapshot().rooms[0][1].finalGuardianId, 'bia');
    // Reconnect after restoring to exercise the same-room restart.
    const joined = frames.find(f => f.type === 'ROOM_JOINED');
    send({ type: 'JOIN_ROOM', roomCode: joined.roomCode, sessionToken: joined.sessionToken, nickname: 'Teste', characterId: 'alex', variantIndex: avatar });
    send({ type: 'START_GAME' });
    assert.notEqual(room().journeyId, journey);
    assert.equal(learningPoints(room().journeyId!, room().fortuneCards, room()).total, 0);
    assert.equal(room().finalGuardianId, undefined);
  }
});

test('new storage adapter keeps the current page functional when reads and writes are denied', () => {
  const working = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')!;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); },
  } });
  try {
    browserStorage.setItem('pilot-blocked-test', 'saved-in-memory');
    assert.equal(browserStorage.getItem('pilot-blocked-test'), 'saved-in-memory');
    assert.equal(browserStorage.persistent, false);
    browserStorage.removeItem('pilot-blocked-test');
    assert.equal(browserStorage.getItem('pilot-blocked-test'), null);
  } finally { Object.defineProperty(globalThis, 'localStorage', working); }
});

test('learning rule versions preserve old Sorte, old credits and new journey opportunities', (t) => {
  t.mock.method(crypto, 'getRandomValues', (array: Uint32Array) => { array.fill(0); return array; });
  restore({ rooms: [], tokens: [], evaluations: [], feedback: [] });
  const frames: any[] = [];
  const connection = { readyState: 1, send: (data: string) => frames.push(JSON.parse(data)) };
  const send = (message: ClientMessage) => handleClientMessage(connection, message);
  send({ type: 'CREATE_ROOM', nickname: 'Compatibilidade', characterId: 'alex', variantIndex: 0, pilotVersion: 2 });
  send({ type: 'START_GAME' });
  const state = snapshot().rooms[0][1];
  assert.equal(state.learningRulesVersion, 4);
  assert.equal(learningPoints(state.journeyId!, {}, state).maximum, 20);
  state.phase = 'MISSION_CONSEQUENCE'; state.activeMissionId = PILOT_MISSIONS[0].id;
  const saved = snapshot();
  const joined = frames.find(f => f.type === 'ROOM_JOINED');
  const reconnect = () => send({ type: 'JOIN_ROOM', roomCode: joined.roomCode, sessionToken: joined.sessionToken, nickname: 'Compatibilidade', characterId: 'alex', variantIndex: 0 });
  const outcomes = new Set<string>();
  for (let i = 0; i < 3; i++) {
    restore(structuredClone(saved)); reconnect();
    send({ type: 'DRAW_FORTUNE_CARD', cardIndex: i % 3 });
    const outcome = snapshot().rooms[0][1].fortuneCards![state.activeMissionId].outcome;
    assert.notEqual(outcome, 'sorte'); outcomes.add(outcome);
  }
  assert.deepEqual([...outcomes].sort(), ['caminhos', 'reves', 'segunda_chance']);
  const version3 = structuredClone(saved);
  version3.rooms[0][1].learningRulesVersion = 3;
  version3.rooms[0][1].phase = 'MISSION_GUARDIAN';
  version3.rooms[0][1].guardianEncounters = { [state.activeMissionId]: { guardianId: 'alex' } };
  restore(version3); reconnect();
  const legacyQuestion = GUARDIAN_QUESTIONS.find(q => q.guardians.includes('alex'))!;
  send({ type: 'OPEN_GUARDIAN_CHALLENGE', questionId: legacyQuestion.id });
  assert.equal(learningPoints(state.journeyId!, {}, snapshot().rooms[0][1]).total, 5);
  send({ type: 'OPEN_GUARDIAN_CHALLENGE', questionId: legacyQuestion.id });
  send({ type: 'SUBMIT_GUARDIAN_ANSWER', answer: !legacyQuestion.isTrue });
  const version3Saved = structuredClone(snapshot()); restore(version3Saved); reconnect();
  send({ type: 'SUBMIT_GUARDIAN_ANSWER', answer: legacyQuestion.isTrue });
  assert.equal(snapshot().rooms[0][1].learningRulesVersion, 3);
  assert.equal(learningPoints(state.journeyId!, {}, snapshot().rooms[0][1]).total, 5, 'v3 opening survives restoration; wrong answer cannot be regraded');
  const old = structuredClone(saved);
  delete old.rooms[0][1].learningRulesVersion;
  old.rooms[0][1].fortuneCards = { [state.activeMissionId]: { cardIndex: 0, outcome: 'sorte' } };
  browserStorage.setItem('entre-nos-learning-' + state.journeyId, JSON.stringify({ commission: [state.activeMissionId], channelCorrect: [state.activeMissionId] }));
  restore(old); reconnect();
  send({ type: 'DRAW_FORTUNE_CARD', cardIndex: 2 });
  const resumed = snapshot().rooms[0][1];
  assert.equal(resumed.learningRulesVersion, undefined);
  assert.deepEqual(resumed.fortuneCards, old.rooms[0][1].fortuneCards);
  const points = learningPoints(resumed.journeyId!, resumed.fortuneCards, resumed);
  assert.equal(points.fortune, 3); assert.equal(points.total, 10); assert.equal(points.cardMax, 0);
  assert.equal(learningPoints(state.journeyId!, {}, state).total, 0, 'new rules never count old channel credits');
  const sanitized = [...frames].reverse().find(f => f.type === 'ROOM_STATE')?.state;
  if (sanitized) assert.equal(sanitized.learningRulesVersion, undefined);
});

test('thematic rotation prioritizes unused questions, stays stable and handles exhaustion across journeys', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
  let previous = '';
  const firstCycle = [];
  for (let i = 0; i < 9; i++) {
    const q = selectGuardianQuestion(storage, 'journey-' + i, 'mission-1', 'alex', () => 0);
    assert.notEqual(q.id, previous);
    assert.equal(selectGuardianQuestion(storage, 'journey-' + i, 'mission-1', 'alex', () => .99).id, q.id);
    if (i < 3) firstCycle.push(q.id);
    previous = q.id;
  }
  assert.equal(new Set(firstCycle).size, 3);
});
