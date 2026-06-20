export interface Cargo {
  readonly id: number;
  readonly codigo: number;
  readonly nombre: string;
  readonly estado_inactivo: boolean;
}

export interface CargoPayload {
  codigo: number | null;
  nombre: string;
  estado_inactivo: boolean;
}
