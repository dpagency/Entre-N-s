import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseJourney2Editorial } from '../scripts/journey2-editorial.mjs';
import { JOURNEY2_EDITORIAL } from '../src/data/journey2Editorial';
import { JOURNEY2_MISSIONS } from '../src/data/journey2Missions';
import { independentCardScenario } from '../src/data/independentCardScenarios';
import { PATH_SCENARIOS } from '../src/data/pathScenarios';
import { SECOND_CHANCE_SCENARIOS, SETBACK_SCENARIOS } from '../src/data/fortuneScenarios';
import { CHANNEL_ACTIVITY_QUESTIONS } from '../src/data/channelActivity';

test('all approved dialogue, options, outcomes and reflections are preserved verbatim', () => {
  const approved = parseJourney2Editorial(readFileSync('docs/roteiro-jornada-2-entre-escolhas-e-cuidados.md', 'utf8'));
  assert.deepEqual(JOURNEY2_EDITORIAL, approved);
  for (const [index, mission] of JOURNEY2_MISSIONS.entries()) {
    const source = approved.missions[index];
    assert.equal(mission.title, source.title);
    assert.equal(mission.actions.length, 4);
    for (const [i, action] of mission.actions.entries()) {
      assert.equal(action.title, source.actions[i].title);
      assert.equal(action.consequenceSummary, source.actions[i].consequence);
      assert.equal(action.pedagogicalFeedback, source.actions[i].reflection);
    }
    assert.equal(mission.finalReflection, source.finalReflection);
    assert.equal(mission.dialogue!.filter(t => t.speaker === 'Contexto').map(t => t.text).join(' '), source.context);
    assert.deepEqual(mission.dialogue!.filter(t => !['Contexto', 'Pergunta ao jogador'].includes(t.speaker)).map(({ speaker, text }) => ({ speaker, text })), source.dialogue);
  }
});

test('the scenes are short, progressive and have no character portraits', () => {
  assert.deepEqual(JOURNEY2_MISSIONS.map(m => m.dialogue!.length), [6, 9, 7, 8]);
  for (const mission of JOURNEY2_MISSIONS) for (const turn of mission.dialogue!) {
    assert(turn.text.split(/\s+/).length <= 45, 'An approved turn unexpectedly became a long block');
    assert.equal(turn.avatarIndex, undefined);
    assert.equal(turn.player, undefined);
  }
});

test('reusable activities are independent of the mission without changing keys or competencies', () => {
  for (const original of [...PATH_SCENARIOS, ...SECOND_CHANCE_SCENARIOS, ...SETBACK_SCENARIOS, ...CHANNEL_ACTIVITY_QUESTIONS]) {
    const adapted = independentCardScenario(original);
    assert(!/missão|missões|retratad[oa]/i.test(adapted.prompt));
    assert.deepEqual({ ...adapted, prompt: original.prompt }, original);
  }
  assert(PATH_SCENARIOS.every(q => q.prompt.includes('missão')), 'Journey 1 retains its original bank');
});
