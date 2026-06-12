import type { DocumentoDetalleReadBase } from '@reddoc/core';

/**
 * Fila del informe **Pendiente por facturar**.
 *
 * Es una línea de `documento-detalle` aplanada con datos del documento padre
 * (número, contacto, fecha) que el backend expande para el informe. Parte de
 * `DocumentoDetalleReadBase` (campos comunes de toda línea) y suma los campos
 * del documento que el informe necesita mostrar.
 *
 * Los campos del documento padre se declaran opcionales: la forma exacta del
 * response del informe se confirma con el backend y se ajusta aquí.
 */
export interface PendienteFacturar extends DocumentoDetalleReadBase {
  /** FK del documento al que pertenece la línea. */
  readonly documento?: number | null;
  /** Número visible del documento (consecutivo). */
  readonly documento_numero?: string | null;
  /** Nombre del contacto/cliente del documento. */
  readonly contacto_nombre?: string | null;
  /** Inicio del período de la línea (servicio). */
  readonly fecha_desde?: string | null;
  /** Fin del período de la línea (servicio). */
  readonly fecha_hasta?: string | null;
}
