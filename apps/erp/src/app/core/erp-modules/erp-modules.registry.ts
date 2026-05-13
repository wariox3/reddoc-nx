import { COMPRA_MODULE } from '@erp/features/compra/compra.module-descriptor';
import { GENERAL_MODULE } from '@erp/features/general/general.module-descriptor';
import { INVENTARIO_MODULE } from '@erp/features/inventario/inventario.module-descriptor';
import { VENTA_MODULE } from '@erp/features/venta/venta.module-descriptor';
import type { ErpModuleDescriptor } from './erp-module.types';

/**
 * Módulos del ERP en orden de aparición en el topbar.
 *
 * Import estático: son 4 descriptores pequeños sin componentes, no justifica
 * lazy loading. Las páginas siguen siendo lazy vía `loadComponent` desde sus
 * `<modulo>.routes.ts`.
 */
export const ERP_MODULES: readonly ErpModuleDescriptor[] = [
  GENERAL_MODULE,
  COMPRA_MODULE,
  VENTA_MODULE,
  INVENTARIO_MODULE,
] as const;
