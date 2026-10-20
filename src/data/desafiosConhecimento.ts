/** Modelo de questões vinculadas à consulta institucional.
 * Apenas questões com fonte validada devem ser apresentadas ao jogador.
 */
export interface DesafioConhecimento {
  id: string;
  missaoId: string;
  canalId: string;
  enunciado: string;
  verdadeiro: boolean;
  explicacao: string;
  referenciaId: string;
  status: 'rascunho' | 'validado';
}

export const DESAFIOS_CONHECIMENTO: DesafioConhecimento[] = [];
