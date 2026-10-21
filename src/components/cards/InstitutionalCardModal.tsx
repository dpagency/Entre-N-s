import React, { useState, useRef } from 'react';
import { INSTITUTIONAL_CHANNELS } from '../../data/institutionalChannels';
import { ADDITIONAL_QUESTIONS } from '../../data/ethicsQuestions';
import { recordLearning } from '../../services/learningScore';
import { socketService } from '../../services/socket';
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
  const [quiz, setQuiz] = useState<{ missionId: string; index: number; answer?: boolean } | null>(null);
  const missionId = socketService.activeMissionId;
  const question = quiz && ADDITIONAL_QUESTIONS[quiz.index];
  const openQuiz = () => {
    if (!missionId) return;
    const key = 'entre-nos-channel-quiz-' + (socketService.roomCode || '') + '-' + missionId;
    try {
      const saved = window.localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setQuiz({ missionId, index: parsed.index, answer: parsed.answer });
        return;
      }
      const index = Math.floor(Math.random() * ADDITIONAL_QUESTIONS.length);
      window.localStorage.setItem(key, JSON.stringify({ index }));
      setQuiz({ missionId, index });
    } catch {
      setQuiz({ missionId, index: 0 });
    }
  };
  const answerQuiz = (answer: boolean) => {
    if (!quiz || !question || quiz.answer !== undefined) return;
    if (answer === question.isTrue) recordLearning(socketService.roomCode, quiz.missionId, 'channelCorrect');
    const next = { ...quiz, answer };
    setQuiz(next);
    try { window.localStorage.setItem('entre-nos-channel-quiz-' + (socketService.roomCode || '') + '-' + quiz.missionId, JSON.stringify({ index: quiz.index, answer })); } catch { /* optional persistence */ }
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
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Guia Institucional
              </span>
              <span className="text-xs text-slate-400">Recurso Permanente de Consulta</span>
            </div>
            <h2 id="modal-title" className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
              Canais e Competências Institucionais
            </h2>
            <p className="text-xs text-slate-400">
              Cada instância possui competência legal e limites próprios. Conheça para onde encaminhar com responsabilidade.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Channel selector list (left) */}
          <div className="md:col-span-5 p-4 space-y-2 bg-slate-950/40 md:overflow-y-auto">
            {INSTITUTIONAL_CHANNELS.map((ch) => {
              const isSelected = selectedChannel.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => { setSelectedChannel(ch); if (window.innerWidth < 768) window.requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); if (/comiss[aã]o de [eé]tica/i.test(ch.name)) recordLearning(socketService.roomCode, socketService.activeMissionId, 'commission'); }}
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
                  <div>
                    <div className="font-bold text-sm leading-snug">{ch.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{ch.role}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Channel details (right) */}
          <div ref={detailsRef} className="md:col-span-7 p-5 sm:p-6 space-y-5 md:overflow-y-auto bg-slate-900 scroll-mt-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                {getIcon(selectedChannel.icon)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{selectedChannel.name}</h3>
                <p className="text-xs font-medium text-teal-400">{selectedChannel.role}</p>
              </div>
            </div>

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

            <section className="rounded-2xl border border-teal-500/40 bg-teal-950/20 p-4 space-y-3">
              <h4 className="font-bold text-teal-200">Para refletir · verdadeiro ou falso</h4>
              <p className="text-xs text-slate-300">A consulta é livre. Se quiser, responda uma pergunta educativa. Acertar vale +5 pontos de conhecimento por missão, sem substituir o acesso ao canal.</p>
              {!missionId ? <p className="text-xs text-slate-400">O desafio fica disponível durante as missões.</p> : !quiz || quiz.missionId !== missionId ? (
                <button type="button" onClick={openQuiz} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-slate-950">Responder uma pergunta</button>
              ) : question && (
                <>
                  <p className="text-sm text-slate-100">{question.statement}</p>
                  {quiz.answer === undefined ? <div className="flex gap-2">
                    <button type="button" onClick={() => answerQuiz(true)} className="rounded-lg bg-slate-700 px-4 py-2 text-sm">Verdadeiro</button>
                    <button type="button" onClick={() => answerQuiz(false)} className="rounded-lg bg-slate-700 px-4 py-2 text-sm">Falso</button>
                  </div> : <div className="space-y-2 text-sm">
                    <p className="font-bold text-teal-200">{quiz.answer === question.isTrue ? 'Resposta correta! +5 pontos de conhecimento.' : 'Vamos aprender juntos:'}</p>
                    <p>{question.explanation}</p>
                    <p className="text-xs text-slate-400">{question.sourceNote}</p>
                  </div>}
                </>
              )}
            </section>
            {/* Flow clarification */}
            <div className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <strong className="text-slate-300">Esclarecimento de Fluxo:</strong> {selectedChannel.flowClarification}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
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
