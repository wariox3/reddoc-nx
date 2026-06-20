/**
 * Forma cruda del FormGroup de la lista de precios (lo que devuelve
 * `form.getRawValue()`). `venta` / `compra` son checkboxes booleanos;
 * `fecha_vence` se maneja como `Date` (p-datepicker).
 */
export interface PrecioFormRawValue {
  nombre: string | null;
  venta: boolean | null;
  compra: boolean | null;
  fecha_vence: Date | null;
}
