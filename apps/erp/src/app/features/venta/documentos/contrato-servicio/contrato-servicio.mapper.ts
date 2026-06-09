import { fromHora, fromIsoDate, toFiniteNumber, toHora, toIsoDate } from '@reddoc/core';
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
      read.contacto != null ? { id: read.contacto, nombre: read.contacto_nombre ?? '' } : null,
    fecha: fromIsoDate(read.fecha),
    sector: read.sector != null ? { id: read.sector, nombre: read.sector_nombre ?? '' } : null,
    estrato: read.estrato,
    salario: toFiniteNumber(read.salario),
  };
}

/** Líneas de detalle del read-model → valores de formulario (para el FormArray). */
export function detallesToFormValue(read: ContratoServicioRead): DetalleFormRawValue[] {
  // El salario viaja a nivel documento; cada línea lo hereda.
  const salarioDoc = toFiniteNumber(read.salario);
  return (read.detalles ?? []).map((detalle) => detalleToFormValue(detalle, salarioDoc));
}

/** Flags `lunes…domingo` → array de índices (0=lunes … 6=domingo), como el calcPayload. */
const DIA_FLAGS = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
] as const;

function diasSemanaFromFlags(read: ContratoServicioDetalleRead): number[] {
  return DIA_FLAGS.flatMap((flag, idx) => (read[flag] ? [idx] : []));
}

function detalleToFormValue(
  read: ContratoServicioDetalleRead,
  salarioDoc: number | null,
): DetalleFormRawValue {
  const precio = toFiniteNumber(read.precio);
  return {
    id: read.id ?? null,
    item:
      read.item != null
        ? { id: read.item, nombre: read.item_nombre ?? '', precio: precio ?? 0 }
        : null,
    cantidad: toFiniteNumber(read.cantidad),
    precio,
    fecha_desde: fromIsoDate(read.fecha_desde),
    fecha_hasta: fromIsoDate(read.fecha_hasta),
    hora_desde: fromHora(read.hora_desde),
    hora_hasta: fromHora(read.hora_hasta),
    modalidad:
      read.modalidad != null ? { id: read.modalidad, nombre: read.modalidad_nombre ?? '' } : null,
    puesto: read.puesto != null ? { id: read.puesto, nombre: read.puesto_nombre ?? '' } : null,
    salario: toFiniteNumber(read.salario) ?? salarioDoc,
    programar: read.programar ?? false,
    dias_semana: diasSemanaFromFlags(read),
    festivo: read.festivo ?? false,
    cortesia: read.cortesia ?? false,
    impuestos_ids: (read.impuestos ?? []).map((imp) => imp.impuesto),
    impuestos_totales: (read.impuestos ?? []).map((imp) => ({
      id: imp.impuesto,
      nombre: imp.impuesto_nombre ?? '',
      total: Math.round(parseFloat(imp.total ?? '0')),
    })),
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
  includeDetalles = true,
): ContratoServicioPayload {
  return {
    documento_tipo: documentTypeId,
    contacto: raw.contacto?.id ?? null,
    sector: raw.sector?.id ?? null,
    estrato: raw.estrato ?? null,
    salario: raw.salario ?? null,
    fecha: toIsoDate(raw.fecha),
    // En edición se omiten: los detalles transaccionan contra documento-detalle.
    ...(includeDetalles ? { detalles: raw.detalles.map(detalleToPayload) } : {}),
  };
}

/** Una línea del form → body de documento-detalle (POST/PATCH) o detalle embebido. */
export function detalleToPayload(raw: DetalleFormRawValue): ContratoServicioDetallePayload {
  const dias = new Set(raw.dias_semana);
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
    salario: raw.salario ?? null,
    programar: raw.programar,
    // dias_semana → flags individuales (0=lunes … 6=domingo), como supervigilancia.
    lunes: dias.has(0),
    martes: dias.has(1),
    miercoles: dias.has(2),
    jueves: dias.has(3),
    viernes: dias.has(4),
    sabado: dias.has(5),
    domingo: dias.has(6),
    festivo: raw.festivo,
    cortesia: raw.cortesia,
    impuestos_ids: raw.impuestos_ids,
  };
}
