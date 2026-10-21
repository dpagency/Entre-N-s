import { RegionDef, RegionId } from '../types/game';

export const REGIONS: Record<RegionId, RegionDef> = {
  praca: {
    id: 'praca',
    name: 'Praça do Encontro',
    subtitle: 'Convivência e Inclusão',
    theme: 'Escuta Ativa, Respeito à Diversidade e Diálogo',
    description: 'O coração comunitário da Cidade dos Encontros. Onde servidores e cidadãos circulam livremente, conversam nos intervalos e onde a convivência diária é testada em pequenas atitudes.',
    color: '#10b981', // emerald-500
    bgGradient: 'from-emerald-950/80 via-slate-900 to-slate-950',
    iconName: 'Users',
    x: 28, // % SVG coords
    y: 35,
  },
  sala: {
    id: 'sala',
    name: 'Sala das Decisões',
    subtitle: 'Pressão e Equidade',
    theme: 'Divergências Técnicas, Hierarquia e Integridade',
    description: 'Espaço de deliberação estratégica, reuniões de metas e debates acalorados. Aqui a urgência dos prazos e a hierarquia colocam à prova a serenidade e a lealdade ao interesse público.',
    color: '#6366f1', // indigo-500
    bgGradient: 'from-indigo-950/80 via-slate-900 to-slate-950',
    iconName: 'Building2',
    x: 72,
    y: 32,
  },
  oficina: {
    id: 'oficina',
    name: 'Oficina Coletiva',
    subtitle: 'Cooperação e Recursos',
    theme: 'Trabalho em Equipe, Responsabilidade e Apoio Mútuo',
    description: 'O laboratório e espaço técnico onde projetos ganham forma, relatórios são compilados e os recursos públicos são geridos no dia a dia. Erros aqui exigem cooperação e honestidade.',
    color: '#f59e0b', // amber-500
    bgGradient: 'from-amber-950/80 via-slate-900 to-slate-950',
    iconName: 'Wrench',
    x: 32,
    y: 75,
  },
  portal: {
    id: 'portal',
    name: 'Portal do Atendimento',
    subtitle: 'Respeito e Interesse Público',
    theme: 'Atendimento ao Cidadão, Clareza de Informação e Equidade',
    description: 'A ponte entre a instituição e a sociedade. Balcões físicos e virtuais onde as pessoas buscam seus direitos com expectativas e vulnerabilidades reais, demandando acolhimento e limites justos.',
    color: '#06b6d4', // cyan-500
    bgGradient: 'from-cyan-950/80 via-slate-900 to-slate-950',
    iconName: 'Compass',
    x: 75,
    y: 72,
  },
};

export const REGION_LIST = Object.values(REGIONS);
