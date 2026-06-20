/**
 * Forma cruda del FormGroup de la resolución (lo que devuelve
 * `form.getRawValue()`). Los consecutivos se manejan como `number`
 * (p-inputNumber) y las fechas como `Date` (p-datepicker). `venta`/`compra`
 * no están en el form: se derivan del módulo activo al construir el payload.
 */
export interface ResolucionFormRawValue {
  prefijo: string | null;
  numero: string | null;
  consecutivo_desde: number | null;
  consecutivo_hasta: number | null;
  fecha_desde: Date | null;
  fecha_hasta: Date | null;
}
