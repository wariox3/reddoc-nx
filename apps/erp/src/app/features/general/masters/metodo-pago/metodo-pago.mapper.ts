import type { MetodoPago, MetodoPagoPayload } from './metodo-pago.model';
import type { MetodoPagoFormRawValue } from './pages/metodo-pago-form/metodo-pago-form.types';

export function metodoPagoToFormValue(m: MetodoPago): Partial<MetodoPagoFormRawValue> {
  return { codigo: m.codigo, nombre: m.nombre };
}

export function formValueToPayload(v: MetodoPagoFormRawValue): MetodoPagoPayload {
  return { codigo: v.codigo ?? '', nombre: v.nombre ?? '' };
}
