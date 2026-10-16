import React from 'react';
import { X, BookOpen, Users, Compass, Award, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { CHARACTER_LIST } from '../../data/characters';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                Manual do Guardião
              </span>
              <h2 id="rules-title" className="text-xl font-black text-slate-100">
                Como jogar · Entre Nós
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-bold text-lg text-teal-300">Como jogar</h3>
            <p>Você percorre a Vila dos Encontros em quatro missões. Em cada uma, conhece uma história, considera diferentes perspectivas e escolhe como agir. Não há necessidade de acertar a resposta de um Guardião: a decisão é sua.</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Escolha seu Guardião e comece a jornada.</li>
              <li>No mapa, selecione uma região e leia ou ouça o dilema.</li>
              <li>Explore as informações disponíveis e escolha sua ação.</li>
              <li>Conheça outras perspectivas. Se o Guardião escolhido preferiria outra ação, ele poderá compartilhar uma reflexão, sem mudar sua decisão.</li>
              <li>Observe as consequências e escolha uma das três cartas do destino.</li>
              <li>Ao concluir a missão, descubra o aprendizado desbloqueado e siga para a próxima região.</li>
            </ol>
            <p className="text-teal-200">Você pode pausar a narração e ajustar sua velocidade. As cartas trazem elementos de sorte, revés ou segunda chance, sem representar punição moral.</p>
          </section>
          <section className="space-y-2 border-t border-slate-700 pt-5">
            <h3 className="font-bold text-lg text-teal-300">Os quatro Guardiões</h3>
            <p>Cada Guardião simboliza uma maneira de observar dilemas. Eles são guias de reflexão, não juízes das suas escolhas.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHARACTER_LIST.map(c => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-slate-100">{c.name} — {c.title}</strong>
                  <p className="text-sm mt-1">{c.description}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="space-y-2 border-t border-slate-700 pt-5">
            <h3 className="font-bold text-lg text-teal-300">Por trás da jornada: proposta pedagógica</h3>
            <p>As missões foram construídas para exercitar escuta, respeito, responsabilidade, orientação e discernimento diante de situações institucionais. Seus objetivos pedagógicos orientam a criação das histórias, mas não antecipam a resposta do jogador.</p>
            <p>Alguns dilemas envolvem responsabilidades e competências institucionais definidas; outros apresentam alternativas com vantagens e riscos legítimos. A reflexão sobre consequências é mais importante que uma classificação moral de pessoas.</p>
            <p>A Comissão de Ética, a Corregedoria, a Ouvidoria e a gestão de pessoas possuem atribuições distintas. As situações são ficcionais e não substituem orientações oficiais.</p>
          </section>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs transition-colors"
          >
            Entendido, Vamos Jogar!
          </button>
        </div>
      </div>
    </div>
  );
};
