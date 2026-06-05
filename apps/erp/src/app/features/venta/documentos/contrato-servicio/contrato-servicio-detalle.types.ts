import type { ErpSelectOption } from '@erp/core/components/api-select/erp-api-select.component';

/**
 * Opción de ítem para el autocomplete de detalle. Extiende `ErpSelectOption`
 * con `precio` para poder autollenar el precio de la línea al seleccionar.
 */
export interface ItemOption extends ErpSelectOption {
  readonly precio: number;
}

/**
 * Valores crudos de una línea de detalle (`form.getRawValue()` de cada
 * `FormGroup` del `FormArray`). El mapper los normaliza al payload de la API.
 */
export interface DetalleFormRawValue {
  readonly item: ItemOption | null;
  readonly puesto: ErpSelectOption | null;
  readonly cantidad: number | null;
  readonly precio: number | null;
  readonly fecha_desde: Date | null;
  readonly fecha_hasta: Date | null;
  readonly hora_desde: Date | null;
  readonly hora_hasta: Date | null;
  readonly modalidad: ErpSelectOption | null;
  readonly programar: boolean;
  readonly dias_semana: number[];
  readonly festivo: boolean;
  readonly cortesia: boolean;
  readonly impuestos_ids: number[];
}
