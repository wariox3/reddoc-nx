import type { Turno, TurnoPayload } from './turno.model';
import type { TurnoFormRawValue } from './pages/turno-form/turno-form.types';

/** Color por defecto cuando el turno aún no tiene uno (el picker no admite vacío). */
const DEFAULT_COLOR = '#143049';

export function turnoToFormValue(t: Turno): Partial<TurnoFormRawValue> {
  return {
    codigo: t.codigo,
    nombre: t.nombre,
    hora_inicio: t.hora_inicio ?? '',
    hora_fin: t.hora_fin ?? '',
    horas: t.horas,
    horas_diurnas: t.horas_diurnas,
    horas_nocturnas: t.horas_nocturnas,
    color: t.color ?? DEFAULT_COLOR,
    novedad_tipo:
      t.novedad_tipo != null ? { id: t.novedad_tipo, nombre: t.novedad_tipo_nombre ?? '' } : null,
    estado_inactivo: t.estado_inactivo,
  };
}

export function formValueToPayload(v: TurnoFormRawValue): TurnoPayload {
  return {
    codigo: v.codigo ?? '',
    nombre: v.nombre ?? '',
    hora_inicio: v.hora_inicio || null,
    hora_fin: v.hora_fin || null,
    horas: v.horas ?? null,
    horas_diurnas: v.horas_diurnas ?? null,
    horas_nocturnas: v.horas_nocturnas ?? null,
    color: v.color || null,
    novedad_tipo: v.novedad_tipo?.id ?? null,
    estado_inactivo: v.estado_inactivo,
  };
}
