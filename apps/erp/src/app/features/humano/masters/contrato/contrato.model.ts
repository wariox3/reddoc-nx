/**
 * Shape provisional del contrato — reconciliar con el backend cuando llegue.
 *
 * Los campos base (`*_id`, fechas, montos) reflejan las columnas de la tabla; los
 * companions de display (`*_nombre`, `codigo`, `identificacion`, `nombre`) son
 * provisionales y solo existen para pintar la lista. Se ajustarán al integrar el back.
 */
export interface Contrato {
  readonly id: number;
  readonly fecha_desde: string | null;
  readonly fecha_hasta: string | null;
  readonly salario: number | null;
  readonly auxilio_transporte: number | null;
  readonly aplica_auxilio_transporte: boolean;
  readonly salario_integral: boolean;
  readonly estado_terminado: boolean;
  readonly comentario: string | null;
  readonly fecha_ultimo_pago: string | null;
  readonly fecha_ultimo_pago_prima: string | null;
  readonly fecha_ultimo_pago_cesantia: string | null;
  readonly fecha_ultimo_pago_vacacion: string | null;
  // Foreign keys
  readonly cargo_id: number | null;
  readonly ciudad_contrato_id: number | null;
  readonly ciudad_labora_id: number | null;
  readonly contacto_id: number | null;
  readonly contrato_tipo_id: number | null;
  readonly entidad_caja_id: number | null;
  readonly entidad_cesantias_id: number | null;
  readonly entidad_pension_id: number | null;
  readonly entidad_salud_id: number | null;
  readonly grupo_id: number | null;
  readonly grupo_contabilidad_id: number | null;
  readonly motivo_terminacion_id: number | null;
  readonly pension_id: number | null;
  readonly riesgo_id: number | null;
  readonly salud_id: number | null;
  readonly subtipo_cotizante_id: number | null;
  readonly sucursal_id: number | null;
  readonly tiempo_id: number | null;
  readonly tipo_costo_id: number | null;
  readonly tipo_cotizante_id: number | null;
  // Companions de display (provisionales) para columnas FK/derivadas
  readonly contrato_tipo_nombre: string | null;
  readonly grupo_nombre: string | null;
  readonly ciudad_contrato_nombre: string | null;
  readonly ciudad_labora_nombre: string | null;
  readonly codigo: string | null;
  readonly identificacion: string | null;
  readonly nombre: string | null;
}

/**
 * Write-model para crear/editar contrato. Shape provisional — reconciliar con
 * el backend cuando llegue. Las FK van como id pelado (`number | null`).
 */
export interface ContratoPayload {
  readonly fecha_desde: string | null;
  readonly fecha_hasta: string | null;
  readonly salario: number | null;
  readonly auxilio_transporte: number | null;
  readonly aplica_auxilio_transporte: boolean;
  readonly salario_integral: boolean;
  readonly comentario: string | null;
  readonly fecha_ultimo_pago: string | null;
  readonly fecha_ultimo_pago_prima: string | null;
  readonly fecha_ultimo_pago_cesantia: string | null;
  readonly fecha_ultimo_pago_vacacion: string | null;
  readonly cargo_id: number | null;
  readonly ciudad_contrato_id: number | null;
  readonly ciudad_labora_id: number | null;
  readonly contacto_id: number | null;
  readonly contrato_tipo_id: number | null;
  readonly entidad_caja_id: number | null;
  readonly entidad_cesantias_id: number | null;
  readonly entidad_pension_id: number | null;
  readonly entidad_salud_id: number | null;
  readonly grupo_id: number | null;
  readonly grupo_contabilidad_id: number | null;
  readonly motivo_terminacion_id: number | null;
  readonly pension_id: number | null;
  readonly riesgo_id: number | null;
  readonly salud_id: number | null;
  readonly subtipo_cotizante_id: number | null;
  readonly sucursal_id: number | null;
  readonly tiempo_id: number | null;
  readonly tipo_costo_id: number | null;
  readonly tipo_cotizante_id: number | null;
}
