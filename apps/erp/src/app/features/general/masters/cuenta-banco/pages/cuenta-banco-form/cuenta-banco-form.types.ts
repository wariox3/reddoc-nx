import type { ErpSelectOption } from '@erp/core/components/api-select/erp-api-select.component';

export interface CuentaBancoFormRawValue {
  nombre: string | null;
  numero_cuenta: string | null;
  cuenta_banco_tipo: ErpSelectOption | null;
  cuenta_banco_clase: ErpSelectOption | null;
  cuenta: ErpSelectOption | null;
}
