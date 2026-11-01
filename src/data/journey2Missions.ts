import type { MissionDef, RegionId, DiscoveryKey } from '../types/game';
import { JOURNEY2_EDITORIAL } from './journey2Editorial';

const regions: RegionId[] = ['praca', 'sala', 'oficina', 'portal'];
const discoveries: DiscoveryKey[] = ['escuta', 'respeito', 'responsabilidade', 'orientacao'];
function buildMissions(): MissionDef[] {
  return JOURNEY2_EDITORIAL.missions.map((editorial, i) => ({
    id: `j2-m0${i + 1}`, title: editorial.title, code: `J2-M0${i + 1}`, regionId: regions[i],
    missionType: 'fundamentada', pedagogicalGoal: editorial.theme,
    situation: { context: editorial.context, trigger: editorial.prompt, knownFacts: [], uncertainties: [], institutionalNote: '' },
    dialogue: [
      ...editorial.context.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÇ])/u).map(text => ({ speaker: 'Contexto', text })),
      ...editorial.dialogue.map(turn => ({ ...turn })),
      { speaker: 'Pergunta ao jogador', text: editorial.prompt },
    ],
    decisionPrompt: editorial.prompt, finalReflection: editorial.finalReflection,
    perspectives: [], additionalContexts: [],
    actions: editorial.actions.map((action, j) => ({
      id: `j2-m0${i + 1}-${action.letter.toLowerCase()}`, title: action.title, description: action.title,
      actionType: 'dialogo', justification: '', isPreferableInContext: j === (i < 2 ? 1 : 2),
      consequenceSummary: action.consequence, consequenceDetails: action.consequence, pedagogicalFeedback: action.reflection,
    })),
    discovery: { key: discoveries[i], title: editorial.title, subtitle: editorial.finalReflection,
      description: editorial.finalReflection, reflectionQuestion: editorial.finalReflection, icon: 'BookOpen' },
    editorialInfo: { source: 'docs/roteiro-jornada-2-entre-escolhas-e-cuidados.md', version: '1', reviewStatus: 'Aprovado para teste local' },
  }));
}
export const JOURNEY2_MISSIONS = /* @__PURE__ */ buildMissions();
