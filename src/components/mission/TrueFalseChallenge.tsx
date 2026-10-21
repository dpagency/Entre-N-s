import React from 'react';
import { MissionDef, RoomState } from '../../types/game';
import { socketService } from '../../services/socket';
import { recordLearning } from '../../services/learningScore';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, ShieldAlert, BookOpen } from 'lucide-react';

import { ADDITIONAL_QUESTIONS } from '../../data/ethicsQuestions';

// Escolha por jornada: uma pergunta estável durante o desafio e diferente da última,
// quando houver alternativas. Mantemos o banco original como uma das opções.
const chooseQuestion = (missionId: string, original: NonNullable<MissionDef['tfChallenge']>) => {
  const options = [original, ...ADDITIONAL_QUESTIONS];
  if (typeof window === 'undefined') return original;
  const key = 'entre-nos-tf-last-' + missionId;
  const sessionKey = 'entre-nos-tf-session-' + (socketService.roomCode || 'unknown') + '-' + missionId;
  try {
    const saved = window.localStorage.getItem(sessionKey);
    const existing = options.find(q => q.id === saved);
    if (existing) return existing;
    const previous = window.localStorage.getItem(key);
    const candidates = options.filter(q => q.id !== previous);
    const pool = candidates.length ? candidates : options;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    window.localStorage.setItem(key, chosen.id);
    window.localStorage.setItem(sessionKey, chosen.id);
    return chosen;
  } catch {
    return options[Math.floor(Math.random() * options.length)];
  }
};

interface TrueFalseChallengeProps {
  mission: MissionDef;
  state: RoomState;
  myPlayerId: string;
}

export const TrueFalseChallenge: React.FC<TrueFalseChallengeProps> = ({
  mission,
  state,
  myPlayerId,
}) => {
  const [selected] = React.useState(() => mission.tfChallenge ? chooseQuestion(mission.id, mission.tfChallenge) : null);
  const tf = selected;
  if (!tf) return null;

  const isHost = state.hostId === myPlayerId;
  const myAnswer = state.tfAnsweredPlayers[myPlayerId];
  const hasAnswered = myAnswer !== undefined;

  const handleAnswer = (answer: boolean) => {
    if (answer === tf.isTrue) recordLearning(socketService.roomCode, mission.id, 'correct');
    socketService.send({
      type: 'SUBMIT_TF_ANSWER',
      answer,
    });
  };

  const handleProceed = () => {
    socketService.send({
      type: 'PROCEED_AFTER_CONSEQUENCE',
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto text-slate-100 animate-in fade-in">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Desafio Pedagógico Intermediário
          </span>
          <span className="text-xs text-slate-400">Verdadeiro ou Falso</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-100 mb-4">
          Diretriz de Conduta no Serviço Público
        </h2>

        {/* The statement to evaluate */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm sm:text-base text-slate-200 leading-relaxed font-serif shadow-inner mb-6">
          “{tf.statement}”
        </div>

        {/* True or False interactive buttons */}
        {!hasAnswered ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleAnswer(true)}
              className="py-4 px-6 rounded-2xl bg-slate-800 hover:bg-emerald-950/80 hover:border-emerald-500/50 border border-slate-700 font-bold text-base text-slate-100 flex items-center justify-center gap-3 transition-all active:scale-98 shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Verdadeiro</span>
            </button>

            <button
              onClick={() => handleAnswer(false)}
              className="py-4 px-6 rounded-2xl bg-slate-800 hover:bg-rose-950/80 hover:border-rose-500/50 border border-slate-700 font-bold text-base text-slate-100 flex items-center justify-center gap-3 transition-all active:scale-98 shadow-lg"
            >
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Falso</span>
            </button>
          </div>
        ) : (
          /* Answer feedback */
          <div className="space-y-4">
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                myAnswer === tf.isTrue
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              }`}
            >
              {myAnswer === tf.isTrue ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <HelpCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold text-sm mb-1">
                  {myAnswer === tf.isTrue
                    ? 'Excelente percepção!'
                    : 'Atenção aos princípios aplicáveis:'}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                  {tf.explanation}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <strong className="text-slate-300">Referência Conceitual:</strong> {tf.sourceNote}
            </div>
          </div>
        )}

        {/* Advance button */}
        {hasAnswered && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleProceed}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 transition-all active:scale-98"
            >
              <span>Ver Consequências Narrativas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
