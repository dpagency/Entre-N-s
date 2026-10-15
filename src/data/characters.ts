import { CharacterDef, CharacterId } from '../types/game';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  alex: {
    id: 'alex',
    name: 'Rin',
    title: 'Guardião da Integridade',
    role: 'Coerência · Princípios · Responsabilidade',
    description: 'Rin observa se as escolhas correspondem aos princípios que defendemos. Identifica riscos éticos e valoriza a responsabilidade pública.',
    quote: '“Antes de julgar o caminho, é preciso entender como chegamos até aqui.”',
    powerName: 'Mais Contexto',
    powerDescription: 'Revela uma informação contextual oculta da situação para todo o grupo.',
    color: '#0d9488', // teal-600
    accentBg: 'bg-teal-900/30 text-teal-300 border-teal-500/40',
    borderColor: 'border-teal-500',
  },
  joana: {
    id: 'joana',
    name: 'Wa',
    title: 'Guardiã da Convivência',
    role: 'Escuta · Respeito · Diálogo',
    description: 'Wa acolhe diferentes perspectivas e procura caminhos de diálogo, respeito e colaboração, sem ignorar conflitos.',
    quote: '“Uma decisão não termina quando é assinada, mas quando seus efeitos alcançam as pessoas.”',
    powerName: 'Olhar Adiante',
    powerDescription: 'Antecipa duas consequências plausíveis para escolhas em debate, sem impor a resposta.',
    color: '#3b82f6', // blue-500
    accentBg: 'bg-blue-900/30 text-blue-300 border-blue-500/40',
    borderColor: 'border-blue-500',
  },
  ravi: {
    id: 'ravi',
    name: 'Satori',
    title: 'Guardião do Discernimento',
    role: 'Evidências · Reflexão · Consequências',
    description: 'Satori conecta informações, questiona simplificações e avalia causas e consequências antes de decidir.',
    quote: '“Quando escutamos de verdade, o conflito deixa de ser batalha e vira construção.”',
    powerName: 'Nova Escuta',
    powerDescription: 'Abre uma rodada extra de reconsideração das escolhas após ouvir novas perspectivas.',
    color: '#f59e0b', // amber-500
    accentBg: 'bg-amber-900/30 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500',
  },
  bia: {
    id: 'bia',
    name: 'Yūki',
    title: 'Guardiã da Coragem',
    role: 'Coragem · Ação · Responsabilidade',
    description: 'Yūki encontra disposição para agir diante de situações difíceis, mesmo quando fazer o correto exige enfrentar desconfortos.',
    quote: '“Se ninguém fez a pergunta difícil, a decisão ainda não está madura.”',
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
