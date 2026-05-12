/**
 * Building blocks compartidos para listados/tablas del monorepo.
 *
 * Solo expone piezas **agnósticas del dominio**. El framework configuracional
 * del ERP (`BaseDocumentListComponent`, registry, resolvers, etc.) vive en
 * `apps/erp/src/app/core/module-config/`.
 */

export { DataTableComponent } from './lib/data-table/data-table.component';
export type {
  RowAction,
  RowActionInvokedEvent,
  PageChangeEvent,
} from './lib/data-table/data-table.types';
