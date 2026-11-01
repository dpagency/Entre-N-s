import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { ClientMessage } from '../../src/types/game';
process.env.ENTRE_NOS_LOCAL_JOURNEYS = '1';
const engine = await import('../../src/game/engine');
const { journeyMissions } = await import('../../src/data/journeys');
const { GUARDIAN_QUESTIONS } = await import('../../src/data/pilot');
const { CHANNEL_ACTIVITY_QUESTIONS } = await import('../../src/data/channelActivity');
const { presentCardQuestion, cardScenario, confirmCardAnswer } = await import('../../src/services/cardKnowledge');
const { learningPoints } = await import('../../src/services/learningScore');
const { browserStorage } = await import('../../src/services/browserStorage');
const { archiveSnapshot, loadAttempt } = await import('../../src/services/journeyStorage');
const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
before(() => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => values.set(k, v), removeItem: (k: string) => values.delete(k),
  } });
});
after(() => { if (original) Object.defineProperty(globalThis, 'localStorage', original); else Reflect.deleteProperty(globalThis, 'localStorage'); });

for (const id of ['cidade-dos-encontros', 'entre-escolhas-e-cuidados']) for (const correct of [true, false]) for (const separateCards of [true, false]) {
  test(`integrated order, score and resume: ${id}, ${correct ? 'adequate' : 'inadequate'}, ${separateCards ? 'separate cards' : 'previous combined cards'}`, () => {
    engine.restore({ rooms: [], tokens: [], evaluations: [], feedback: [] });
    const connection = { readyState: 1, send: (_: string) => {} };
    const send = (m: ClientMessage) => engine.handleClientMessage(connection, m);
    const room = () => engine.snapshot().rooms[0][1];
    send({ type: 'CREATE_ROOM', nickname: 'Teste', characterId: 'alex', variantIndex: correct ? 0 : 1, pilotVersion: 2, journeyDefinitionId: id });
    send({ type: 'START_GAME' });
    if (!separateCards) delete room().cardStageVersion; // Save from the approved previous flow.
    assert.equal(room().missionFlowVersion, 2);
    const attempt = room().journeyId!;
    const score = () => learningPoints(attempt, room().fortuneCards, room());
    const resume = () => {
      const snapshot = structuredClone(engine.snapshot());
      const before = JSON.parse(JSON.stringify(room()));
      const points = score();
      archiveSnapshot(browserStorage, snapshot);
      const saved = loadAttempt(browserStorage, id, attempt)!;
      assert.equal(saved.snapshot.rooms[0][1].missionFlowVersion, 2);
      engine.restore(saved.snapshot as ReturnType<typeof engine.snapshot>);
      send({ type: 'JOIN_ROOM', roomCode: room().roomCode, sessionToken: snapshot.tokens[0][0], nickname: 'Teste', characterId: 'alex', variantIndex: correct ? 0 : 1 });
      assert.equal(room().phase, before.phase);
      for (const field of ['journeyId', 'cardStageVersion', 'guardianOrder', 'individualChoices', 'historyLog', 'fortuneCards', 'cardChallenges', 'guardianEncounters', 'missionChannelActivity', 'completedMissionIds'] as const) assert.deepEqual(room()[field], before[field]);
      assert.deepEqual(score(), points);
    };
    for (const [index, mission] of journeyMissions(id).entries()) {
      send({ type: 'VOTE_DESTINATION', regionId: mission.regionId }); send({ type: 'CONFIRM_DESTINATION' });
      if (mission.dialogue) send({ type: 'SET_DIALOGUE_STEP', step: mission.dialogue.length - 1 });
      send({ type: 'OPEN_MISSION_CHANNEL' });
      assert.equal(room().missionChannelActivity!.missions[mission.id], undefined);
      send({ type: 'EXPLORE_MISSION' }); assert.equal(room().phase, 'MISSION_EXPLORE');
      assert.equal(room().guardianEncounters![mission.id].questionId, undefined);
      resume();
      const chosen = mission.actions[index % mission.actions.length].id;
      send({ type: 'SUBMIT_INDIVIDUAL_CHOICE', actionId: chosen });
      send({ type: 'SUBMIT_INDIVIDUAL_CHOICE', actionId: mission.actions[(index + 1) % mission.actions.length].id });
      send({ type: 'PROCEED_TO_REVEAL' }); assert.equal(room().phase, 'MISSION_REVEAL'); resume();
      send({ type: 'OPEN_COLLECTIVE_VOTE' }); assert.equal(room().phase, 'MISSION_CONSEQUENCE');
      assert.equal(room().chosenCollectiveActionId, chosen);
      send({ type: 'PROCEED_AFTER_CONSEQUENCE' }); assert.equal(room().phase, 'MISSION_CONSEQUENCE');
      if (separateCards) {
        send({ type: 'DRAW_FORTUNE_CARD', cardIndex: 0 }); assert.equal(room().fortuneCards![mission.id], undefined);
        send({ type: 'OPEN_CARD_CHALLENGE' }); assert.equal(room().phase, 'MISSION_CARDS'); resume();
      }
      send({ type: 'DRAW_FORTUNE_CARD', cardIndex: index % 3 });
      send({ type: 'PROCEED_AFTER_CONSEQUENCE' }); assert.equal(room().phase, separateCards ? 'MISSION_CARDS' : 'MISSION_CONSEQUENCE');
      const fortune = room().fortuneCards![mission.id];
      const record = presentCardQuestion(browserStorage, attempt, mission.id, fortune.outcome as any);
      const question = cardScenario(record) as import('../../src/data/fortuneScenarios').KnowledgeScenario;
      const answer = correct ? question.correctIndex : (question.correctIndex + 1) % question.options.length;
      confirmCardAnswer(browserStorage, attempt, mission.id, answer);
      send({ type: 'COMPLETE_CARD_CHALLENGE', questionId: 'invalid', answer });
      assert.equal(room().cardChallenges![mission.id], undefined);
      send({ type: 'COMPLETE_CARD_CHALLENGE', questionId: question.id, answer });
      send({ type: 'COMPLETE_CARD_CHALLENGE', questionId: question.id, answer: (answer + 1) % 3 });
      assert.equal(room().cardChallenges![mission.id].answer, answer); resume();
      send({ type: 'PROCEED_AFTER_CONSEQUENCE' }); assert.equal(room().phase, 'MISSION_GUARDIAN');
      const encounter = room().guardianEncounters![mission.id];
      const guardian = GUARDIAN_QUESTIONS.find(q => q.guardians.includes(encounter.guardianId))!;
      send({ type: 'OPEN_GUARDIAN_CHALLENGE', questionId: guardian.id });
      send({ type: 'SUBMIT_GUARDIAN_ANSWER', answer: correct ? guardian.isTrue : !guardian.isTrue });
      send({ type: 'SUBMIT_GUARDIAN_ANSWER', answer: correct ? !guardian.isTrue : guardian.isTrue });
      resume();
      send({ type: 'COMPLETE_GUARDIAN_CHALLENGE' }); assert.equal(room().phase, 'MISSION_CHANNELS');
      send({ type: 'PROCEED_AFTER_CONSEQUENCE' }); assert.equal(room().phase, 'MISSION_CHANNELS');
      send({ type: 'OPEN_MISSION_CHANNEL' }); resume();
      const participation = room().missionChannelActivity!.missions[mission.id];
      const channel = CHANNEL_ACTIVITY_QUESTIONS.find(q => q.id === participation.questionId)!;
      send({ type: 'ANSWER_MISSION_CHANNEL', questionId: channel.id, answer: correct ? channel.correctIndex : (channel.correctIndex + 1) % 3 });
      const points = score().total;
      send({ type: 'ANSWER_MISSION_CHANNEL', questionId: channel.id, answer: channel.correctIndex });
      assert.equal(score().total, points); resume();
      send({ type: 'PROCEED_AFTER_CONSEQUENCE' });
      assert.equal(room().phase, index === 3 ? 'GAME_SUMMARY' : 'BOARD_SELECT');
    }
    assert.equal(new Set(Object.values(room().missionChannelActivity!.missions).map(r => r.questionId)).size, 4);
    assert.equal(new Set(Object.values(room().guardianEncounters!).map(r => r.guardianId)).size, 4);
    send({ type: 'SELECT_FINAL_GUARDIAN', guardianId: 'joana' }); assert.equal(room().finalGuardianId, 'joana');
    assert.equal(score().maximum, 100); assert.equal(score().total, correct ? 100 : 0);
    resume();
    const archived = loadAttempt(browserStorage, id, attempt)!;
    send({ type: 'START_GAME' });
    assert.notEqual(room().journeyId, attempt); assert.equal(score().knowledge, 0);
    assert.deepEqual(room().cardChallenges, {}); assert.deepEqual(room().missionChannelActivity!.missions, {});
    assert.equal(archived.snapshot.rooms[0][1].completedMissionIds.length, 4);
  });
}
