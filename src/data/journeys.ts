import { GAME_MISSIONS as MISSIONS } from './missionRegistry';
import { LOCAL_JOURNEYS_ENABLED } from '../localDevelopment';
import { JOURNEY2_EDITORIAL } from './journey2Editorial';
import type { MissionDef } from '../types/game';

export const ORIGINAL_JOURNEY_ID = 'cidade-dos-encontros';
export interface JourneyDefinition {
  id: string;
  title: string;
  description: string;
  version: number;
  localOnly?: boolean;
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
    status: LOCAL_JOURNEYS_ENABLED ? 'available' : 'editorial-review', localOnly: true,
    missionIds: LOCAL_JOURNEYS_ENABLED ? ['j2-m01', 'j2-m02', 'j2-m03', 'j2-m04'] : [],
    plannedMissions: [
      { id: 'j2-m01', title: 'Diferentes formas de trabalhar', theme: 'Capacitismo e acessibilidade' },
      { id: 'j2-m02', title: 'Fora do padrão', theme: 'Racismo e padrões de aparência profissional' },
      { id: 'j2-m03', title: 'Por seu próprio bem?', theme: 'Maternidade, discriminação e autonomia' },
      { id: 'j2-m04', title: 'Quando alguém procura você', theme: 'Acolhimento diante de possível assédio moral' },
    ],
    presentation: {
      ...(LOCAL_JOURNEYS_ENABLED ? { opening: {title: JOURNEY2_EDITORIAL.opening.title, text: JOURNEY2_EDITORIAL.opening.paragraphs.join('\n\n')}, closing: {title: JOURNEY2_EDITORIAL.closing.title, text: JOURNEY2_EDITORIAL.closing.paragraphs.join('\n\n')} } : {}),
      resources: [{ id: 'guia-lilas', label: 'Conhecer o Guia Lilás',
      url: 'https://www.gov.br/ouvidorias/pt-br/prevencao-e-enfretamento-assedio-discriminacao/guia-lilas',
      editorialStatus: LOCAL_JOURNEYS_ENABLED ? 'approved' : 'pending', consultedAt: '2026-10-30' }] },
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
  if (!isJourneyAvailable(definition)) {
    throw new Error('Jornada ainda não disponível.');
  }
  journeyMissions(id);
  return definition;
}

export function isJourneyAvailable(definition: JourneyDefinition): boolean {
  return definition.status === 'available' && definition.missionIds.length > 0 && (!definition.localOnly || LOCAL_JOURNEYS_ENABLED);
}
