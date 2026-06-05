import type { CentroCosto, CentroCostoPayload } from './centro-costo.model';
import type { CentroCostoFormRawValue } from './pages/centro-costo-form/centro-costo-form.types';

export function centroCostoToFormValue(c: CentroCosto): Partial<CentroCostoFormRawValue> {
  return { codigo: c.codigo, nombre: c.nombre };
}

export function formValueToPayload(v: CentroCostoFormRawValue): CentroCostoPayload {
  return { codigo: v.codigo ?? '', nombre: v.nombre ?? '' };
}
