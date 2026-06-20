import type { Asesor, AsesorPayload } from './asesor.model';
import type { AsesorFormRawValue } from './pages/asesor-form/asesor-form.types';

export function asesorToFormValue(a: Asesor): Partial<AsesorFormRawValue> {
  return { nombre_corto: a.nombre_corto, celular: a.celular, correo: a.correo };
}

export function formValueToPayload(v: AsesorFormRawValue): AsesorPayload {
  return {
    nombre_corto: v.nombre_corto ?? '',
    celular: v.celular ?? '',
    correo: v.correo ?? '',
  };
}
