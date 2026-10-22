import React, { useState } from 'react';
import { POST_TEST_QUESTIONS, PRE_TEST_QUESTIONS } from '../../data/evaluations';
import { socketService } from '../../services/socket';
import { Award, ArrowRight, CheckCircle2, HelpCircle, BookOpen, Sparkles } from 'lucide-react';

interface PostTestModalProps {
  isOpen: boolean;
  onCompleted?: () => void;
}

export const PostTestModal: React.FC<PostTestModalProps> = ({ isOpen, onCompleted }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);

  if (!isOpen) return null;

  const currentQ = POST_TEST_QUESTIONS[currentIdx];
  const selectedOptId = answers[currentQ.id];
  const isLast = currentIdx === POST_TEST_QUESTIONS.length - 1;

  const handleSelectOption = (optId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optId }));
  };

  const handleNext = () => {
    if (isLast) {
      socketService.send({
        type: 'SUBMIT_POST_TEST',
        answers,
      });
      setShowFeedback(true);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const handleFinish = () => {
    if (onCompleted) onCompleted();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-slate-100">
        {!showFeedback ? (
          /* Answering Phase */
          <>
            <div className="flex items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Avaliação Final Formativa
                  </span>
                  <h2 className="text-lg font-black text-slate-100">
                    Questão {currentIdx + 1} de {POST_TEST_QUESTIONS.length}
                  </h2>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Consolidação da Aprendizagem
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-sm sm:text-base text-slate-200 leading-relaxed font-serif mb-5 shadow-inner">
              {currentQ.situation}
            </div>

            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOptId === opt.id;
                return (
                  <button
                    key={opt.id}
                    aria-pressed={isSelected}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/40 text-white shadow-md'
                        : 'bg-slate-850 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500 text-slate-950'
                          : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 disabled:opacity-0 transition-all"
              >
                ← Anterior
              </button>

              <button
                onClick={handleNext}
                disabled={!selectedOptId}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 disabled:opacity-40 transition-all active:scale-95"
              >
                <span>{isLast ? 'Submeter e Revelar Feedback Comparativo' : 'Próxima Questão'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* Comparative Feedback Phase (Pre and Post revealed side-by-side) */
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-1">
                Relatório Pedagógico Integrado
              </span>
              <h2 className="text-2xl font-black text-slate-100">
                Síntese Comparativa das Situações Analisadas
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Abaixo estão as reflexões sobre as situações do início e do final da partida.
              </p>
            </div>

            {/* Questions breakdown */}
            <div className="space-y-5">
              {POST_TEST_QUESTIONS.map((postQ, i) => {
                const preQ = PRE_TEST_QUESTIONS[i];
                const myPostOpt = postQ.options.find((o) => o.id === answers[postQ.id]);

                return (
                  <div key={postQ.id} className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-teal-300">
                        Eixo Temático {i + 1}: {postQ.type === 'fundamentada' ? 'Fundamentado' : 'Reflexivo'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      <strong>Situação Avaliada:</strong> “{postQ.situation}”
                    </div>

                    {myPostOpt && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <span className="text-slate-400 block mb-1">Sua Escolha: {myPostOpt.text}</span>
                        <p className="text-teal-300 font-medium">{myPostOpt.feedback}</p>
                      </div>
                    )}

                    <div className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
                      <strong className="text-slate-300">Diretriz Pedagógica:</strong> {postQ.pedagogicalReflection}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleFinish}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Ver Resumo da Jornada da Equipe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
