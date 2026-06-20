import { fromIsoDate, toIsoDate } from '@reddoc/core';
import type { Resolucion, ResolucionPayload, ResolucionTipo } from './resolucion.model';
import type { ResolucionFormRawValue } from './pages/resolucion-form/resolucion-form.types';

/** Adapta el read-model (`Resolucion`) a los valores del reactive form. */
export function resolucionToFormValue(r: Resolucion): Partial<ResolucionFormRawValue> {
  return {
    prefijo: r.prefijo,
    numero: r.numero,
    consecutivo_desde: r.consecutivo_desde,
    consecutivo_hasta: r.consecutivo_hasta,
    fecha_desde: fromIsoDate(r.fecha_desde),
    fecha_hasta: fromIsoDate(r.fecha_hasta),
  };
}

/**
 * Construye el write-model (`ResolucionPayload`) desde el valor crudo del form.
 * Las fechas Date → 'yyyy-mm-dd'. El flag `venta`/`compra` no proviene del form:
 * se fija según el módulo (`tipo`) desde el que se accede.
 */
export function formValueToPayload(
  v: ResolucionFormRawValue,
  tipo: ResolucionTipo,
): ResolucionPayload {
  return {
    prefijo: v.prefijo ?? '',
    numero: v.numero ?? '',
    consecutivo_desde: v.consecutivo_desde ?? null,
    consecutivo_hasta: v.consecutivo_hasta ?? null,
    fecha_desde: toIsoDate(v.fecha_desde),
    fecha_hasta: toIsoDate(v.fecha_hasta),
    venta: tipo === 'venta',
    compra: tipo === 'compra',
  };
}
