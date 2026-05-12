// Base components for the document framework (camino A — ver docs/architecture)
export { BaseListComponent } from './lib/base-list/base-list.component';

// Building blocks compartidos (camino A y camino B)
export { DataTableComponent } from './lib/data-table/data-table.component';
export type {
  RowAction,
  RowActionInvokedEvent,
  PageChangeEvent,
} from './lib/data-table/data-table.types';
