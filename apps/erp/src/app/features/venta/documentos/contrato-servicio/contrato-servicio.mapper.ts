import { fromHora, fromIsoDate, toHora, toIsoDate } from '@reddoc/core';
import type {
  ContratoServicioRead,
  ContratoServicioPayload,
  ContratoServicioDetalleRead,
  ContratoServicioDetallePayload,
} from './contrato-servicio.model';
import type { DetalleFormRawValue } from './contrato-servicio-detalle.types';
import type { ContratoServicioFormRawValue } from './pages/contrato-servicio-form/contrato-servicio-form.types';

/**
 * Read-model (GET) → valores de cabecera del formulario (edición).
 * No incluye `detalles` (se poblan aparte en el `FormArray`).
 */
export function contratoServicioToFormValue(
  read: ContratoServicioRead,
): Partial<Omit<ContratoServicioFormRawValue, 'detalles'>> {
  return {
    contacto:
      read.contacto != null
        ? { id: read.contacto, nombre: read.contacto_nombre_corto ?? '' }
        : null,
    fecha: fromIsoDate(read.fecha),
    sector: read.sector != null ? { id: read.sector, nombre: read.sector_nombre ?? '' } : null,
    estrato: read.estrato,
    salario: read.salario,
  };
}

/** Líneas de detalle del read-model → valores de formulario (para el FormArray). */
export function detallesToFormValue(read: ContratoServicioRead): DetalleFormRawValue[] {
  return (read.detalles ?? []).map(detalleToFormValue);
}

function detalleToFormValue(read: ContratoServicioDetalleRead): DetalleFormRawValue {
  return {
    item:
      read.item != null
        ? { id: read.item, nombre: read.item_nombre ?? '', precio: Number(read.precio) || 0 }
        : null,
    cantidad: read.cantidad,
    precio: read.precio != null ? Number(read.precio) : null,
    fecha_desde: fromIsoDate(read.fecha_desde),
    fecha_hasta: fromIsoDate(read.fecha_hasta),
    hora_desde: fromHora(read.hora_desde),
    hora_hasta: fromHora(read.hora_hasta),
    modalidad:
      read.modalidad != null ? { id: read.modalidad, nombre: read.modalidad_nombre ?? '' } : null,
    puesto: read.puesto != null ? { id: read.puesto, nombre: read.puesto_nombre ?? '' } : null,
    programar: read.programar ?? false,
    dias_semana: [...(read.dias_semana ?? [])],
    festivo: read.festivo ?? false,
    cortesia: read.cortesia ?? false,
    impuestos_ids: [...(read.impuestos_ids ?? [])],
  };
}

/**
 * Valores del formulario → payload de la API.
 *
 * `documento_tipo` proviene del `documentTypeId` del `DocumentEntityConfig`
 * (34). Las líneas del FormArray se traducen a `detalles`.
 */
export function formValueToPayload(
  raw: ContratoServicioFormRawValue,
  documentTypeId: number,
): ContratoServicioPayload {
  return {
    documento_tipo: documentTypeId,
    contacto: raw.contacto?.id ?? null,
    sector: raw.sector?.id ?? null,
    estrato: raw.estrato ?? null,
    salario: raw.salario ?? null,
    fecha: toIsoDate(raw.fecha),
    detalles: raw.detalles.map(detalleToPayload),
  };
}

function detalleToPayload(raw: DetalleFormRawValue): ContratoServicioDetallePayload {
  return {
    item: raw.item?.id ?? null,
    cantidad: raw.cantidad ?? null,
    precio: (raw.precio ?? 0).toFixed(2),
    fecha_desde: toIsoDate(raw.fecha_desde),
    fecha_hasta: toIsoDate(raw.fecha_hasta),
    hora_desde: toHora(raw.hora_desde),
    hora_hasta: toHora(raw.hora_hasta),
    modalidad: raw.modalidad?.id ?? null,
    puesto: raw.puesto?.id ?? null,
    programar: raw.programar,
    dias_semana: raw.dias_semana,
    festivo: raw.festivo,
    cortesia: raw.cortesia,
    impuestos_ids: raw.impuestos_ids,
  };
}
