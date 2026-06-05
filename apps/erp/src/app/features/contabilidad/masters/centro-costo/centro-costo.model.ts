export interface CentroCosto {
  readonly id: number;
  readonly codigo: string;
  readonly nombre: string;
  readonly estado_inactivo: boolean;
}

export interface CentroCostoListResponse {
  readonly count: number;
  readonly results: readonly CentroCosto[];
}

export interface CentroCostoPayload {
  codigo: string;
  nombre: string;
}
