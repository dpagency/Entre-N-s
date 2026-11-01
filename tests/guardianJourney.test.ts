import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shuffledGuardianOrder, knownJourneyGuardians } from '../src/services/guardianJourney';
import { GUARDIAN_IDS, GUARDIAN_QUESTIONS } from '../src/data/pilot';

test('new attempts can vary order and always contain all four guardians exactly once', () => {
  const first = shuffledGuardianOrder(() => 0);
  const second = shuffledGuardianOrder(length => length - 1);
  assert.notDeepEqual(first, second);
  for (const order of [first, second]) {
    assert.equal(order.length, 4); assert.equal(new Set(order).size, 4);
    assert.deepEqual([...order].sort(), [...GUARDIAN_IDS].sort());
  }
  assert.deepEqual(second, GUARDIAN_IDS, 'Shuffling must never mutate the shared identities');
});

test('final identification requires four distinct completed encounters, regardless of correctness', () => {
  const missions = ['missao-1','missao-2','missao-3','missao-4'];
  const records = Object.fromEntries(missions.map((id,i) => {
    const guardianId = GUARDIAN_IDS[i];
    const question = GUARDIAN_QUESTIONS.find(q=>q.guardians.includes(guardianId))!;
    return [id, { guardianId, questionId: question.id, answer: !question.isTrue }];
  }));
  assert.equal(knownJourneyGuardians({guardianEncounters:records}, missions).length,4);
  assert.equal(knownJourneyGuardians({guardianEncounters:records}, missions.slice(0,3)).length,3);
  const repeated = Object.fromEntries(missions.map(id=>[id,records['missao-1']]));
  assert.equal(knownJourneyGuardians({guardianEncounters:repeated},missions).length,1);
  assert.equal(knownJourneyGuardians({guardianEncounters:{'missao-1':{...records['missao-1'],answer:undefined}}},missions).length,0);
  assert.equal(knownJourneyGuardians({guardianEncounters:{'missao-1':{...records['missao-1'],questionId:'invalid'}}},missions).length,0);
});
