// Componente base del framework de documentos (camino A — ver docs/architecture)
export { BaseDocumentListComponent } from './lib/base-document-list/base-document-list.component';

// Building blocks compartidos (caminos A y B)
export { DataTableComponent } from './lib/data-table/data-table.component';
export type {
  RowAction,
  RowActionInvokedEvent,
  PageChangeEvent,
} from './lib/data-table/data-table.types';
