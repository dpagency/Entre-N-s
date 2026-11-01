import { useEffect, useRef, useState } from 'react';
import type { SanitizedRoomState } from '../../types/game';
import { CHANNEL_ACTIVITY_QUESTIONS } from '../../data/channelActivity';
import { missionChannelPoints } from '../../services/missionChannels';
import { socketService } from '../../services/socket';
import { celebrateLearning } from '../../services/learningCelebration';

export function MissionChannelActivity({ state, onExploreChannels }: { state: SanitizedRoomState; onExploreChannels: () => void }) {
  const missionId = state.activeMissionId;
  const active = state.phase.startsWith('MISSION_') && (state.missionFlowVersion !== 2 || state.phase === 'MISSION_CHANNELS') && !!missionId && !state.completedMissionIds.includes(missionId);
  const record = missionId ? state.missionChannelActivity?.missions[missionId] : undefined;
  const q = CHANNEL_ACTIVITY_QUESTIONS.find(q => q.id === record?.questionId);
  const [selected, setSelected] = useState<number | null>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const questionText = useRef<HTMLParagraphElement>(null);
  const progress = missionChannelPoints(state);
  useEffect(() => { if (active) socketService.send({ type: 'OPEN_MISSION_CHANNEL' }); }, [active, missionId]);
  useEffect(() => { if (record?.answer !== undefined) feedback.current?.focus(); }, [record?.answer]);
  useEffect(() => {
    if (!active || !q || record?.answer !== undefined || state.missionFlowVersion !== 2) return;
    const frame = requestAnimationFrame(() => questionText.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [active, q?.id, state.missionFlowVersion]);
  const confirm = () => {
    if (selected === null || !q || record?.answer !== undefined) return;
    socketService.send({ type: 'ANSWER_MISSION_CHANNEL', questionId: q.id, answer: selected });
    if (selected === q.correctIndex) celebrateLearning(`${state.journeyId}-channels-${missionId}`);
  };
  return <section data-mission-channel-activity className="space-y-4 rounded-2xl border-2 border-amber-400/70 bg-amber-950/25 p-4 sm:p-5" aria-labelledby="mission-channel-title">
    <h4 id="mission-channel-title" className="text-lg font-black text-amber-200">{state.missionFlowVersion === 2 ? 'Desafio dos Canais de Atendimento' : 'Canais e Competências Institucionais'}</h4>
    {state.missionFlowVersion !== 2 && <><p>Uma participação por missão. +5 por resposta adequada; erro: 0 ponto, sem penalidade. Consultar os canais não concede pontos.</p><p role="status" data-channel-progress>{progress.answered} de 4 participações · {progress.points} de 20 pontos</p></>}
    {active && q && record && <>
      <p ref={questionText} tabIndex={-1} data-channel-question={q.id} className="text-base font-semibold leading-relaxed">{q.prompt}</p>
      <div role="group" aria-label="Alternativas da atividade dos Canais" className="space-y-3">
        {q.options.map((option, i) => <button key={option} type="button" disabled={record.answer !== undefined} aria-pressed={(record.answer ?? selected) === i} onClick={() => setSelected(i)} className={`min-h-12 w-full rounded-xl border-2 p-3 text-left text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${(record.answer ?? selected) === i ? 'border-teal-300 bg-teal-950' : 'border-slate-500 bg-slate-900'}`}>{option}</button>)}
      </div>
      {record.answer === undefined ? <button type="button" disabled={selected === null} onClick={confirm} className="min-h-12 w-full rounded-xl bg-teal-400 p-3 font-bold text-slate-950 disabled:opacity-40">Confirmar resposta dos Canais</button>
        : <div data-channel-feedback ref={feedback} tabIndex={-1} role="status" className="space-y-2 rounded-xl border border-teal-400 bg-slate-950 p-4">
          <p className="font-bold text-teal-200">{record.answer === q.correctIndex ? 'Resposta adequada · +5 pontos' : state.missionFlowVersion === 2 ? 'Vamos aprender juntos:' : 'Resposta inadequada · 0 ponto, sem penalidade'}</p>
          <p>{q.feedback[record.answer]}</p><p>{q.rationale}</p><p><strong>Alternativa mais adequada:</strong> {q.options[q.correctIndex]}</p><p className="text-sm text-slate-300">{q.basis}</p>
          {state.missionFlowVersion !== 2 && <p>Participação desta missão registrada. Você pode voltar à narrativa.</p>}
          <button type="button" onClick={onExploreChannels} className="min-h-12 w-full rounded-xl bg-teal-400 p-3 font-bold text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Fechar pergunta</button>
        </div>}
    </>}
    {!active && <p>Consulta livre, sem pontuação. A próxima participação educativa estará disponível durante uma missão. As participações já realizadas permanecem registradas.</p>}
    <details><summary className="min-h-12 cursor-pointer py-3 font-bold text-teal-200">Rever participações e feedbacks</summary><ol className="space-y-4">{Object.entries(state.missionChannelActivity?.missions || {}).map(([id, r]) => {
      const question = CHANNEL_ACTIVITY_QUESTIONS.find(q => q.id === r.questionId);
      if (!question || r.answer === undefined) return null;
      return <li key={id} className="space-y-2 rounded-xl border border-slate-600 p-3"><p className="font-bold">{id.toUpperCase()} · {question.prompt}</p><p>Sua resposta: {question.options[r.answer]}</p><p>{question.feedback[r.answer]}</p><p>{question.rationale}</p><p>{question.basis}</p></li>;
    })}</ol></details>
  </section>;
}
