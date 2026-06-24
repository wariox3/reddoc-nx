import type { ColumnDef, FilterField } from '@reddoc/core';
import type { RowAction, ToolbarAction } from '@reddoc/feature-base';

export const PROGRAMACIONES_FILTERS_STORAGE_KEY = 'programaciones:filters:v1';

/**
 * Campo sobre el que opera la búsqueda rápida del toolbar (input de texto).
 * El término escrito se convierte en un filtro `contiene` sobre este campo.
 *
 * TODO: apuntar al campo de texto real cuando se defina el shape.
 */
export const PROGRAMACIONES_QUICK_SEARCH_FIELD = 'id';

/** Segmentos de ruta del listado, relativos al tenant. */
export const PROGRAMACION_LIST_PATH = ['turno', 'programaciones'] as const;

/**
 * Columnas visibles del listado.
 *
 * TODO: shape vacío a propósito (solo `id`). Sumar columnas reales cuando se
 * defina qué contiene la programación.
 */
export const PROGRAMACIONES_COLUMNS: readonly ColumnDef[] = [
  {
    field: 'id',
    headerKey: 'entities.programacion.columns.id',
    type: 'number',
    width: '70px',
    align: 'right',
  },
];

/**
 * Campos por los que se puede filtrar el listado (constructor de filtros).
 * El `type` determina qué operadores ofrece el modal.
 *
 * TODO: sumar campos reales cuando se defina el shape.
 */
export const PROGRAMACIONES_FILTER_FIELDS: readonly FilterField[] = [
  { name: 'id', displayNameKey: 'entities.programacion.columns.id', type: 'number' },
];

export const PROGRAMACIONES_ROW_ACTIONS: readonly RowAction[] = [
  { id: 'delete', labelKey: 'common.actions.delete', iconClass: 'pi pi-trash', severity: 'danger' },
];

export const PROGRAMACIONES_TRAILING_ACTIONS: readonly ToolbarAction[] = [
  {
    id: 'actions',
    labelKey: 'common.actions.actions',
    iconClass: '',
    children: [
      { id: 'export-excel', labelKey: 'common.actions.exportExcel', iconClass: 'pi pi-file-excel' },
    ],
  },
];
