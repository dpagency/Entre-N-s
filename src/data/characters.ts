import { CharacterDef, CharacterId } from '../types/game';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  alex: {
    id: 'alex',
    name: 'Alex',
    title: 'Explorador',
    role: 'Curiosidade · Soluções · Novas perspectivas',
    description: 'Alex faz perguntas, explora ideias e imagina caminhos diferentes. Ajuda o grupo a enxergar possibilidades onde outros veem obstáculos.',
    quote: '“Sempre tem um jeito de olhar por outro ângulo. Vamos descobrir juntos?”',
    powerName: 'Mais Contexto',
    powerDescription: 'Revela uma informação contextual oculta da situação para todo o grupo.',
    color: '#0d9488', // teal-600
    accentBg: 'bg-teal-900/30 text-teal-300 border-teal-500/40',
    borderColor: 'border-teal-500',
  },
  joana: {
    id: 'joana',
    name: 'Joana',
    title: 'Acolhedora',
    role: 'Escuta · Diálogo · Convivência',
    description: 'Joana valoriza as pessoas e acredita no poder da escuta. Ajuda o grupo a compreender diferentes pontos de vista e a cuidar para que todas as vozes sejam consideradas.',
    quote: '“Toda história tem várias formas de ser contada. Vamos ouvir o que cada lugar tem a revelar?”',
    powerName: 'Olhar Adiante',
    powerDescription: 'Antecipa duas consequências plausíveis para escolhas em debate, sem impor a resposta.',
    color: '#f59e0b', // amber-500
    accentBg: 'bg-amber-900/30 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500',
  },
  ravi: {
    id: 'ravi',
    name: 'Ravi',
    title: 'Analista',
    role: 'Análise · Estratégia · Organização',
    description: 'Ravi observa, conecta informações e transforma ideias em planos. Ajuda o grupo a avaliar impactos, organizar ideias e encontrar soluções práticas.',
    quote: '“Quando juntamos as peças, o cenário fica mais claro. Vamos pensar isso passo a passo.”',
    powerName: 'Nova Escuta',
    powerDescription: 'Abre uma rodada extra de reconsideração das escolhas após ouvir novas perspectivas.',
    color: '#f59e0b', // amber-500
    accentBg: 'bg-amber-900/30 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500',
  },
  bia: {
    id: 'bia',
    name: 'Bia',
    title: 'Conselheira',
    role: 'Experiência · Equilíbrio · Visão de futuro',
    description: 'Bia traz a experiência de quem já viveu muitas histórias. Ajuda a considerar impactos de longo prazo, lembra a importância do bem comum e inspira confiança.',
    quote: '“O que fazemos hoje constrói o amanhã. Vamos escolher com responsabilidade e esperança?”',
    powerName: 'Outro Olhar',
    powerDescription: 'Revela a perspectiva oculta de um ator da instituição que ainda não havia sido ouvido.',
    color: '#f43f5e', // rose-500
    accentBg: 'bg-rose-900/30 text-rose-300 border-rose-500/40',
    borderColor: 'border-rose-500',
  },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);

export const AVATAR_VARIANTS = [
  { id: 0, label: 'Padrão', suffix: 'V1', badgeColor: 'bg-sky-500' },
  { id: 1, label: 'Solar', suffix: 'V2', badgeColor: 'bg-amber-500' },
  { id: 2, label: 'Esmeralda', suffix: 'V3', badgeColor: 'bg-emerald-500' },
  { id: 3, label: 'Ametista', suffix: 'V4', badgeColor: 'bg-purple-500' },
  { id: 4, label: 'Coral', suffix: 'V5', badgeColor: 'bg-rose-500' },
  { id: 5, label: 'Índigo', suffix: 'V6', badgeColor: 'bg-indigo-500' },
];
