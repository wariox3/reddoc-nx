/**
 * Modelos de lectura y escritura de **Contrato servicio**.
 *
 * El documento vive sobre el endpoint genérico `/api/general/documento`
 * discriminado por `documento_tipo` (34). El read-model refleja, best-effort,
 * lo que devuelve `GET /api/general/documento/:id/`; sus nombres de campo
 * pueden requerir ajuste al contrastar contra la API real.
 */

/** Shape (parcial) de un contrato servicio leído desde la API en edición. */
export interface ContratoServicioRead {
  readonly id: number;
  readonly contacto: number | null;
  /** Nombre del contacto para etiquetar el autocomplete al cargar en edición. */
  readonly contacto_nombre?: string | null;
  readonly sector: number | null;
  /** Nombre del sector para etiquetar el selector al cargar en edición. */
  readonly sector_nombre?: string | null;
  readonly estrato: number | null;
  /** El backend lo devuelve como string con cola de ceros (`"1423500.000000"`). */
  readonly salario: string | number | null;
  /** Fecha en formato `yyyy-MM-dd`. */
  readonly fecha: string | null;
  readonly detalles?: readonly ContratoServicioDetalleRead[] | null;
}

/**
 * Fila del listado `general/documento/lista/` (documento_tipo 34).
 *
 * Es plana y distinta del read de edición (`ContratoServicioRead`): no trae
 * `detalles` y sí los acumulados que calcula el backend (`horas`, montos). Los
 * montos y horas viajan como string con cola de decimales (`"48.00"`,
 * `"18817299.435000"`); el formateo de columnas los normaliza al renderizar.
 *
 * El framework de listas accede a los campos por `row[field]` (tipados como
 * `unknown`), así que esta interface documenta el contrato del endpoint; no es
 * un genérico que el framework instancie.
 */
export interface ContratoServicioListRow {
  readonly id: number;
  readonly numero: string | null;
  readonly fecha: string | null;
  readonly fecha_contable: string | null;
  readonly fecha_vence: string | null;
  readonly fecha_desde: string | null;
  readonly fecha_hasta: string | null;
  readonly soporte: string | null;
  readonly orden_compra: string | null;
  readonly remision: string | null;
  readonly comentario: string | null;
  readonly documento_tipo: number;
  readonly documento_tipo_nombre: string | null;
  readonly contacto: number | null;
  readonly contacto_nombre: string | null;
  readonly tercero_numero_identificacion: string | null;
  readonly resolucion: number | null;
  readonly plazo_pago: number | null;
  readonly asesor: number | null;
  readonly cuenta_banco: number | null;
  readonly comprobante: number | null;
  readonly cuenta: number | null;
  readonly sector: number | null;
  readonly sector_nombre: string | null;
  readonly estrato: number | null;
  readonly documento_referencia: number | null;
  readonly subtotal: string | null;
  readonly descuento: string | null;
  readonly total_bruto: string | null;
  readonly base_impuesto: string | null;
  readonly impuesto: string | null;
  readonly impuesto_retencion: string | null;
  readonly total: string | null;
  readonly salario: string | null;
  /** Horas totales de cobertura del contrato (e.g. `"720.00"`). */
  readonly horas: string | null;
  readonly horas_diurnas: string | null;
  readonly horas_nocturnas: string | null;
  readonly estado_aprobado: boolean;
  readonly estado_anulado: boolean;
  readonly estado_contabilizado: boolean;
}

/**
 * Shape (best-effort) de una línea de detalle leída desde la API en edición.
 * Los nombres `*_nombre` etiquetan los selectores al cargar; pueden requerir
 * ajuste al contrastar contra `GET /api/general/documento/:id/`.
 */
export interface ContratoServicioDetalleRead {
  /** Id de la línea (para distinguir existente vs nueva al editar). */
  readonly id?: number | null;
  readonly item: number | null;
  readonly item_nombre?: string | null;
  readonly cantidad: string | number | null;
  readonly precio: string | number | null;
  readonly fecha_desde: string | null;
  readonly fecha_hasta: string | null;
  /** Hora en formato `HH:mm:ss` (se ignoran los segundos). */
  readonly hora_desde: string | null;
  readonly hora_hasta: string | null;
  readonly modalidad: number | null;
  readonly modalidad_nombre?: string | null;
  readonly puesto: number | null;
  readonly puesto_nombre?: string | null;
  readonly salario?: string | number | null;
  readonly programar: boolean | null;
  /** Los días viajan como flags individuales (no como array). */
  readonly lunes?: boolean | null;
  readonly martes?: boolean | null;
  readonly miercoles?: boolean | null;
  readonly jueves?: boolean | null;
  readonly viernes?: boolean | null;
  readonly sabado?: boolean | null;
  readonly domingo?: boolean | null;
  readonly festivo?: boolean | null;
  readonly cortesia?: boolean | null;
  /**
   * Línea compuesta: su horario/días/modalidad se derivan de sus componentes,
   * no de esta línea. El backend lo resuelve; el front solo lo muestra.
   */
  readonly compuesto?: boolean | null;
  readonly impuestos?: readonly ContratoServicioDetalleImpuestoRead[] | null;
}

