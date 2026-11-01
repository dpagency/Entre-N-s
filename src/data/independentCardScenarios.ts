
// Presentation only: keep IDs, alternatives, feedback and grading unchanged.
// Journey 1 and saved answer records retain their original data.
const independentPrompts: Record<string, string> = {
  'ca-1': 'Em uma situação hipotética de trabalho, surge uma dúvida preventiva sobre como conduzir uma conversa profissional com respeito. Não há relato de infração. Qual caminho é mais adequado?',
  'ca-2': 'Um servidor do INPI cogita uma atividade privada e tem dúvida sobre possível conflito de interesses. Ele está sujeito ao procedimento de consulta pelo SeCI. Como agir antes de iniciar?',
  'ca-3': 'Uma cidadã quer registrar reclamação sobre um serviço e sugerir uma melhoria. Qual encaminhamento corresponde a essa finalidade?',
  'ca-4': 'Em uma situação hipotética, aparecem indícios de alteração indevida de registros funcionais. Qual distinção entre os canais é mais adequada?',
  'ca-5': 'Uma pessoa quer denunciar possível conduta contrária às normas éticas no INPI. Conforme a orientação oficial de recebimento, qual caminho deve seguir?',
};
export function independentCardScenario<T extends { id: string; prompt: string }>(scenario: T): T {
  return independentPrompts[scenario.id] ? { ...scenario, prompt: independentPrompts[scenario.id] } : scenario;
}
