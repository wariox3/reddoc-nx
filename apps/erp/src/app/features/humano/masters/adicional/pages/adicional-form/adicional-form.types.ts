import type { ErpSelectOption } from '@erp/core/components/api-select/erp-api-select.component';
import type { ContratoOption } from '@erp/core/components/contrato-autocomplete/contrato-autocomplete.component';

/**
 * Forma cruda del FormGroup del adicional (lo que devuelve `form.getRawValue()`).
 * `contrato` guarda un `ContratoOption` (autocomplete); `concepto` un
 * `ErpSelectOption` (autocomplete genérico). `valor` es `number` (p-inputNumber)
 * y `detalle` texto libre.
 */
export interface AdicionalFormRawValue {
  contrato: ContratoOption | null;
  concepto: ErpSelectOption | null;
  valor: number | null;
  detalle: string | null;
  aplica_dia_laborado: boolean | null;
  inactivo: boolean | null;
}
