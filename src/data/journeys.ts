import { MISSIONS } from './missions';
import type { MissionDef } from '../types/game';

export const ORIGINAL_JOURNEY_ID = 'cidade-dos-encontros';
export interface JourneyDefinition {
  id: string;
  title: string;
  description: string;
  version: number;
  status: 'available' | 'editorial-review';
  missionIds: readonly string[];
  plannedMissions?: readonly { id: string; title: string; theme: string }[];
  presentation?: {
    opening?: { title: string; text: string };
    closing?: { title: string; text: string };
    resources?: readonly { id: string; label: string; url: string;
      editorialStatus?: 'pending' | 'approved'; consultedAt?: string }[];
  };
}

export const JOURNEYS: readonly JourneyDefinition[] = [
  { id: ORIGINAL_JOURNEY_ID, title: 'A régua da excelência',
    description: 'Quatro missões sobre convivência ética e integridade.', version: 1,
    status: 'available', missionIds: ['missao-1', 'missao-2', 'missao-3', 'missao-4'] },
  { id: 'entre-escolhas-e-cuidados', title: 'Entre escolhas e cuidados',
    description: 'Acessibilidade, discriminação, autonomia e acolhimento nas relações de trabalho.', version: 1,
    status: 'editorial-review', missionIds: [],
    plannedMissions: [
      { id: 'j2-m01', title: 'Diferentes formas de trabalhar', theme: 'Capacitismo e acessibilidade' },
      { id: 'j2-m02', title: 'Fora do padrão', theme: 'Racismo e padrões de aparência profissional' },
      { id: 'j2-m03', title: 'Por seu próprio bem?', theme: 'Maternidade, discriminação e autonomia' },
      { id: 'j2-m04', title: 'Quando alguém procura você', theme: 'Acolhimento diante de possível assédio moral' },
    ],
    presentation: { resources: [{ id: 'guia-lilas', label: 'Conhecer o Guia Lilás',
      url: 'https://www.gov.br/ouvidorias/pt-br/prevencao-e-enfretamento-assedio-discriminacao/guia-lilas',
      editorialStatus: 'pending', consultedAt: '2026-10-30' }] },
  },
];

export function journeyDefinition(id = ORIGINAL_JOURNEY_ID): JourneyDefinition {
  const definition = JOURNEYS.find(j => j.id === id);
  if (!definition) throw new Error('Jornada desconhecida: ' + id);
  return definition;
}

export function journeyMissions(id = ORIGINAL_JOURNEY_ID): MissionDef[] {
  return journeyDefinition(id).missionIds.map(missionId => {
    const mission = MISSIONS.find(m => m.id === missionId);
    if (!mission) throw new Error('Missão indisponível: ' + missionId);
    return mission;
  });
}

export function playableJourney(id = ORIGINAL_JOURNEY_ID): JourneyDefinition {
  const definition = journeyDefinition(id);
  if (definition.status !== 'available' || !definition.missionIds.length) {
    throw new Error('Jornada ainda não disponível.');
  }
  journeyMissions(id);
  return definition;
}
