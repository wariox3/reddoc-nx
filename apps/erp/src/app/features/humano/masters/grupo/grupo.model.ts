export interface Grupo {
  readonly id: number;
  readonly nombre: string;
  readonly periodo: number;
}

export interface GrupoPayload {
  nombre: string;
  periodo: number | null;
}
