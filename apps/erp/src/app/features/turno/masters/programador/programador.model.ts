export interface Programador {
  readonly id: number;
  readonly nombre: string;
  readonly estado_inactivo: boolean;
}

export interface ProgramadorListResponse {
  readonly count: number;
  readonly results: readonly Programador[];
}

export interface ProgramadorPayload {
  nombre: string;
}
