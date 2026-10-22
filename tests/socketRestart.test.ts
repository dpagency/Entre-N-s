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
    const { socketService } = await import('../src/services/socket');
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
  } finally {
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
