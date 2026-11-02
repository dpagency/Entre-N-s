import { useEffect, useRef, useState } from 'react';
import { CHANNEL_ACTIVITY_QUESTIONS } from '../../data/channelActivity';
import { channelActivityPoints, confirmChannelAnswer, readChannelAnswer, pendingChannelQuestion, rememberChannelQuestion } from '../../services/channelActivity';
import { browserStorage } from '../../services/browserStorage';
import { celebrateLearning } from '../../services/learningCelebration';
import { revealChannelFeedback } from '../../services/channelFeedback';

export function ChannelActivity({ journey }: { journey: string }) {
  const [records, setRecords] = useState(() => Object.fromEntries(CHANNEL_ACTIVITY_QUESTIONS.map(q => [q.id, readChannelAnswer(browserStorage, journey, q.id)])));
  const [index, setIndex] = useState<number | null>(() => pendingChannelQuestion(browserStorage, journey));
  const [selected, setSelected] = useState<number | null>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const questionText = useRef<HTMLParagraphElement>(null);
  const completion = useRef<HTMLParagraphElement>(null);
  const mounted = useRef(false);
  const question = index === null ? null : CHANNEL_ACTIVITY_QUESTIONS[index];
  const record = question ? records[question.id] : null;
  const progress = channelActivityPoints(browserStorage, journey, 4);
  useEffect(() => {
    if (question && !record) rememberChannelQuestion(browserStorage, journey, question.id);
    // Let the dialog manager capture its opener before moving focus inside it.
    if (!mounted.current) {
      mounted.current = true;
      const frame = requestAnimationFrame(() => (questionText.current ?? completion.current)?.scrollIntoView({ block: 'start' }));
      return () => cancelAnimationFrame(frame);
    }
    if (record) revealChannelFeedback(feedback.current);
    else questionText.current?.focus();
  }, [journey, question?.id, record]);
  const confirm = () => {
    if (selected === null || record || !question) return;
    const saved = confirmChannelAnswer(browserStorage, journey, 4, question.id, selected);
    if (!saved) return;
    setRecords(previous => ({ ...previous, [question.id]: saved }));
    if (saved.answer === question.correctIndex) celebrateLearning(`${journey}-channels-${question.id}`);
    window.dispatchEvent(new Event('entre-nos-learning-update'));
  };
  const changeQuestion = (next: number) => { setIndex(next); setSelected(null); };
  return <section data-channel-activity aria-labelledby="channel-activity-title" className="rounded-2xl border-2 border-amber-400/70 bg-amber-950/25 p-4 sm:p-5 space-y-4">
    <h4 id="channel-activity-title" className="text-lg font-black text-amber-200">Atividade voluntária dos Canais</h4>
    <p className="text-base">+4 por resposta adequada · uma tentativa por pergunta. Consulta livre, sem pontos pelo acesso.</p>
    <p role="status" data-channel-progress className="font-bold text-teal-200">{progress.answered} de 5 perguntas respondidas · {progress.points} de 20 pontos</p>
    {progress.answered === 5 && <p ref={completion} data-channel-complete tabIndex={-1} role="status" className="font-bold text-teal-200">Atividade concluída! Suas respostas e feedbacks continuam disponíveis. A consulta aos Canais permanece livre.</p>}
    <nav aria-label="Perguntas da atividade dos Canais" className="flex flex-wrap gap-2">
      {CHANNEL_ACTIVITY_QUESTIONS.map((q, i) => <button key={q.id} type="button" aria-label={`Pergunta ${i + 1}${records[q.id] ? ' respondida' : ''}`} aria-current={i === index ? 'step' : undefined} onClick={() => changeQuestion(i)} className={`min-h-12 min-w-12 rounded-xl border-2 px-3 py-2 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${i === index ? 'border-teal-300 bg-teal-950' : 'border-slate-500 bg-slate-900'}`}>{i + 1}{records[q.id] ? ' ✓' : ''}</button>)}
    </nav>
    {question && <>
    <p ref={questionText} tabIndex={-1} data-channel-question={question.id} className="text-base font-semibold leading-relaxed">{question.prompt}</p>
    <div role="group" aria-label="Alternativas da atividade dos Canais" className="space-y-3">
      {question.options.map((option, answer) => <button key={answer} type="button" disabled={!!record} aria-pressed={(record?.answer ?? selected) === answer} onClick={() => setSelected(answer)} className={`min-h-12 w-full rounded-xl border-2 p-3 text-left text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${(record?.answer ?? selected) === answer ? 'border-teal-300 bg-teal-950' : 'border-slate-500 bg-slate-900'}`}>{option}</button>)}
    </div>
    {!record && <button type="button" disabled={selected === null} onClick={confirm} className="min-h-12 w-full rounded-xl bg-teal-400 p-3 font-bold text-slate-950 disabled:opacity-40">Confirmar resposta dos Canais</button>}
    {record && <div data-channel-feedback ref={feedback} tabIndex={-1} role="status" className="rounded-xl border border-teal-400 bg-slate-950 p-4 space-y-2 text-base">
      <p className="font-bold text-teal-200">{record.answer === question.correctIndex ? 'Resposta adequada · +4 pontos' : 'Resposta inadequada · 0 ponto, sem penalidade'}</p>
      <p>{question.feedback[record.answer]}</p>
      <p>{question.rationale}</p>
      <p><strong>Alternativa mais adequada:</strong> {question.options[question.correctIndex]}</p>
      <p className="text-sm text-slate-300">{question.basis}</p>
    </div>}
    {index !== null && index < CHANNEL_ACTIVITY_QUESTIONS.length - 1 && <button type="button" onClick={() => changeQuestion(index + 1)} className="min-h-12 w-full rounded-xl border border-teal-400 p-3 font-bold text-teal-200">Próxima pergunta dos Canais</button>}
    </>}
    <p className="text-sm text-slate-300">Pode sair e continuar depois. Esta atividade não é necessária para concluir a jornada.</p>
  </section>;
}
