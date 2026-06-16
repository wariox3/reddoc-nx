import type { DocumentoDetallePayloadBase, DocumentoDetalleReadBase } from '@reddoc/core';

/**
 * Modelos de lectura/escritura de una línea de detalle **comercial**, comunes a
 * todos los documentos comerciales (factura venta/compra, notas). Extienden el
 * contrato base de líneas (`DocumentoDetalle*Base` en `@reddoc/core`) agregando
 * solo los campos propios del comercial: descuento y la nota libre.
 *
 * Nota: el nombre y la semántica de `descuento` (¿porcentaje o monto?) y de
 * `detalle` se confirman contra la API real; ajustar aquí si difieren.
 */

/** Línea de detalle comercial leída desde la API en edición. */
export interface ComercialDetalleRead extends DocumentoDetalleReadBase {
  /** Porcentaje de descuento de la línea (string con decimales, p. ej. `"10.00"`). */
  readonly descuento?: string | number | null;
  readonly detalle?: string | null;
}

/** Cuerpo de una línea de detalle comercial enviada en `POST`/`PATCH`. */
export interface ComercialDetallePayload extends DocumentoDetallePayloadBase {
  /** Porcentaje de descuento como string con 2 decimales (`"10.00"`). */
  readonly descuento: string;
  readonly detalle: string | null;
}
