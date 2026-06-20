/**
 * Cuenta de banco (GenCuentaBanco).
 *
 * Shape de lectura: los FK viajan con el id "pelado" (`cuenta_banco_tipo`,
 * `cuenta_banco_clase`, `cuenta`) acompañados de su `*_nombre` (y `*_codigo`
 * para la cuenta contable), siguiendo la convención del resto del ERP nuevo
 * (ver `contacto`/`item`). Si el endpoint de detalle devolviera los FK con
 * sufijo `_id`, ajustar este modelo y el mapper.
 */
export interface CuentaBanco {
  readonly id: number;
  readonly nombre: string;
  readonly numero_cuenta: string | null;
  readonly cuenta_banco_tipo: number;
  readonly cuenta_banco_tipo_nombre?: string | null;
  readonly cuenta_banco_clase: number | null;
  readonly cuenta_banco_clase_nombre?: string | null;
  readonly cuenta: number | null;
  readonly cuenta_codigo?: string | null;
  readonly cuenta_nombre?: string | null;
}

/** Payload para crear o actualizar una cuenta de banco. */
export interface CuentaBancoPayload {
  nombre: string;
  numero_cuenta: string | null;
  cuenta_banco_tipo: number | null;
  cuenta_banco_clase: number | null;
  cuenta: number | null;
}
