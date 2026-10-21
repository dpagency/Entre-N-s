// Pontos de aprendizagem: consultas e conhecimento, nunca decisões éticas.
// A chave da sala separa jornadas e mantém o registro após recarregar a página.
type LearningRecord = { guardian: string[]; commission: string[]; correct: string[]; channelCorrect: string[] };
const empty = (): LearningRecord => ({ guardian: [], commission: [], correct: [], channelCorrect: [] });
function key(roomCode: string) { return 'entre-nos-learning-' + roomCode; }
export function getLearning(roomCode: string): LearningRecord {
  try {
    const data = JSON.parse(localStorage.getItem(key(roomCode)) || 'null');
    return { guardian: Array.isArray(data?.guardian) ? data.guardian : [], commission: Array.isArray(data?.commission) ? data.commission : [], correct: Array.isArray(data?.correct) ? data.correct : [], channelCorrect: Array.isArray(data?.channelCorrect) ? data.channelCorrect : [] };
  } catch { return empty(); }
}
export function recordLearning(roomCode: string | null, missionId: string | null, kind: keyof LearningRecord): boolean {
  if (!roomCode || !missionId) return false;
  const data = getLearning(roomCode);
  if (data[kind].includes(missionId)) return false;
  data[kind].push(missionId);
  localStorage.setItem(key(roomCode), JSON.stringify(data));
  window.dispatchEvent(new Event('entre-nos-learning-update'));
  return true;
}
export function learningPoints(roomCode: string | null, fortuneCards?: Record<string, { outcome: string }>) {
  const data = roomCode ? getLearning(roomCode) : empty();
  const consultation = Math.min(40, (data.guardian.length + data.commission.length) * 5);
  const knowledge = Math.min(60, data.correct.length * 15 + data.channelCorrect.length * 5);
  const fortune = Object.values(fortuneCards || {}).reduce((sum, card) => sum + (card.outcome === 'sorte' ? 3 : card.outcome === 'reves' ? -3 : card.outcome === 'segunda_chance' ? 1 : 0), 0);
  return { consultation, knowledge, fortune, total: Math.max(0, Math.min(100, consultation + knowledge + fortune)), ...data };
}
