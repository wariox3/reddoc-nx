export interface Sucursal {
  readonly id: number;
  readonly codigo: string;
  readonly nombre: string;
}

export interface SucursalPayload {
  codigo: string;
  nombre: string;
}
