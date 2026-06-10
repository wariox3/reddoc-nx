import type { Contrato, ContratoPayload } from './contrato.model';
import type { ContratoFormRawValue } from './pages/contrato-form/contrato-form.types';

/** Parsea 'yyyy-mm-dd' a Date local (evita el corrimiento de día por timezone). */
function parseIsoDate(value: string | null): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/** Formatea Date a 'yyyy-mm-dd' usando partes locales. */
function toIsoDate(value: Date | null): string | null {
  if (!value) return null;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adapta el read-model (`Contrato`) a los valores del reactive form.
 *
 * Por ahora solo se mapean los escalares (fechas, montos, booleanos, comentario).
 * TODO(endpoint): cuando los dropdowns FK se cableen con `app-api-select`,
 * reagrupar cada FK + su `*_nombre` en `{ id, nombre }` como hace contacto.mapper.
 */
export function contratoToFormValue(c: Contrato): Partial<ContratoFormRawValue> {
  return {
    fecha_desde: parseIsoDate(c.fecha_desde),
    fecha_hasta: parseIsoDate(c.fecha_hasta),
    salario: c.salario,
    auxilio_transporte: c.auxilio_transporte,
    salario_integral: c.salario_integral,
    estado_terminado: c.estado_terminado,
    fecha_ultimo_pago: parseIsoDate(c.fecha_ultimo_pago),
    fecha_ultimo_pago_prima: parseIsoDate(c.fecha_ultimo_pago_prima),
    fecha_ultimo_pago_cesantia: parseIsoDate(c.fecha_ultimo_pago_cesantia),
    fecha_ultimo_pago_vacacion: parseIsoDate(c.fecha_ultimo_pago_vacacion),
    comentario: c.comentario ?? '',
  };
}

/**
 * Construye el write-model (`ContratoPayload`) desde el valor crudo del form.
 * Las FK exponen solo su `id` (hoy `null`, los dropdowns están deshabilitados);
 * las fechas Date → 'yyyy-mm-dd'; los strings vacíos se normalizan a `null`.
 */
export function formValueToPayload(v: ContratoFormRawValue): ContratoPayload {
  return {
    fecha_desde: toIsoDate(v.fecha_desde),
    fecha_hasta: toIsoDate(v.fecha_hasta),
    salario: v.salario ?? null,
    auxilio_transporte: v.auxilio_transporte ?? null,
    salario_integral: v.salario_integral ?? false,
    estado_terminado: v.estado_terminado ?? false,
    comentario: v.comentario || null,
    fecha_ultimo_pago: toIsoDate(v.fecha_ultimo_pago),
    fecha_ultimo_pago_prima: toIsoDate(v.fecha_ultimo_pago_prima),
    fecha_ultimo_pago_cesantia: toIsoDate(v.fecha_ultimo_pago_cesantia),
    fecha_ultimo_pago_vacacion: toIsoDate(v.fecha_ultimo_pago_vacacion),
    cargo_id: v.cargo?.id ?? null,
    ciudad_contrato_id: v.ciudad_contrato?.id ?? null,
    ciudad_labora_id: v.ciudad_labora?.id ?? null,
    contacto_id: v.contacto?.id ?? null,
    contrato_tipo_id: v.contrato_tipo?.id ?? null,
    entidad_caja_id: v.entidad_caja?.id ?? null,
    entidad_cesantias_id: v.entidad_cesantias?.id ?? null,
    entidad_pension_id: v.entidad_pension?.id ?? null,
    entidad_salud_id: v.entidad_salud?.id ?? null,
    grupo_id: v.grupo?.id ?? null,
    grupo_contabilidad_id: v.grupo_contabilidad?.id ?? null,
    motivo_terminacion_id: v.motivo_terminacion?.id ?? null,
    pension_id: v.pension?.id ?? null,
    riesgo_id: v.riesgo?.id ?? null,
    salud_id: v.salud?.id ?? null,
    subtipo_cotizante_id: v.subtipo_cotizante?.id ?? null,
    sucursal_id: v.sucursal?.id ?? null,
    tiempo_id: v.tiempo?.id ?? null,
    tipo_costo_id: v.tipo_costo?.id ?? null,
    tipo_cotizante_id: v.tipo_cotizante?.id ?? null,
  };
}
