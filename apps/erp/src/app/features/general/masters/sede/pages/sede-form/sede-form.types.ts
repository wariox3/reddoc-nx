import type { ErpSelectOption } from '@erp/core/components/api-select/erp-api-select.component';

/**
 * Forma cruda del FormGroup de sede (lo que devuelve `form.getRawValue()`).
 * La FK `centro_costo` guarda el `ErpSelectOption` seleccionado.
 */
export interface SedeFormRawValue {
  readonly nombre: string | null;
  readonly centro_costo: ErpSelectOption | null;
}
