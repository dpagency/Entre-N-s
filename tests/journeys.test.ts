import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JOURNEYS, ORIGINAL_JOURNEY_ID, journeyMissions, playableJourney } from '../src/data/journeys';
import { TRUE_FALSE_QUESTIONS, LEGACY_MISSION_QUESTIONS } from '../src/data/trueFalseQuestions';
import { GUARDIAN_QUESTIONS, PILOT_MISSIONS } from '../src/data/pilot';
import { MISSIONS } from '../src/data/missions';
import { archiveSnapshot, migrateLegacySave, listAttempts, loadAttempt, LEGACY_BACKUP_KEY } from '../src/services/journeyStorage';
import { handleClientMessage, snapshot, restore } from '../src/game/engine';
import { confirmChannelAnswer, channelActivityPoints } from '../src/services/channelActivity';
import { CHANNEL_ACTIVITY_QUESTIONS } from '../src/data/channelActivity';
import { PATH_SCENARIOS } from '../src/data/pathScenarios';
import { presentCardQuestion, confirmCardAnswer, cardAward, cardScenario } from '../src/services/cardKnowledge';

function memory() {
  const values = new Map<string, string>();
  return { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
}
function fixture() {
  restore({ rooms: [], tokens: [], evaluations: [], feedback: [] });
  const connection = { readyState: 1, send: (_: string) => {} };
  handleClientMessage(connection, { type: 'CREATE_ROOM', nickname: 'Teste', characterId: 'alex', variantIndex: 2, pilotVersion: 2 });
  handleClientMessage(connection, { type: 'START_GAME' });
  return { connection, saved: structuredClone(snapshot()) };
}

test('catalog preserves the original four missions and blocks unpublished content', () => {
  assert.deepEqual(journeyMissions().map(m => m.id), ['missao-1', 'missao-2', 'missao-3', 'missao-4']);
  assert.deepEqual(journeyMissions(), PILOT_MISSIONS);
  assert.equal(playableJourney().id, ORIGINAL_JOURNEY_ID);
  assert.equal(JOURNEYS[1].missionIds.length, 0);
  assert.throws(() => playableJourney(JOURNEYS[1].id));
  const { connection } = fixture();
  const before = snapshot().rooms.length;
  handleClientMessage(connection, { type: 'CREATE_ROOM', nickname: 'X', characterId: 'alex', variantIndex: 0, journeyDefinitionId: JOURNEYS[1].id });
  assert.equal(snapshot().rooms.length, before);
});

test('legacy migration preserves exact bytes, credentials, points and rules; repeated migration is idempotent', () => {
  const storage = memory();
  const { saved } = fixture();
  delete saved.rooms[0][1].journeyDefinitionId;
  delete saved.rooms[0][1].journeyContentVersion;
  saved.rooms[0][1].learningRulesVersion = 3;
  saved.rooms[0][1].fortuneCards = { 'missao-1': { outcome: 'sorte', cardIndex: 0 } };
  const raw = JSON.stringify(saved);
  storage.setItem('entre-nos-solo', raw);
  storage.setItem('guardioes_session_token', saved.tokens[0][0]);
  migrateLegacySave(storage);
  const backup = storage.getItem(LEGACY_BACKUP_KEY);
  migrateLegacySave(storage);
  assert.equal(storage.getItem('entre-nos-solo'), raw);
  assert.equal(JSON.parse(backup!).snapshot, raw);
  assert.equal(storage.getItem(LEGACY_BACKUP_KEY), backup);
  assert.equal(listAttempts(storage).length, 1);
  const record = loadAttempt(storage, ORIGINAL_JOURNEY_ID, saved.rooms[0][1].journeyId!)!;
  assert.deepEqual(record.snapshot.rooms, JSON.parse(raw).rooms);
  assert.equal(record.credentials!.sessionToken, saved.tokens[0][0]);
});

test('malformed saves and indices are preserved rather than reset', () => {
  const storage = memory();
  storage.setItem('entre-nos-solo', '{broken');
  assert.throws(() => migrateLegacySave(storage));
  assert.equal(storage.getItem('entre-nos-solo'), '{broken');
  assert.equal(JSON.parse(storage.getItem(LEGACY_BACKUP_KEY)!).snapshot, '{broken');
  storage.setItem('entre-nos-journeys-v1-index', '{}');
  assert.throws(() => archiveSnapshot(storage, fixture().saved));
  assert.equal(storage.getItem('entre-nos-journeys-v1-index'), '{}');
});

test('attempts remain independent on restart, including original snapshot after later mutations', () => {
  const storage = memory();
  const { connection, saved } = fixture();
  saved.rooms[0][1].phase = 'GAME_SUMMARY';
  restore(structuredClone(saved));
  // Reconnect using the saved token before restarting the same room.
  const [token, credentials] = saved.tokens[0];
  handleClientMessage(connection, { type: 'JOIN_ROOM', roomCode: credentials.roomCode, sessionToken: token, nickname: 'Teste', characterId: 'alex', variantIndex: 2 });
  archiveSnapshot(storage, saved);
  handleClientMessage(connection, { type: 'START_GAME' });
  archiveSnapshot(storage, snapshot());
  assert.notEqual(snapshot().rooms[0][1].journeyId, saved.rooms[0][1].journeyId);
  assert.equal(listAttempts(storage).length, 2);
  assert.equal(loadAttempt(storage, ORIGINAL_JOURNEY_ID, saved.rooms[0][1].journeyId!)!.snapshot.rooms[0][1].phase, 'GAME_SUMMARY');
});

test('storage namespaces isolate different journey definitions even with the same attempt id', () => {
  const storage = memory();
  const { saved } = fixture();
  archiveSnapshot(storage, saved);
  const future = structuredClone(saved);
  future.rooms[0][1].journeyDefinitionId = 'test-only-future';
  future.rooms[0][1].completedMissionIds = ['test-only-mission'];
  archiveSnapshot(storage, future);
  assert.equal(listAttempts(storage).length, 2);
  assert.deepEqual(loadAttempt(storage, ORIGINAL_JOURNEY_ID, saved.rooms[0][1].journeyId!)!.snapshot.rooms[0][1].completedMissionIds, []);
});

test('shared VF bank retains every legacy question and guardian association', () => {
  assert.equal(TRUE_FALSE_QUESTIONS.length, 7);
  assert.equal(new Set(TRUE_FALSE_QUESTIONS.map(q => q.id)).size, 7);
  assert.deepEqual(GUARDIAN_QUESTIONS.map(({ id, statement, isTrue, explanation, sourceNote }) => ({ id, statement, isTrue, explanation, sourceNote })), TRUE_FALSE_QUESTIONS);
  for (const question of LEGACY_MISSION_QUESTIONS) assert.deepEqual(MISSIONS.find(m => m.tfChallenge?.id === question.id)!.tfChallenge, question);
});

test('restored knowledge records keep unique awards isolated by attempt', () => {
  const storage = memory();
  const first = 'attempt-one', next = 'attempt-two';
  const q = CHANNEL_ACTIVITY_QUESTIONS[0];
  confirmChannelAnswer(storage, first, 4, q.id, q.correctIndex);
  confirmChannelAnswer(storage, first, 4, q.id, q.correctIndex);
  assert.equal(channelActivityPoints(storage, first, 4).points, 4);
  assert.equal(channelActivityPoints(storage, first, 4).maximum, 20);
  assert.equal(channelActivityPoints(storage, next, 4).points, 0);
  const card = presentCardQuestion(storage, first, 'missao-1', 'caminhos');
  confirmCardAnswer(storage, first, 'missao-1', PATH_SCENARIOS.find(q => q.id === card.questionId)!.correctIndex);
  const repeated = confirmCardAnswer(storage, first, 'missao-1', PATH_SCENARIOS.find(q => q.id === card.questionId)!.correctIndex)!;
  assert.equal(cardAward(repeated), 5);
  assert.equal(presentCardQuestion(storage, next, 'missao-1', 'caminhos').answer, undefined);
});

test('storage write failures stop migration without modifying the legacy save', () => {
  const raw = JSON.stringify(fixture().saved);
  const storage = { getItem: (key: string) => key === 'entre-nos-solo' ? raw : null,
    setItem: () => { throw Error('quota'); } };
  assert.throws(() => migrateLegacySave(storage), /quota/);
  assert.equal(storage.getItem('entre-nos-solo'), raw);
});

test('pre-versioned saves retain room-based learning identity and separate archived attempts', () => {
  const storage = memory();
  const { saved } = fixture();
  delete saved.rooms[0][1].journeyId;
  delete saved.rooms[0][1].journeyDefinitionId;
  delete saved.rooms[0][1].learningRulesVersion;
  storage.setItem('entre-nos-solo', JSON.stringify(saved));
  migrateLegacySave(storage);
  const ref = listAttempts(storage)[0];
  const record = loadAttempt(storage, ref.journey, ref.attempt)!;
  assert.equal(record.snapshot.rooms[0][1].journeyId, undefined);
  assert.equal(record.snapshot.rooms[0][1].learningRulesVersion, undefined);
  assert.equal(ref.journey, ORIGINAL_JOURNEY_ID);
  assert(ref.attempt.startsWith('legacy-'));
  assert.equal(record.credentials!.roomCode, saved.rooms[0][0]);
});
