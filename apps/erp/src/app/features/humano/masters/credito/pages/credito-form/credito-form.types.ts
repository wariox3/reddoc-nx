import type { ErpSelectOption } from '@erp/core/components/api-select/erp-api-select.component';
import type { ContratoOption } from '@erp/core/components/contrato-autocomplete/contrato-autocomplete.component';

/**
 * Forma cruda del FormGroup del crédito (lo que devuelve `form.getRawValue()`).
 * `contrato` guarda un `ContratoOption` (autocomplete); `concepto` un
 * `ErpSelectOption` (autocomplete genérico). La fecha se maneja como `Date`
 * (p-datepicker) y los montos/contadores como `number` (p-inputNumber).
 */
export interface CreditoFormRawValue {
  contrato: ContratoOption | null;
  concepto: ErpSelectOption | null;
  fecha_inicio: Date | null;
  total: number | null;
  cuota: number | null;
  cantidad_cuotas: number | null;
  inactivo: boolean | null;
  aplica_prima: boolean | null;
  aplica_cesantia: boolean | null;
}
