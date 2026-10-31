import { GUARDIAN_QUESTIONS } from '../data/pilot';
import type { CharacterId } from '../types/game';
import type { QuestionStorage } from './questionRotation';

export function selectGuardianQuestion(storage: QuestionStorage, journey: string, mission: string, guardian: CharacterId, random = Math.random) {
  const pool = GUARDIAN_QUESTIONS.filter(q => q.guardians.includes(guardian));
  const session = `entre-nos-guardian-question-${journey}-${mission}`;
  const existing = pool.find(q => q.id === storage.getItem(session));
  if (existing) return existing;
  let used: string[] = [];
  try { const parsed = JSON.parse(storage.getItem('entre-nos-guardian-used') || '[]'); if (Array.isArray(parsed)) used = parsed.filter(id => typeof id === 'string'); } catch { /* Start a fresh cycle. */ }
  const last = storage.getItem('entre-nos-guardian-last');
  let candidates = pool.filter(q => !used.includes(q.id) && q.id !== last);
  if (!candidates.length) {
    // Only reset the exhausted thematic subset; preserve the history of other themes.
    used = used.filter(id => !pool.some(q => q.id === id));
    candidates = pool.filter(q => q.id !== last);
  }
  if (!candidates.length) candidates = pool;
  if (!candidates.length) throw Error('Este Guardião ainda não possui perguntas editoriais.');
  const chosen = candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
  storage.setItem(session, chosen.id);
  storage.setItem('entre-nos-guardian-last', chosen.id);
  storage.setItem('entre-nos-guardian-used', JSON.stringify([...used, chosen.id]));
  return chosen;
}
