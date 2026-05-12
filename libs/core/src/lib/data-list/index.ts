/**
 * Building blocks de listados/tablas compartidos por toda app del monorepo.
 *
 * Solo contiene piezas **agnósticas del dominio**:
 *  - Tipos de columnas y filtros (`ColumnDef`, `FilterField`).
 *  - Contratos de query y respuesta paginada (`ListQuery`, `ListResponse`).
 *  - Serialización a query-params del backend (`serializeListQuery`).
 *  - Persistencia de filtros en localStorage (`FilterStorageService`).
 *
 * El framework configuracional específico del ERP (registry de módulos,
 * resolvers, gateway, base-document-list, etc.) vive en
 * `apps/erp/src/app/core/module-config/`, no aquí.
 */

// Types
export type { ColumnDef, ColumnValueType, ColumnAlignment } from './types/column-def.types';
export type { FilterField, FilterFieldType } from './types/filter-field.types';
export type {
  FilterCondition,
  FilterOperator,
  ListQuery,
  ListResponse,
  SortDirection,
  SortSpec,
} from './data/list-query.types';

// Query serialization
export { serializeListQuery } from './data/serialize-list-query';

// Storage
export { FilterStorageService } from './storage/filter-storage.service';
