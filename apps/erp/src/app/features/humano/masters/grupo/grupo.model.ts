export interface Grupo {
  readonly id: number;
  readonly nombre: string;
  readonly periodo: number;
  readonly periodo_nombre: string;
}

export interface GrupoPayload {
  nombre: string;
  periodo: number | null;
}
