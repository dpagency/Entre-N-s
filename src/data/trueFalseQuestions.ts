import type { TrueFalseQuestion } from '../types/game';
import { ADDITIONAL_QUESTIONS } from './ethicsQuestions';

// Published legacy wording and IDs are immutable; revisions require a new version.
export const LEGACY_MISSION_QUESTIONS: readonly TrueFalseQuestion[] = [
{
      id: 'tf-2',
      statement: 'No serviço público, quando um colega comete um erro técnico relevante sob prazo crítico, é justificável usar expressões duras e desqualificantes para demonstrar a gravidade da situação à equipe.',
      isTrue: false,
      explanation: 'FALSO. A urbanidade e o respeito à pessoa são deveres absolutos do servidor público. Erros técnicos devem ser apontados com precisão e clareza objetiva, sem qualquer ataque à dignidade pessoal.',
      sourceNote: 'Orientação Pedagógica Proposta / Código de Conduta e Ética Profissional no Serviço Público.'
    },
{
      id: 'tf-5',
      statement: 'Comentários pejorativos sobre a origem regional, sotaque ou cultura de colegas no ambiente de trabalho podem ser tratados como mera liberdade de expressão se o autor declarar que não tinha intenção de ofender.',
      isTrue: false,
      explanation: 'FALSO. A discriminação e o preconceito são expressamente vedados no serviço público e na legislação brasileira. A ausência alegada de intenção não elide a ilicitude do ato nem o dano moral causado à dignidade da pessoa e ao ambiente de trabalho.',
      sourceNote: 'Orientação Pedagógica Proposta / Lei nº 7.716/1989 e Código de Ética Profissional.'
    }
];
export const TRUE_FALSE_BANK_VERSION = 1;
export const TRUE_FALSE_QUESTIONS: readonly TrueFalseQuestion[] = [
  ...ADDITIONAL_QUESTIONS, ...LEGACY_MISSION_QUESTIONS,
];
export function legacyMissionQuestion(id: string): TrueFalseQuestion {
  const question = LEGACY_MISSION_QUESTIONS.find(q => q.id === id);
  if (!question) throw new Error('Unknown legacy question: ' + id);
  return question;
}
