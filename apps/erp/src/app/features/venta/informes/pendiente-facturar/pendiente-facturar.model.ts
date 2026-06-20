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
  /** Fecha del documento (`yyyy-MM-dd`). */
  readonly fecha?: string | null;
  /** Nombre del contacto/cliente del documento. */
  readonly contacto_nombre?: string | null;
  /** FK del puesto de la línea (se muestra como "cód." en el informe). */
  readonly puesto?: number | null;
  /** Nombre del puesto de la línea. */
  readonly puesto_nombre?: string | null;
  /** Nombre de la modalidad de la línea. */
  readonly modalidad_nombre?: string | null;
  /** Horas totales de cobertura (`horas = horas_diurnas + horas_nocturnas`). */
  readonly horas?: string | number | null;
  /** Horas diurnas de la línea. */
  readonly horas_diurnas?: string | number | null;
  /** Horas nocturnas de la línea. */
  readonly horas_nocturnas?: string | number | null;
  /** IVA calculado de la línea. */
  readonly iva?: string | number | null;
  /** Valor de la línea (base sin IVA). */
  readonly valor?: string | number | null;
  /** Valor aún pendiente por facturar de la línea. */
  readonly valor_pendiente?: string | number | null;
  /** Total de la línea (valor + IVA). */
  readonly total?: string | number | null;
  /** Inicio del período de la línea (servicio). */
  readonly fecha_desde?: string | null;
  /** Fin del período de la línea (servicio). */
  readonly fecha_hasta?: string | null;
}
