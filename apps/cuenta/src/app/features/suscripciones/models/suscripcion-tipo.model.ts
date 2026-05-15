export interface SuscripcionTipo {
  readonly id: number;
  readonly nombre: string;
  readonly precio: string;
  readonly suscripcion_clase_id: number;
  readonly suscripcion_categoria_id: number;
}

export const SUSCRIPCION_CATEGORIA_FACTURACION = 1;
export const SUSCRIPCION_CATEGORIA_ERP = 2;
