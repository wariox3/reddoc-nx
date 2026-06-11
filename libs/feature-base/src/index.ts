/**
 * Building blocks compartidos para listados/tablas del monorepo.
 *
 * Componentes tontos: reciben inputs y emiten eventos. Sin HTTP, sin config,
 * sin conocimiento de dominio. El feature page los compone dentro de un
 * wrapper `.card` y los conecta entre sí.
 */

export { DataTableComponent } from './lib/data-table/data-table.component';
export type {
  RowAction,
  RowActionInvokedEvent,
  PageChangeEvent,
} from './lib/data-table/data-table.types';

export { DataToolbarComponent } from './lib/data-toolbar/data-toolbar.component';
export type { ToolbarAction } from './lib/data-toolbar/data-toolbar.types';

export { DataFilterModalComponent } from './lib/data-filter/data-filter-modal.component';

export { BreadcrumbComponent } from './lib/breadcrumb/breadcrumb.component';
export type { BreadcrumbItem } from './lib/breadcrumb/breadcrumb.types';

export { ListShellComponent } from './lib/list-shell/list-shell.component';
