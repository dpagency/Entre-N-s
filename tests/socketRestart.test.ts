import { listAttempts, loadAttempt } from '../src/services/journeyStorage';
import { browserStorage } from '../src/services/browserStorage';
import test from 'node:test';
import assert from 'node:assert/strict';
import { restore, snapshot } from '../src/game/engine';

test('starting a new solo journey releases the old binding and creates an independent saved room', async () => {
  const descriptors = new Map(['localStorage', 'sessionStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const makeStorage = () => { const values = new Map<string, string>(); return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } }; };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: makeStorage() });
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: makeStorage() });
  restore({ rooms: [], tokens: [], evaluations: [], feedback: [] });
  try {
    sessionStorage.setItem('entre-nos-mode', 'solo');
    const { socketService } = await import('../src/services/socket');
    assert.equal(sessionStorage.getItem('entre-nos-mode'), null);
    assert(JSON.parse(browserStorage.getItem('entre-nos-journeys-v1-tab-backup-unidentified')!).some(([key, value]: [string, string]) => key === 'entre-nos-mode' && value === 'solo'));
    const create = () => new Promise<void>(resolve => {
      const unsubscribe = socketService.onState(state => { if (state.phase === 'LOBBY') { unsubscribe(); resolve(); } });
      socketService.send({ type: 'CREATE_ROOM', nickname: 'Teste', characterId: 'alex', variantIndex: 0 });
    });
    await create();
    const firstCode = socketService.roomCode;
    const firstPlayer = socketService.myPlayerId;
    assert(firstCode && firstPlayer);
    socketService.activeMissionId = 'missao-1';
    socketService.discardSavedJourney();
    assert.equal(socketService.activeMissionId, null);
    assert.equal(socketService.hasSavedJourney(), false);
    await Promise.race([create(), new Promise((_, reject) => { const timeout = setTimeout(() => reject(Error('A segunda sala não foi criada')), 1000); timeout.unref(); })]);
    assert.notEqual(socketService.roomCode, firstCode);
    assert.notEqual(socketService.myPlayerId, firstPlayer);
    assert.equal(snapshot().rooms.find(([code]) => code === firstCode)?.[1].players[firstPlayer].isConnected, false);
    // Persistence happens at the end of the queued message, after state delivery.
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(socketService.hasSavedJourney(), true);
    assert.equal(snapshot().rooms.find(([code]) => code === socketService.roomCode)?.[1].completedMissionIds.length, 0);
    const refs = listAttempts(browserStorage);
    const old = refs.find(ref => loadAttempt(browserStorage, ref.journey, ref.attempt)?.credentials?.roomCode === firstCode)!;
    assert(old, 'The discarded active slot must remain archived');
    const secondCode = socketService.roomCode;
    await Promise.race([new Promise<void>(resolve => {
      const off = socketService.onState(state => { if (state.roomCode === firstCode) { off(); resolve(); } });
      socketService.resumeAttempt(old.journey, old.attempt);
    }), new Promise((_, reject) => { const timer = setTimeout(() => reject(Error('Archive resume timed out')), 1000); timer.unref(); })]);
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(socketService.roomCode, firstCode);
    assert.equal(socketService.myPlayerId, firstPlayer);
    assert(listAttempts(browserStorage).some(ref => loadAttempt(browserStorage, ref.journey, ref.attempt)?.credentials?.roomCode === secondCode));


    await socketService.startNewJourney('cidade-dos-encontros', { nickname: 'Novo avatar', variantIndex: 3 });
    const current = snapshot().rooms.find(([code]) => code === socketService.roomCode)![1];
    assert.equal(current.phase, 'BOARD_SELECT');
    assert.equal(current.players[socketService.myPlayerId!].variantIndex, 3);
    assert.equal(current.learningRulesVersion, 4);
    assert.deepEqual(current.completedMissionIds, []);
    assert(listAttempts(browserStorage).some(ref => ref.attempt === old.attempt));
    const beforeBlocked = JSON.stringify(snapshot());
    await assert.rejects(socketService.startNewJourney('entre-escolhas-e-cuidados', { nickname: 'Bloqueada', variantIndex: 0 }));
    assert.equal(JSON.stringify(snapshot()), beforeBlocked);
  } finally {
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
