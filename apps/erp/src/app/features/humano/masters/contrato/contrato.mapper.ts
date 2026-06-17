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
 * Sección 1 (Datos del contrato): las FK se reagrupan en `{ id, nombre }`.
 * `contacto` (empleado) necesita además la identificación (`c.identificacion`)
 * para pintar el addon; los selects resuelven la etiqueta por `id` al cargar
 * opciones, así que basta `nombre: ''` cuando no hay companion: los `<app-api-select>`
 * resuelven la etiqueta por `id` al cargar opciones. Las ciudades usan
 * `<app-api-autocomplete>` (no precarga opciones), así que sí necesitan su companion
 * `*_nombre` para pintar la etiqueta en edición.
 */
export function contratoToFormValue(c: Contrato): Partial<ContratoFormRawValue> {
  return {
    contacto:
      c.contacto_id != null
        ? {
            id: c.contacto_id,
            nombre: c.nombre ?? '',
            numero_identificacion: c.identificacion ?? '',
          }
        : null,
    contrato_tipo:
      c.contrato_tipo_id != null
        ? { id: c.contrato_tipo_id, nombre: c.contrato_tipo_nombre ?? '' }
        : null,
    cargo: c.cargo_id != null ? { id: c.cargo_id, nombre: '' } : null,
    grupo: c.grupo_id != null ? { id: c.grupo_id, nombre: c.grupo_nombre ?? '' } : null,
    sucursal: c.sucursal_id != null ? { id: c.sucursal_id, nombre: '' } : null,
    tiempo: c.tiempo_id != null ? { id: c.tiempo_id, nombre: '' } : null,
    ciudad_contrato:
      c.ciudad_contrato_id != null
        ? { id: c.ciudad_contrato_id, nombre: c.ciudad_contrato_nombre ?? '' }
        : null,
    ciudad_labora:
      c.ciudad_labora_id != null
        ? { id: c.ciudad_labora_id, nombre: c.ciudad_labora_nombre ?? '' }
        : null,
    fecha_desde: parseIsoDate(c.fecha_desde),
    fecha_hasta: parseIsoDate(c.fecha_hasta),
    salario: c.salario,
    auxilio_transporte: c.auxilio_transporte,
    salario_integral: c.salario_integral,
    tipo_costo: c.tipo_costo_id != null ? { id: c.tipo_costo_id, nombre: '' } : null,
    grupo_contabilidad:
      c.grupo_contabilidad_id != null ? { id: c.grupo_contabilidad_id, nombre: '' } : null,
    salud: c.salud_id != null ? { id: c.salud_id, nombre: '' } : null,
    entidad_salud: c.entidad_salud_id != null ? { id: c.entidad_salud_id, nombre: '' } : null,
    pension: c.pension_id != null ? { id: c.pension_id, nombre: '' } : null,
    entidad_pension: c.entidad_pension_id != null ? { id: c.entidad_pension_id, nombre: '' } : null,
    entidad_cesantias:
      c.entidad_cesantias_id != null ? { id: c.entidad_cesantias_id, nombre: '' } : null,
    entidad_caja: c.entidad_caja_id != null ? { id: c.entidad_caja_id, nombre: '' } : null,
    riesgo: c.riesgo_id != null ? { id: c.riesgo_id, nombre: '' } : null,
    tipo_cotizante: c.tipo_cotizante_id != null ? { id: c.tipo_cotizante_id, nombre: '' } : null,
    subtipo_cotizante:
      c.subtipo_cotizante_id != null ? { id: c.subtipo_cotizante_id, nombre: '' } : null,
    motivo_terminacion:
      c.motivo_terminacion_id != null ? { id: c.motivo_terminacion_id, nombre: '' } : null,
    fecha_ultimo_pago: parseIsoDate(c.fecha_ultimo_pago),
    fecha_ultimo_pago_prima: parseIsoDate(c.fecha_ultimo_pago_prima),
    fecha_ultimo_pago_cesantia: parseIsoDate(c.fecha_ultimo_pago_cesantia),
    fecha_ultimo_pago_vacacion: parseIsoDate(c.fecha_ultimo_pago_vacacion),
    comentario: c.comentario ?? '',
  };
}

/**
 * Construye el write-model (`ContratoPayload`) desde el valor crudo del form.
 * Las FK exponen solo su `id`; las fechas Date → 'yyyy-mm-dd'; los strings vacíos
 * se normalizan a `null`.
 */
export function formValueToPayload(v: ContratoFormRawValue): ContratoPayload {
  return {
    fecha_desde: toIsoDate(v.fecha_desde),
    fecha_hasta: toIsoDate(v.fecha_hasta),
    salario: v.salario ?? null,
    auxilio_transporte: v.auxilio_transporte ?? null,
    salario_integral: v.salario_integral ?? false,
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
