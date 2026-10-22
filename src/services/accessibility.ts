export type TextSize = 'normal' | 'large' | 'xlarge';
export interface AccessibilityPreferences {
  reducedMotion: boolean;
  fontSize: TextSize;
  highContrast: boolean;
}
export const ACCESSIBILITY_KEY = 'entre-nos-accessibility';
export function readAccessibilityPreferences(storage: Pick<Storage, 'getItem'>): AccessibilityPreferences {
  const defaults: AccessibilityPreferences = { reducedMotion: false, fontSize: 'normal', highContrast: false };
  try {
    const saved = JSON.parse(storage.getItem(ACCESSIBILITY_KEY) || 'null');
    return {
      reducedMotion: saved?.reducedMotion === true,
      fontSize: ['normal', 'large', 'xlarge'].includes(saved?.fontSize) ? saved.fontSize : 'normal',
      highContrast: saved?.highContrast === true,
    };
  } catch { return defaults; }
}
export function saveAccessibilityPreferences(storage: Pick<Storage, 'setItem'>, preferences: AccessibilityPreferences) {
  try { storage.setItem(ACCESSIBILITY_KEY, JSON.stringify(preferences)); } catch { /* Keep preferences active in memory when storage is unavailable. */ }
}
