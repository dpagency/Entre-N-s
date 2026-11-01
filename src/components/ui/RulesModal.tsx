import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rulesVersion?: 3 | 4;
  missionChannels?: boolean;
  integratedFlow?: boolean;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, rulesVersion, missionChannels = false, integratedFlow = false }) => {
  const voluntary = rulesVersion === 4;
  const legacy = !voluntary && rulesVersion !== 3;
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
            <p>Você percorre a Cidade dos Encontros em quatro missões. Em cada uma, conhece uma história, considera diferentes perspectivas e escolhe como agir. Não há necessidade de acertar a resposta de um Guardião: a decisão é sua.</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Escolha seu avatar e comece a jornada.</li>
              <li>No mapa, selecione uma região e leia ou ouça o dilema.</li>
              {!integratedFlow && <li>Conheça seu papel na situação e participe do Desafio dos Guardiões da Integridade.</li>}
              <li>Escolha livremente sua ação e conheça as escolhas dos outros três participantes virtuais. Não há pontos por concordância.</li>
              <li>Observe as consequências e escolha uma das três cartas do destino.</li>
              {integratedFlow && <><li>Participe do Desafio dos Guardiões da Integridade.</li><li>Responda à pergunta do Desafio dos Canais de Atendimento. O acerto não é necessário para continuar.</li></>}
              <li>Ao concluir a missão, descubra o aprendizado desbloqueado e siga para a próxima região.</li>
            </ol>
            <p className="text-teal-200">Você pode pausar a narração e ajustar sua velocidade. As cartas são Caminhos, Segunda Chance e Revés, sem representar punição moral. Partidas antigas preservam Sorte.</p>
          </section>
          <section className="space-y-3 border-t border-slate-700 pt-5">
            <h3 className="font-bold text-lg text-teal-300">Como ganhar pontos de aprendizagem</h3>
            <p>Os pontos reconhecem a busca de orientação e o conhecimento demonstrado. Não há pontuação por escolher uma ação considerada moralmente certa nos dilemas.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-100">Iniciar o desafio dos Guardiões:</strong> {voluntary ? '0 ponto; a abertura registra somente o progresso.' : '+5 pontos de consulta por missão, conforme a regra desta jornada.'}</li>
              <li><strong className="text-slate-100">Consultar os Canais:</strong> acesso livre e informativo, sem pontos pelo acesso à Comissão de Ética ou a outro canal.</li>
              <li><strong className="text-slate-100">Acertar o desafio do Guardião:</strong> +15 pontos por missão. Erros recebem explicação e não retiram pontos.</li>
              <li><strong className="text-slate-100">{missionChannels ? 'Canais de Atendimento por missão:' : voluntary ? 'Atividade voluntária dos Canais:' : 'Prática dos Canais:'}</strong> {missionChannels ? 'uma pergunta por missão, sem repetição na tentativa. +5 por resposta adequada, até 20 pontos. Participar é necessário antes de concluir cada missão; acertar não é obrigatório. Pode sair e retornar ao mesmo ponto da narrativa. A Carta dos Caminhos é adicional e independente.' : voluntary ? 'cinco perguntas próprias, +4 por resposta adequada, até 20 pontos. Uma tentativa por pergunta, sem penalidade pelo erro. Disponível no mapa, nas missões e no resumo; pode sair e continuar depois.' : 'atividade opcional de verdadeiro ou falso, com feedback e sem pontuação.'}</li>
              <li><strong className="text-slate-100">Cartas do destino:</strong> Caminhos não concede pontos pelo sorteio; Revés −3 e Segunda Chance +1, registrados separadamente da aprendizagem.</li>
              <li><strong className="text-slate-100">Perguntas de Caminhos, Segunda Chance e Revés:</strong> três alternativas, uma mais adequada, com explicação após confirmar. Resposta adequada concede +5 pontos de conhecimento uma única vez; as demais não retiram pontos. Sua decisão na missão permanece registrada.</li>
            </ul>
            <p>{missionChannels ? 'Os quatro desafios dos Guardiões oferecem até 60 pontos e as quatro participações nos Canais, até 20. O acerto não condiciona a medalha ou avaliação.' : voluntary ? 'Os quatro desafios dos Guardiões oferecem até 60 pontos. A atividade voluntária dos Canais oferece até 20, sem ser necessária para a medalha ou avaliação.' : 'Cada encontro apresentado oferece +5 de consulta e até +15 pelo desafio do Guardião.'} As perguntas apresentadas pelas cartas acrescentam oportunidades de +5 pontos cada. O resumo informa o máximo efetivamente disponível, sem tratar todas as partidas como se tivessem as mesmas oportunidades. Caminhos aborda os canais institucionais. Sorte de partidas antigas não apresenta pergunta. Respostas de versões anteriores são preservadas sem bônus retroativo. Repetir a mesma consulta ou resposta não gera pontos extras. Ao final, escolha o Guardião com quem mais se identificou; essa identificação não altera pontos.</p>
            {legacy && <p className="text-amber-200">Esta jornada mantém Sorte +3, Revés −3 e Segunda Chance +1. Créditos anteriores de consulta à Comissão (+5) e acertos nos Canais (+5) são preservados; o acesso e a prática atuais não geram novos pontos. Respostas anteriores não são reavaliadas.</p>}
            <p className="text-xs text-slate-400">A pontuação é experimental e serve à aprendizagem, não à avaliação moral ou funcional do jogador.</p>
            <details className="rounded-xl border border-slate-700 p-4"><summary className="cursor-pointer font-bold text-teal-200">Como interpretar o resumo</summary><div className="mt-3 space-y-2"><p>O total de aprendizagem reúne os créditos dos desafios dos Guardiões, dos Canais e das perguntas das cartas. Efeitos de sorte ou revés ficam separados e não alteram esse total.</p><p>O máximo das cartas considera apenas as perguntas apresentadas na tentativa. Registros anteriores mantêm seus cálculos, inclusive créditos de consulta quando existentes, sem reavaliação ou bônus retroativo.</p></div></details>
          </section>
          <section className="space-y-2 border-t border-slate-700 pt-5">
            <h3 className="font-bold text-lg text-teal-300">Encontros durante a jornada</h3>
            <p>Os quatro Guardiões da Integridade aparecem progressivamente, um por missão, sem repetição. Eles oferecem orientação e desafios educativos, sem determinar suas escolhas. Somente ao final, indique aquele com quem mais se identificou.</p>
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