/** Impuesto de una línea tal como lo devuelve el read-model. */
export interface ContratoServicioDetalleImpuestoRead {
  /** Id del impuesto (FK), p.ej. 1 = IVA 19%. Es lo que espera el multiselector. */
  readonly impuesto: number;
  readonly impuesto_nombre?: string | null;
  /** Porcentaje del impuesto, e.g. `"19.000000"`. */
  readonly porcentaje?: string | null;
  /** Porcentaje de la base sobre la que aplica el impuesto, e.g. `"100.000000"` o `"10.000000"` para AIU. */
  readonly porcentaje_base?: string | null;
  /** Monto ya calculado por el backend, e.g. `"796537.456000"`. */
  readonly total?: string | null;
}

/** Cuerpo de una línea de detalle enviada en `POST`/`PATCH`. */
export interface ContratoServicioDetallePayload {
  readonly item: number | null;
  readonly cantidad: number | null;
  /** Precio como string con 2 decimales (`"1000000.00"`). */
  readonly precio: string;
  readonly fecha_desde: string | null;
  readonly fecha_hasta: string | null;
  readonly hora_desde: string | null;
  readonly hora_hasta: string | null;
  readonly modalidad: number | null;
  readonly puesto: number | null;
  readonly salario: number | null;
  readonly programar: boolean;
  /** Días como flags individuales (igual que el payload de supervigilancia). */
  readonly lunes: boolean;
  readonly martes: boolean;
  readonly miercoles: boolean;
  readonly jueves: boolean;
  readonly viernes: boolean;
  readonly sabado: boolean;
  readonly domingo: boolean;
  readonly festivo: boolean;
  readonly cortesia: boolean;
  /** Se reenvía tal cual para no perderlo en el round-trip (no hay UI que lo edite). */
  readonly compuesto: boolean;
  readonly impuestos_ids: readonly number[];
}

/**
 * Cuerpo de `calcular-precio-supervigilancia`: la cobertura de una línea
 * (horario, modalidad, sector y días activos) que el backend usa para tarifar.
 * Los días viajan como flags individuales (no como array).
 */
export interface CalcularPrecioSupervigilanciaPayload {
  readonly hora_desde: string;
  readonly hora_hasta: string;
  readonly modalidad_id: number;
  readonly sector_id: number;
  readonly lunes: boolean;
  readonly martes: boolean;
  readonly miercoles: boolean;
  readonly jueves: boolean;
  readonly viernes: boolean;
  readonly sabado: boolean;
  readonly domingo: boolean;
  readonly festivo: boolean;
  readonly salario: number;
}

/**
 * Respuesta de `calcular-precio-supervigilancia`: el desglose de tarificación
 * de la cobertura. El precio mínimo reconcilia con el resto:
 * `horas_X = horas_X_unidad × total_dias` y
 * `precio_minimo ≈ Σ (horas_X × valor_hora_X)`.
 */
export interface CalcularPrecioSupervigilanciaResult {
  /** Horas diurnas por día (unidad). */
  readonly horas_diurnas_unidad: number;
  /** Horas nocturnas por día (unidad). */
  readonly horas_nocturnas_unidad: number;
  /** Días de cobertura del periodo. */
  readonly total_dias: number;
  /** Horas diurnas totales del periodo. */
  readonly horas_diurnas: number;
  /** Horas nocturnas totales del periodo. */
  readonly horas_nocturnas: number;
  /** Valor de la hora diurna. */
  readonly valor_hora_diurna: number;
  /** Valor de la hora nocturna (con recargo). */
  readonly valor_hora_nocturna: number;
  /** Precio mínimo regulado de la cobertura. */
  readonly precio_minimo: number;
}

/** Cuerpo enviado en `POST`/`PATCH` de un contrato servicio. */
export interface ContratoServicioPayload {
  readonly documento_tipo: number;
  readonly contacto: number | null;
  readonly sector: number | null;
  readonly estrato: number | null;
  readonly salario: number | null;
  readonly fecha: string | null;
  /** Opcional: en edición se omite (los detalles transaccionan contra documento-detalle). */
  readonly detalles?: readonly ContratoServicioDetallePayload[];
}
