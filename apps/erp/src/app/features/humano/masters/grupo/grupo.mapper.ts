import type { Grupo, GrupoPayload } from './grupo.model';
import type { GrupoFormRawValue } from './pages/grupo-form/grupo-form.types';

export function grupoToFormValue(g: Grupo): Partial<GrupoFormRawValue> {
  return { nombre: g.nombre, periodo: g.periodo };
}

export function formValueToPayload(v: GrupoFormRawValue): GrupoPayload {
  return { nombre: v.nombre ?? '', periodo: v.periodo ?? null };
}
