/** Catálogo editorial. Não exibir como fundamentação validada antes de revisão. */
export interface ReferenciaNormativa {
  id: string;
  titulo: string;
  orgao: string;
  urlOficial: string;
  dispositivo: string;
  dataConferencia: string;
  status: 'pendente' | 'validada' | 'revisar';
}

export const REFERENCIAS_NORMATIVAS: ReferenciaNormativa[] = [];
