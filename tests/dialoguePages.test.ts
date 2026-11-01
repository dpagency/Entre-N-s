import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dialoguePages, dialoguePageIndex } from '../src/services/dialoguePages';
import { JOURNEY2_MISSIONS } from '../src/data/journey2Missions';

test('paired presentation preserves every approved turn and all old saved offsets', () => {
  for (const mission of JOURNEY2_MISSIONS) {
    const turns = mission.dialogue!;
    const pages = dialoguePages(turns);
    assert(pages.length < turns.length);
    assert.deepEqual(pages.flatMap(page => turns.slice(page.start, page.end + 1)), turns);
    assert.equal(pages.at(-1)!.end, turns.length - 1);
    for (let i = 0; i < turns.length; i++) {
      const page = pages[dialoguePageIndex(pages, i)];
      assert(page.start <= i && page.end >= i, 'A legacy offset must still show its original passage');
    }
    for (const page of pages) assert(turns.slice(page.start, page.end + 1).filter(t => t.speaker !== 'Pergunta ao jogador').length <= 2);
  }
});

test('odd exchanges retain their last single turn; exceptionally long turns remain separate', () => {
  const turn = (text: string) => ({ speaker: 'Personagem', text });
  const odd = [turn('Primeira'), turn('Segunda'), turn('Terceira')];
  assert.deepEqual(dialoguePages(odd), [{ start: 0, end: 1 }, { start: 2, end: 2 }]);
  const long = [turn('palavra '.repeat(50)), turn('outra '.repeat(30))];
  assert.deepEqual(dialoguePages(long), [{ start: 0, end: 0 }, { start: 1, end: 1 }]);
  assert.deepEqual(dialoguePages([]), []);
  assert.equal(dialoguePageIndex(dialoguePages(odd), -1), 0);
});
