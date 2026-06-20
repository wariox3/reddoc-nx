import type { Sucursal, SucursalPayload } from './sucursal.model';
import type { SucursalFormRawValue } from './pages/sucursal-form/sucursal-form.types';

export function sucursalToFormValue(s: Sucursal): Partial<SucursalFormRawValue> {
  return { codigo: s.codigo, nombre: s.nombre };
}

export function formValueToPayload(v: SucursalFormRawValue): SucursalPayload {
  return { codigo: v.codigo ?? '', nombre: v.nombre ?? '' };
}
