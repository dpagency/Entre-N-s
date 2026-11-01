import { useEffect, useRef, useState } from 'react';
import type { MissionDef, SanitizedRoomState } from '../../types/game';
import { CHARACTERS } from '../../data/characters';
import { GUARDIAN_INTROS, GUARDIAN_QUESTIONS } from '../../data/pilot';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { socketService } from '../../services/socket';
import { browserStorage } from '../../services/browserStorage';
import { selectGuardianQuestion } from '../../services/guardianQuestions';
import { celebrateLearning } from '../../services/learningCelebration';

export function GuardianEncounter({ state, mission }: { state: SanitizedRoomState; mission: MissionDef }) {
  const encounter = state.guardianEncounters?.[mission.id];
  const [proposed, setProposed] = useState<string | null>(null);
  const feedback = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!encounter || encounter.questionId) return;
    const id = selectGuardianQuestion(browserStorage, state.journeyId!, mission.id, encounter.guardianId).id;
    if (state.missionFlowVersion === 2) socketService.send({ type: 'OPEN_GUARDIAN_CHALLENGE', questionId: id });
    else setProposed(id);
  }, [state.journeyId, mission.id, encounter?.guardianId, encounter?.questionId]);
  useEffect(() => { if (encounter?.answer !== undefined) feedback.current?.focus(); }, [encounter?.answer]);
  if (!encounter) return <p role="alert">Não foi possível recuperar este encontro. Retome a jornada pela abertura.</p>;
  const guardian = CHARACTERS[encounter.guardianId];
  const question = GUARDIAN_QUESTIONS.find(q => q.id === encounter.questionId);
  const answered = encounter.answer !== undefined;
  const answerQuestion = (answer: boolean) => {
    if (!question || answered) return;
    socketService.send({ type: 'SUBMIT_GUARDIAN_ANSWER', answer });
    if (answer === question.isTrue) celebrateLearning(`${state.journeyId}-guardian-${mission.id}`);
  };
  if (state.missionFlowVersion === 2) return <section className="mx-auto w-full max-w-5xl space-y-5 rounded-3xl border border-amber-400/60 bg-slate-900 p-5 sm:p-8" aria-labelledby="guardian-challenge-title">
    <h1 id="guardian-challenge-title" className="text-2xl font-black">Desafio dos Guardiões da Integridade</h1>
    <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center gap-2 text-center">
        <CharacterAvatar characterId={guardian.id} size="xl" showBadge={false} className="[&>div:first-child]:w-32 [&>div:first-child]:h-32 lg:[&>div:first-child]:w-40 lg:[&>div:first-child]:h-40" />
        <h2 className="text-2xl font-black">{guardian.name}</h2><p className="font-bold text-teal-200">{guardian.title}</p><p className="max-w-60 text-sm text-amber-200">{guardian.role}</p>
      </div>
      {question ? <div className="space-y-4 rounded-2xl border border-amber-400 bg-slate-950 p-5" aria-label="Pergunta dos Guardiões da Integridade">
        <p className="text-sm text-teal-200">{question.theme} · Ganhe 15 pontos</p>
        <p data-narration="story" data-question-id={question.id} className="text-lg leading-relaxed">{question.statement}</p>
        <div role="group" aria-label="Resposta ao desafio" className="flex flex-wrap gap-3">
          {[true, false].map(answer => <button key={String(answer)} type="button" aria-pressed={encounter.answer === answer} disabled={answered} onClick={() => answerQuestion(answer)} className="min-h-12 rounded-xl border border-teal-400 bg-slate-800 px-6 py-3 font-bold disabled:opacity-60">{answer ? 'Verdadeiro' : 'Falso'}</button>)}
        </div>
        {answered && <div ref={feedback} role="status" tabIndex={-1} className="space-y-3 border-t border-teal-400 pt-4"><p className="font-bold text-teal-200">{encounter.answer === question.isTrue ? '+15 pontos de aprendizagem' : 'Uma oportunidade de aprender.'}</p><p data-narration="story">{question.explanation}</p><p className="text-sm text-slate-300">{question.sourceNote}</p></div>}
      </div> : <p role="status">Preparando pergunta…</p>}
    </div>
    {answered && <button type="button" onClick={() => socketService.send({ type: 'COMPLETE_GUARDIAN_CHALLENGE' })} className="min-h-12 w-full rounded-xl bg-teal-400 p-4 font-black text-slate-950">Continuar para os Canais de Atendimento</button>}
  </section>;
  return <section className="w-full max-w-5xl mx-auto rounded-3xl border border-amber-400/60 bg-slate-900 p-5 sm:p-8 space-y-5" aria-labelledby="guardian-challenge-title">
    <h1 id="guardian-challenge-title" className="text-2xl sm:text-3xl font-black">Desafio dos Guardiões da Integridade</h1>
    <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
      <CharacterAvatar characterId={guardian.id} size="xl" showBadge={false} className="[&>div:first-child]:w-40 [&>div:first-child]:h-40 lg:[&>div:first-child]:w-48 lg:[&>div:first-child]:h-48" />
      <div><h2 id="guardian-encounter-title" className="text-3xl font-black">{guardian.name}</h2><p className="text-lg font-bold text-teal-200">{guardian.title}</p><p className="text-sm text-amber-200">{guardian.role}</p></div>
    </div>
    <p data-narration="story" className="text-lg">{GUARDIAN_INTROS[guardian.id]}</p>
    <p data-narration="story" data-guardian-invitation className="text-lg">Tenho um desafio para você! Que tal aprofundar seus conhecimentos sobre ética e integridade?</p>
    {!question ? <><p className="text-sm text-slate-300">{state.learningRulesVersion === 4 ? 'Iniciar: 0 ponto. Resposta adequada: +15 pontos. Resposta inadequada: 0 ponto, sem penalidade.' : 'Abrir o desafio registra +5 pontos de consulta. Acertar o desafio vale +15 pontos de aprendizagem. O erro não retira pontos.'}</p><button type="button" disabled={!proposed} onClick={() => proposed && socketService.send({ type: 'OPEN_GUARDIAN_CHALLENGE', questionId: proposed })} className="w-full rounded-xl bg-teal-400 text-slate-950 p-4 font-black">Iniciar desafio</button></> : <>
      <div className="rounded-2xl border border-amber-400 bg-slate-950 p-5 space-y-4" aria-label="Pergunta dos Guardiões da Integridade">
        <h3 className="text-xl font-bold text-amber-200">Desafio de conhecimento · +15 pontos</h3>
        <p className="text-sm text-teal-200">{question.theme}</p>
        <p data-narration="story" data-question-id={question.id} className="text-lg">{question.statement}</p>
        <div role="group" aria-label="Resposta ao desafio" className="grid sm:grid-cols-2 gap-3">
          {[true, false].map(answer => <button key={String(answer)} type="button" aria-pressed={encounter.answer === answer} disabled={answered} onClick={() => answerQuestion(answer)} className="rounded-xl border border-teal-400 bg-slate-800 px-5 py-4 font-bold">{answer ? 'Verdadeiro' : 'Falso'}</button>)}
        </div>
      </div>
      {answered && <div ref={feedback} role="status" tabIndex={-1} className="rounded-xl border border-teal-400 p-4 space-y-3">
        <p className="font-bold text-teal-200">{encounter.answer === question.isTrue ? '+15 pontos de aprendizagem' : 'Uma oportunidade de aprender, sem perda de pontos.'}</p>
        <p data-narration="story">{question.explanation}</p><p className="text-sm text-slate-300">{question.sourceNote}</p>
      </div>}
      {answered && <button type="button" onClick={() => socketService.send({ type: 'COMPLETE_GUARDIAN_CHALLENGE' })} className="w-full rounded-xl bg-teal-400 p-4 text-slate-950 font-black">{state.journeyDefinitionId === 'entre-escolhas-e-cuidados' ? 'Tomar uma decisão' : 'Continuar para minha decisão'}</button>}
    </>}
  </section>;
}
