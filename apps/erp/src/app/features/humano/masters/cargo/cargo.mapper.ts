import type { Cargo, CargoPayload } from './cargo.model';
import type { CargoFormRawValue } from './pages/cargo-form/cargo-form.types';

export function cargoToFormValue(c: Cargo): Partial<CargoFormRawValue> {
  return { codigo: c.codigo, nombre: c.nombre, estado_inactivo: c.estado_inactivo };
}

export function formValueToPayload(v: CargoFormRawValue): CargoPayload {
  return {
    codigo: v.codigo ?? null,
    nombre: v.nombre ?? '',
    estado_inactivo: v.estado_inactivo ?? false,
  };
}
