/**
 * Lista de precios (GenPrecio).
 *
 * `venta` / `compra` son flags booleanos que indican si la lista de precios
 * aplica para venta y/o compra. `fecha_vence` es la fecha de vencimiento de la
 * lista (opcional) y viaja como ISO `yyyy-mm-dd` (o `null`).
 */
export interface Precio {
  readonly id: number;
  readonly nombre: string;
  readonly venta: boolean;
  readonly compra: boolean;
  readonly fecha_vence: string | null;
}

/** Payload para crear o actualizar una lista de precios. */
export interface PrecioPayload {
  nombre: string;
  venta: boolean;
  compra: boolean;
  fecha_vence: string | null;
}
