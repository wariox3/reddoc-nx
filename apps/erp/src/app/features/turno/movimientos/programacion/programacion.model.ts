/**
 * Programación: movimiento del módulo de turnos.
 *
 * Es una **vista recortada de los documentos de pedido servicio** (tipo 35) que
 * el backend sirve por el endpoint genérico `general/documento/lista/`. El
 * listado reusa el `ENTITY_DATA_GATEWAY` del framework de documentos (camino A)
 * desde el shell propio de este movimiento (camino B) — ver
 * `programacion.constants.ts` (`PROGRAMACION_DOCUMENT_CONFIG`).
 *
 * Por eso el shape mapea el read-model de `general/documento/lista/`: la
 * identificación del tercero llega como `tercero_numero_identificacion` y el
 * contacto como `contacto_nombre`. Solo se tipan los campos que la tabla muestra.
 */
export interface Programacion {
  readonly id: number;
  readonly numero: string;
  readonly fecha: string;
  readonly tercero_numero_identificacion: string;
  readonly contacto_nombre: string;
  readonly horas: number;
  readonly horas_diurnas: number;
  readonly horas_nocturnas: number;
}

/**
 * Shape de lectura del detalle de una programación
 * (`GET /turno/programacion/detalle/?documento=…`).
 *
 * TENTATIVO: pendiente de confirmar contra la respuesta real (logueada en
 * consola por `ProgramacionDetailComponent`). Por ahora asume los mismos campos
 * de cabecera que la fila del listado; se ajusta cuando se confirme el shape.
 */
export interface ProgramacionDetalleRead {
  readonly id?: number;
  readonly numero?: string;
  readonly fecha?: string;
  readonly tercero_numero_identificacion?: string;
  readonly contacto_nombre?: string;
  readonly horas?: number;
  readonly horas_diurnas?: number;
  readonly horas_nocturnas?: number;
}

/**
 * Respuesta del grid (calendario de turnos) del detalle de programación
 * (`GET /turno/programacion/detalle/?documento=<id>`).
 *
 * Es un calendario por documento: `fechas` define las columnas de día y `filas`
 * las líneas (agrupables por `documento_detalle_id`), cada una con su mapa `dias`
 * indexado por la clave de cada fecha.
 *
 * TENTATIVO: el ejemplo de respuesta viene casi vacío (`fechas: []`, `dias: {}`),
 * así que el shape exacto de `ProgramacionFecha`, las claves de `dias` y el origen
 * de `empleado/ct/HD/HN/C/A` están por confirmar con datos poblados (logueados en
 * consola por `ProgramacionDetailComponent`).
 */
export interface ProgramacionDetalleResponse {
  readonly documento: number;
  readonly fechas: readonly ProgramacionFecha[];
  readonly filas: readonly ProgramacionFila[];
}

/**
 * Entrada de columna de día del calendario.
 *
 * TENTATIVO: el backend manda `fechas` vacío en el ejemplo. El adapter
 * (`toProgramacionFecha`) tolera tanto un string ISO (`'2026-06-01'`) como un
 * objeto (`{ fecha, dia }`) y normaliza a `{ clave, etiqueta }`:
 *  - `clave`: índice usado para leer `fila.dias[clave]`.
 *  - `etiqueta`: número de día visible en el header (`1`..`31`).
 */
export interface ProgramacionFecha {
  readonly clave: string;
  readonly etiqueta: string;
}

/**
 * Celda de un día: el turno asignado (si hay) y sus horas. Las claves del mapa
 * `dias` son las fechas ISO de `fechas` (`'2026-06-01'`).
 */
export interface ProgramacionDiaCelda {
  readonly programacion_id: number;
  readonly turno_id: number | null;
  readonly turno_codigo: string | null;
  readonly turno_nombre: string | null;
  readonly horas: number;
  readonly horas_diurnas: number;
  readonly horas_nocturnas: number;
  readonly festivo: boolean;
}

/**
 * Fila del calendario: un **contrato** asignado a un puesto. Varias filas pueden
 * compartir `documento_detalle_id` (el grid las agrupa por puesto); el
 * `contrato_nombre` identifica cada fila dentro del grupo.
 */
export interface ProgramacionFila {
  readonly documento_detalle_id: number;
  readonly puesto_id: number | null;
  readonly puesto_nombre: string | null;
  readonly contrato_id: number | null;
  readonly contrato_nombre: string | null;
  /** Mapa fecha ISO → celda del día (clave = `ProgramacionFecha.clave`). */
  readonly dias: Record<string, ProgramacionDiaCelda | null>;
  readonly total_horas: number;
}

/** Ítem de día en `crear-programacion`. `fecha` en formato ISO `YYYY-MM-DD`. */
export interface ProgramacionItem {
  readonly fecha: string;
  /** Código del turno escrito en la celda (`null` si el día queda sin turno). */
  readonly turno_codigo: string | null;
}

/**
 * Payload de `POST /turno/programacion/crear-programacion/`: crea la
 * programación de un contrato en un puesto (`documento_detalle_id`) con un ítem
 * por día (`fecha` + `turno_codigo`).
 */
export interface CrearProgramacionPayload {
  readonly contrato_id: number;
  readonly documento_detalle_id: number;
  readonly items: readonly ProgramacionItem[];
}
