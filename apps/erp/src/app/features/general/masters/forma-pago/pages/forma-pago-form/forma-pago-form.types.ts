import type { ErpSelectOption } from '@erp/core/components/api-select/erp-api-select.component';

export interface FormaPagoFormRawValue {
  nombre: string | null;
  cuenta: ErpSelectOption | null;
}
