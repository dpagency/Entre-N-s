import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveConfig } from 'vite';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Navbar } from '../src/components/ui/Navbar';
import { revealChannelFeedback } from '../src/services/channelFeedback';

test('pilot explicitly enables two journeys while both original production configs keep Journey 2 blocked', async () => {
  for (const [configFile, expected] of [['vite.pilot.config.ts', 2], ['vite.institutional.config.ts', 1], ['vite.config.ts', 1]] as const) {
    const config = await resolveConfig({ configFile, configLoader: 'runner', mode: configFile.includes('pilot') ? 'pilot' : 'production' }, 'build');
    const result = await build({ entryPoints: ['src/data/journeys.ts'], bundle: true, write: false, format: 'esm', platform: 'node', define: { __ENTRE_NOS_LOCAL_JOURNEYS__: String(config.define!.__ENTRE_NOS_LOCAL_JOURNEYS__) } });
    const catalog = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
    assert.equal(catalog.JOURNEYS.filter(catalog.isJourneyAvailable).length, expected, configFile);
    if (expected === 2) {
      assert.equal(config.define!.__ENTRE_NOS_INSTITUTIONAL__, 'true');
      assert(config.build.outDir.endsWith('dist-piloto'));
    }
  }
});

test('navigation has one visible yellow Channels action and no room or connection badges', () => {
  const noop = () => {};
  const html = renderToStaticMarkup(React.createElement(Navbar, { state: { roomCode: 'SECRET-ROOM' } as any, isConnected: true, onOpenRules: noop, onOpenInstitutionalGuide: noop, onOpenAccessibility: noop, onReturnHome: noop }));
  assert(!html.includes('SECRET-ROOM'));
  assert(!html.includes('Online'));
  assert(html.includes('bg-amber-400'));
  assert(html.includes('>Canais</span>'));
  assert(html.includes('Jogo sério de aprendizagem e reflexão sobre ética pública'));
});

test('feedback focuses without page scrolling and aligns the nearest scrollable pane', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'getComputedStyle');
  Object.defineProperty(globalThis, 'getComputedStyle', { configurable: true, value: (element: any) => ({ overflowY: element.overflow }) });
  try {
    const outer = { overflow: 'auto', scrollHeight: 2000, clientHeight: 500, scrollTop: 40, parentElement: null };
    const pane = { overflow: 'auto', scrollHeight: 1000, clientHeight: 300, scrollTop: 20, parentElement: outer, getBoundingClientRect: () => ({ top: 100 }) };
    const wrapper = { overflow: 'visible', parentElement: pane };
    let options: unknown;
    const feedback = { parentElement: wrapper, focus: (value: unknown) => { options = value; }, getBoundingClientRect: () => ({ top: 450 }) };
    revealChannelFeedback(feedback as unknown as HTMLElement);
    assert.deepEqual(options, { preventScroll: true });
    assert.equal(pane.scrollTop, 354);
    assert.equal(outer.scrollTop, 40);
    revealChannelFeedback(null);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'getComputedStyle', previous);
    else Reflect.deleteProperty(globalThis, 'getComputedStyle');
  }
});
