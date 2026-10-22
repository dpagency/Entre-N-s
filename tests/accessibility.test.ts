import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCESSIBILITY_KEY, readAccessibilityPreferences, saveAccessibilityPreferences } from '../src/services/accessibility';

test('accessibility preferences survive storage and preserve all three settings', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const preferences = { fontSize: 'xlarge' as const, highContrast: true, reducedMotion: true };
  saveAccessibilityPreferences(storage, preferences);
  assert.deepEqual(readAccessibilityPreferences(storage), preferences);
  assert(values.has(ACCESSIBILITY_KEY));
});
test('unavailable, malformed and invalid preferences fall back safely', () => {
  const defaults = { fontSize: 'normal', highContrast: false, reducedMotion: false };
  for (const value of [null, '{', 'null', '{"fontSize":"huge","highContrast":"true","reducedMotion":1}']) {
    assert.deepEqual(readAccessibilityPreferences({ getItem: () => value }), defaults);
  }
  assert.deepEqual(readAccessibilityPreferences({ getItem: () => { throw Error('blocked'); } }), defaults);
  assert.doesNotThrow(() => saveAccessibilityPreferences({ setItem: () => { throw Error('blocked'); } }, defaults as any));
});
