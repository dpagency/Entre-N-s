import type { CharacterId, TrueFalseQuestion } from '../types/game';
import { TRUE_FALSE_QUESTIONS } from './trueFalseQuestions';
import { journeyMissions } from './journeys';

export const PLAYER_AVATARS = [
  { name: 'Exploradora', image: '/personagens/avatar_exploradora.png', body: '/personagens/avatar_exploradora_corpo.png' },
  { name: 'Observador', image: '/personagens/avatar_observador.png', body: '/personagens/avatar_observador_corpo.png' },
  { name: 'Construtora', image: '/personagens/avatar_construtora.png', body: '/personagens/avatar_construtora_corpo.png' },
  { name: 'Estrategista', image: '/personagens/avatar_estrategista.png', body: '/personagens/avatar_estrategista_corpo.png' },
] as const;
export const GUARDIAN_IDS: CharacterId[] = ['alex', 'joana', 'ravi', 'bia'];
export const PILOT_MISSIONS = journeyMissions();
export const PLAYER_ROLE: Record<string, string> = {
  'missao-1': 'Você participa desta reunião de equipe e pode ajudar a abrir espaço para a participação de Lucas.',
  'missao-2': 'Você integra a equipe e presencia a discussão sobre a planilha e o comentário dirigido ao colega.',
  'missao-3': 'Você participa da entrega e precisa decidir como agir diante do erro identificado.',
  'missao-4': 'Você atua no atendimento e precisa decidir como orientar a cidadã no fim do expediente.',
};
export const GUARDIAN_INTROS: Record<CharacterId, string> = {
  alex: 'Sou Rin. Vamos refletir sobre princípios e responsabilidade antes de decidir.',
  joana: 'Sou Wa. Vamos pensar na escuta e no respeito às pessoas.',
  ravi: 'Sou Satori. Vamos examinar informações e consequências com atenção.',
  bia: 'Sou Yūki. Buscar orientação também ajuda a agir com responsabilidade.',
};
export interface GuardianQuestion extends TrueFalseQuestion { theme: string; guardians: CharacterId[] }
// Existing wording, answers, feedback and references only. Themes are editorial metadata.
const associations: Record<string, { theme: string; guardians: CharacterId[] }> = {
  'ET-001': { theme: 'Respeito nas relações', guardians: ['joana', 'bia'] },
  'ET-002': { theme: 'Orientação preventiva', guardians: ['bia', 'ravi'] },
  'ET-003': { theme: 'Ética e responsabilidade', guardians: ['alex', 'ravi'] },
  'ET-004': { theme: 'Integridade e conflitos de interesses', guardians: ['alex'] },
  'ET-005': { theme: 'Reflexão e prevenção', guardians: ['alex', 'ravi', 'bia'] },
  'tf-2': { theme: 'Respeito diante de conflitos', guardians: ['joana'] },
  'tf-5': { theme: 'Respeito às diferenças', guardians: ['joana'] },
};
export const GUARDIAN_QUESTIONS: GuardianQuestion[] = TRUE_FALSE_QUESTIONS.map(q => ({ ...q, ...associations[q.id] }));
export const MOTIVATION = [
  'Cada escolha abre uma nova possibilidade de reflexão. Continue sua jornada!',
  'Diferentes perspectivas nos ajudam a enxergar mais longe.',
  'Refletir também é uma forma de avançar. Sua jornada continua!',
  'Você concluiu sua jornada! Que as descobertas acompanhem suas próximas escolhas.',
];
