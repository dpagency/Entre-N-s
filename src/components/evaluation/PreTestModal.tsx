import React, { useState } from 'react';
import { PRE_TEST_QUESTIONS } from '../../data/evaluations';
import { socketService } from '../../services/socket';
import { ClipboardList, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PreTestModalProps {
  isOpen: boolean;
  onCompleted?: () => void;
}

export const PreTestModal: React.FC<PreTestModalProps> = ({ isOpen, onCompleted }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentQ = PRE_TEST_QUESTIONS[currentIdx];
  const selectedOptId = answers[currentQ.id];
  const isLast = currentIdx === PRE_TEST_QUESTIONS.length - 1;

  const handleSelectOption = (optId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optId }));
  };

  const handleNext = () => {
    if (isLast) {
      setIsSubmitting(true);
      socketService.send({
        type: 'SUBMIT_PRE_TEST',
        answers,
      });
      if (onCompleted) onCompleted();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-6 overflow-y-auto overflow-x-hidden bg-slate-950/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full min-w-0 max-w-2xl my-auto bg-slate-900 border border-slate-700 rounded-3xl p-3 sm:p-8 shadow-2xl flex flex-col min-w-0 max-h-[calc(100dvh-1rem)] overflow-y-auto text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                Avaliação Inicial Diagnóstica
              </span>
              <h2 className="text-lg font-black text-slate-100">
                Questão {currentIdx + 1} de {PRE_TEST_QUESTIONS.length}
              </h2>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Respostas anônimas para pesquisa pedagógica
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          Esta breve sondagem avalia percepções iniciais sobre dilemas comuns. O feedback detalhado será apresentado ao final da partida, após a avaliação comparativa.
        </p>

        {/* Situation prompt */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-sm sm:text-base text-slate-200 leading-relaxed font-sans mb-5 shadow-inner">
          {currentQ.situation}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 min-w-0 break-words ${
                  isSelected
                    ? 'bg-teal-950/80 border-teal-400 ring-2 ring-teal-400/40 text-white shadow-md'
                    : 'bg-slate-850 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? 'border-teal-400 bg-teal-500 text-slate-950'
                      : 'border-slate-600'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="min-w-0 flex-1 break-words">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Footer controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 disabled:opacity-0 transition-all"
          >
            ← Anterior
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedOptId || isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 disabled:opacity-40 transition-all active:scale-95"
          >
            <span>{isLast ? 'Concluir e Ir para o Tabuleiro' : 'Próxima Questão'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
