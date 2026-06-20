import { fromIsoDate, toIsoDate } from '@reddoc/core';
import type { Precio, PrecioPayload } from './precio.model';
import type { PrecioFormRawValue } from './pages/precio-form/precio-form.types';

/** Adapta el read-model (`Precio`) a los valores del reactive form. */
export function precioToFormValue(p: Precio): Partial<PrecioFormRawValue> {
  return {
    nombre: p.nombre,
    venta: p.venta,
    compra: p.compra,
    fecha_vence: fromIsoDate(p.fecha_vence),
  };
}

/**
 * Construye el write-model (`PrecioPayload`) desde el valor crudo del form.
 * La fecha Date → 'yyyy-mm-dd' (o `null` si vacía).
 */
export function formValueToPayload(v: PrecioFormRawValue): PrecioPayload {
  return {
    nombre: v.nombre ?? '',
    venta: v.venta ?? false,
    compra: v.compra ?? false,
    fecha_vence: toIsoDate(v.fecha_vence),
  };
}
