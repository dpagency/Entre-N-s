import React, { useState, useRef, useEffect } from 'react';
import { LearningConfetti } from '../ui/LearningConfetti';
import { INSTITUTIONAL_CHANNELS } from '../../data/institutionalChannels';
import { ADDITIONAL_QUESTIONS } from '../../data/ethicsQuestions';
import { recordLearning } from '../../services/learningScore';
import { socketService } from '../../services/socket';
import { ChannelQuiz, loadChannelQuiz, saveChannelQuiz } from '../../services/questionRotation';
import { InstitutionalChannelDef } from '../../types/game';
import { X, Scale, Briefcase, Megaphone, ShieldAlert, HeartHandshake, CheckCircle2, AlertOctagon, Info } from 'lucide-react';

interface InstitutionalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstitutionalCardModal: React.FC<InstitutionalCardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<InstitutionalChannelDef>(
    INSTITUTIONAL_CHANNELS[0]
  );

  const detailsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [quiz, setQuiz] = useState<ChannelQuiz | null>(null);
  const [educationOpen, setEducationOpen] = useState(false);
  const missionId = socketService.activeMissionId;
  const roomCode = socketService.roomCode;
  const currentQuiz = quiz?.missionId === missionId && quiz?.roomCode === roomCode ? quiz : null;
  const question = currentQuiz && ADDITIONAL_QUESTIONS[currentQuiz.index];
  useEffect(() => {
    if (!isOpen) return;
    const next = roomCode && missionId ? loadChannelQuiz(localStorage, roomCode, missionId) : null;
    setQuiz(next);
    setEducationOpen(!missionId || next?.answer !== undefined);
  }, [isOpen, roomCode, missionId]);
  useEffect(() => {
    if (!isOpen || currentQuiz?.answer === undefined) return;
    const feedback = feedbackRef.current;
    const scroller = window.innerWidth < 768 ? contentRef.current : detailsRef.current;
    feedback?.focus({ preventScroll: true });
    if (feedback && scroller) {
      scroller.scrollTop += feedback.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 16;
    }
  }, [isOpen, currentQuiz?.roomCode, currentQuiz?.missionId, currentQuiz?.answer]);
  const answerQuiz = (answer: boolean) => {
    if (!currentQuiz || !question || currentQuiz.answer !== undefined) return;
    const saved = loadChannelQuiz(localStorage, currentQuiz.roomCode, currentQuiz.missionId);
    if (saved.answer !== undefined) { setQuiz(saved); setEducationOpen(true); return; }
    const awarded = answer === question.isTrue && recordLearning(roomCode, currentQuiz.missionId, 'channelCorrect');
    const next = { ...currentQuiz, answer, awarded };
    setQuiz(next);
    saveChannelQuiz(localStorage, next);
    setEducationOpen(true);
  };
  if (!isOpen) return null;

  const getIcon = (name: string) => {
    switch (name) {
      case 'Scale':
        return <Scale className="w-5 h-5" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5" />;
      case 'Megaphone':
        return <Megaphone className="w-5 h-5" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl max-h-[90dvh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Guia Institucional
              </span>
              <span className="text-xs text-slate-400">Recurso Permanente de Consulta</span>
            </div>
            <h2 id="modal-title" className="break-words text-xl sm:text-2xl font-black text-slate-100 mt-1">
              Canais e Competências Institucionais
            </h2>
            <p className="text-xs text-slate-400">
              Conheça a finalidade de cada canal. O desafio é opcional e a consulta ao conteúdo é livre.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content body */}
        <div ref={contentRef} className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Channel selector list (left) */}
          <div className="md:col-span-5 p-4 space-y-2 bg-slate-950/40 md:overflow-y-auto">
            {INSTITUTIONAL_CHANNELS.map((ch) => {
              const isSelected = selectedChannel.id === ch.id;
              return (
                <button
                  key={ch.id}
                  aria-pressed={isSelected}
                  onClick={() => { setSelectedChannel(ch); setEducationOpen(!missionId || currentQuiz?.answer !== undefined); if (window.innerWidth < 768) window.requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: document.documentElement.dataset.reducedMotion === 'true' ? 'auto' : 'smooth', block: 'start' })); if (/comiss[aã]o de [eé]tica/i.test(ch.name)) recordLearning(socketService.roomCode, socketService.activeMissionId, 'commission'); }}
                  className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 border ${
                    isSelected
                      ? 'bg-teal-950/70 border-teal-500/60 ring-1 ring-teal-500/40 text-white'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isSelected
                        ? 'bg-teal-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {getIcon(ch.icon)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm leading-snug">{ch.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{ch.role}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Channel details (right) */}
          <div ref={detailsRef} className="min-w-0 break-words md:col-span-7 p-4 sm:p-6 space-y-5 md:overflow-y-auto bg-slate-900 scroll-mt-2">
            <div className="flex items-center gap-3">
              <div className="shrink-0 p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                {getIcon(selectedChannel.icon)}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-100">{selectedChannel.name}</h3>
                <p className="text-xs font-medium text-teal-400">{selectedChannel.role}</p>
              </div>
            </div>

            <section aria-labelledby="channel-challenge-title" className="relative overflow-hidden rounded-2xl border-2 border-amber-400/70 bg-amber-950/25 p-4 sm:p-5 space-y-4">
              {currentQuiz?.awarded && <LearningConfetti />}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 id="channel-challenge-title" className="font-black text-lg text-amber-200">Desafio de conhecimento</h4>
                <span className="rounded-full border border-amber-400 bg-amber-400 px-3 py-1 font-black text-slate-950">+5 pontos</span>
              </div>
              <p className="text-sm text-slate-200">Verdadeiro ou falso · acerto vale +5 pontos de conhecimento por missão. A consulta ao canal é livre.</p>
              {!missionId ? <p className="text-sm text-slate-300">O desafio fica disponível durante as missões.</p> : question && currentQuiz ? <>
                <p data-question-id={question.id} className="text-base font-semibold leading-relaxed text-slate-100">{question.statement}</p>
                <div role="group" aria-label="Resposta ao desafio" className="flex flex-wrap gap-3">
                  <button type="button" disabled={currentQuiz.answer !== undefined} aria-pressed={currentQuiz.answer === true} onClick={() => answerQuiz(true)} className="min-h-12 rounded-xl border border-slate-500 bg-slate-800 px-5 py-3 text-base font-bold">Verdadeiro</button>
                  <button type="button" disabled={currentQuiz.answer !== undefined} aria-pressed={currentQuiz.answer === false} onClick={() => answerQuiz(false)} className="min-h-12 rounded-xl border border-slate-500 bg-slate-800 px-5 py-3 text-base font-bold">Falso</button>
                </div>
                {currentQuiz.answer !== undefined && <div ref={feedbackRef} role="status" tabIndex={-1} className="rounded-xl border border-teal-400/50 bg-slate-950 p-4 space-y-2 text-sm">
                  <p className="font-bold text-teal-200">{currentQuiz.answer !== question.isTrue ? 'Vamos aprender juntos:' : currentQuiz.awarded ? '+5 pontos' : 'Resposta correta · pontos já contabilizados'}</p>
                  <p>{question.explanation}</p>
                  <p className="text-xs text-slate-300">{question.sourceNote}</p>
                </div>}
              </> : null}
            </section>
            <button type="button" aria-expanded={educationOpen} aria-controls="channel-educational-content" onClick={() => setEducationOpen(open => !open)} className="min-h-12 w-full rounded-xl border border-teal-400 px-4 py-3 text-base font-bold text-teal-200">
              {educationOpen ? 'Ocultar conteúdo complementar' : currentQuiz?.answer !== undefined ? 'Ver conteúdo complementar do canal' : 'Consultar conteúdo do canal sem responder'}
            </button>
            {educationOpen && <section id="channel-educational-content" aria-label="Conteúdo educativo do canal" className="space-y-4">
            {/* When to use */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wide mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Quando Acionar:
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {selectedChannel.whenToUse}
              </p>
            </div>

            {/* When NOT to use / limits */}
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wide mb-1">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                O Que Não Cabe a este Canal:
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {selectedChannel.whenNotToUse}
              </p>
            </div>

            {/* Example in game */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Exemplo no Cotidiano:
              </span>
              <p className="text-xs sm:text-sm text-slate-300 italic">
                “{selectedChannel.exampleInGame}”
              </p>
            </div>

            {/* Flow clarification */}
            <div className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <strong className="text-slate-300">Esclarecimento de Fluxo:</strong> {selectedChannel.flowClarification}
            </div>
            </section>}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            Orientação Pedagógica Proposta • Não substitui normas internas do seu órgão
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
