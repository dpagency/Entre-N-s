import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrowserStorage } from '../src/services/browserStorage';
import { archiveSnapshot, loadAttempt, migrateLegacySave, LEGACY_BACKUP_KEY } from '../src/services/journeyStorage';
import { presentCardQuestion, confirmCardAnswer, cardKnowledgePoints } from '../src/services/cardKnowledge';
import { PATH_SCENARIOS } from '../src/data/pathScenarios';

function fixture() {
  const disk = new Map<string, string>();
  let blocked = false;
  const target = {
    getItem: (key: string) => disk.get(key) ?? null,
    setItem(key: string, value: string) { if (blocked) throw Error('QuotaExceededError'); disk.set(key, value); },
    removeItem(key: string) { if (blocked) throw Error('QuotaExceededError'); disk.delete(key); },
  };
  const create = () => createBrowserStorage(() => target as Storage);
  return { disk, create, storage: create(), block: (value: boolean) => { blocked = value; } };
}

test('refused writes override readable old disk data only within the current session', () => {
  const f = fixture();
  f.storage.setItem('progress', 'old');
  f.block(true);
  f.storage.setItem('progress', 'new');
  assert.equal(f.storage.getItem('progress'), 'new');
  assert.equal(f.storage.persistent, false);
  assert.equal(f.storage.isPersisted('progress'), false);
  assert.equal(f.disk.get('progress'), 'old');
  assert.equal(f.create().getItem('progress'), 'old', 'a fresh page cannot recover an unpersisted value');
});

test('recovery flushes the newest pending values and notifies only on status changes', async () => {
  const f = fixture();
  const statuses: boolean[] = [];
  const unsubscribe = f.storage.subscribe(() => statuses.push(f.storage.persistent));
  f.block(true);
  f.storage.setItem('progress', 'first');
  f.storage.setItem('progress', 'latest');
  await Promise.resolve();
  assert.deepEqual(statuses, [false]);
  f.block(false);
  f.storage.setItem('other', 'ok');
  await Promise.resolve();
  assert.deepEqual(statuses, [false, true]);
  assert.equal(f.disk.get('progress'), 'latest');
  assert.equal(f.create().getItem('progress'), 'latest');
  assert.equal(f.storage.isPersisted('progress'), true);
  unsubscribe();
});

test('failed removals do not resurrect old values and recovery leaves unrelated saves intact', () => {
  const f = fixture();
  f.storage.setItem('remove', 'old');
  f.storage.setItem('other-save', 'preserved');
  f.block(true);
  f.storage.removeItem('remove');
  assert.equal(f.storage.getItem('remove'), null);
  assert.equal(f.disk.get('remove'), 'old');
  f.block(false);
  f.storage.setItem('trigger', 'ok');
  assert.equal(f.disk.has('remove'), false);
  assert.equal(f.disk.get('other-save'), 'preserved');
});

test('legacy archives distinguish session-only progress from durable progress and preserve originals', () => {
  const f = fixture();
  const snapshot = { rooms: [['AUDIT', { journeyId: 'attempt', createdAt: 1, players: {}, phase: 'MISSION_SITUATION' }]], tokens: [], evaluations: [], feedback: [] } as any;
  const raw = JSON.stringify(snapshot);
  f.storage.setItem('entre-nos-solo', raw);
  migrateLegacySave(f.storage);
  const backup = f.storage.getItem(LEGACY_BACKUP_KEY);
  assert.equal(archiveSnapshot(f.storage, snapshot), true);
  f.block(true);
  snapshot.rooms[0][1].phase = 'MISSION_EXPLORE';
  assert.equal(archiveSnapshot(f.storage, snapshot), false);
  assert.equal(loadAttempt(f.storage, 'cidade-dos-encontros', 'attempt')!.snapshot.rooms[0][1].phase, 'MISSION_EXPLORE');
  assert.equal(loadAttempt(f.create(), 'cidade-dos-encontros', 'attempt')!.snapshot.rooms[0][1].phase, 'MISSION_SITUATION');
  assert.equal(f.disk.get('entre-nos-solo'), raw);
  assert.equal(f.disk.get(LEGACY_BACKUP_KEY), backup);
  f.block(false);
  assert.equal(archiveSnapshot(f.storage, snapshot), true);
  assert.equal(loadAttempt(f.create(), 'cidade-dos-encontros', 'attempt')!.snapshot.rooms[0][1].phase, 'MISSION_EXPLORE');
});

test('failed persistence, retry and reload do not duplicate card learning awards', () => {
  const f = fixture();
  const record = presentCardQuestion(f.storage, 'attempt', 'mission', 'caminhos');
  const answer = PATH_SCENARIOS.find(question => question.id === record.questionId)!.correctIndex;
  const score = (storage = f.storage) => cardKnowledgePoints(storage, 'attempt', { mission: { outcome: 'caminhos' } }, ['mission']);
  f.block(true);
  confirmCardAnswer(f.storage, 'attempt', 'mission', answer);
  confirmCardAnswer(f.storage, 'attempt', 'mission', (answer + 1) % 3);
  assert.deepEqual(score(), { points: 5, maximum: 5 });
  assert.deepEqual(score(f.create()), { points: 0, maximum: 5 });
  f.block(false);
  f.storage.setItem('trigger', 'ok');
  const reloaded = f.create();
  confirmCardAnswer(reloaded, 'attempt', 'mission', answer);
  assert.deepEqual(score(reloaded), { points: 5, maximum: 5 });
});
