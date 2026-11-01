import type { RoomState } from '../../types/game';
import type { learningPoints } from '../../services/learningScore';

export function LearningScoreSummary({ points, rulesVersion }: { points: ReturnType<typeof learningPoints>; rulesVersion: RoomState['learningRulesVersion'] }) {
  // Old channel credits were part of knowledge. Separate labels, never regrade them.
  const previousChannels = rulesVersion === 3 || rulesVersion === 4 ? 0 : points.channelCorrect.length * 5;
  return <section className="rounded-3xl border border-teal-500/50 bg-slate-900 p-5 sm:p-7 space-y-5" aria-label="Pontuação de aprendizagem">
    <h2 className="text-2xl font-black">Sua aprendizagem nesta partida</h2>
    <div><p className="font-bold text-teal-200">Total da aprendizagem</p><p data-learning-total className="text-3xl font-black text-amber-200">{points.total} de {points.maximum}<span className="block text-base font-medium leading-relaxed"> pontos disponíveis</span></p></div>
    <dl className="grid gap-4 sm:grid-cols-3">
      <div data-score-category="guardians" className="rounded-xl border border-slate-700 p-4"><dt>Guardiões da Integridade</dt><dd className="text-xl font-bold text-teal-200">{points.knowledge - previousChannels} de {points.knowledgeMax - previousChannels}</dd></div>
      <div data-score-category="channels" className="rounded-xl border border-slate-700 p-4"><dt>Canais de Atendimento</dt><dd data-channel-summary className="text-xl font-bold text-teal-200">{points.channelPoints + previousChannels} de {points.channelMax + previousChannels}</dd></div>
      <div data-score-category="cards" className="rounded-xl border border-slate-700 p-4"><dt>Cartas do Destino</dt><dd className="text-xl font-bold text-teal-200">{points.cardPoints} de {points.cardMax}</dd></div>
      {points.consultationMax > 0 && <div data-score-category="consultations" className="rounded-xl border border-slate-700 p-4"><dt>Consultas</dt><dd className="text-xl font-bold text-teal-200">{points.consultation} de {points.consultationMax}</dd></div>}
    </dl>
    <p data-fortune-summary className="text-sm text-slate-300">Efeitos das cartas, fora da aprendizagem: <strong>{points.fortune > 0 ? '+' : ''}{points.fortune}</strong></p>
  </section>;
}
