import type { ColumnDef, FilterField } from '@reddoc/core';
import type { RowAction, ToolbarAction } from '@reddoc/feature-base';

export const METODOS_PAGO_FILTERS_STORAGE_KEY = 'metodos-pago:filters:v1';
export const METODOS_PAGO_QUICK_SEARCH_FIELD = 'nombre';

/** Segmento de ruta del listado, relativo al módulo activo (se antepone en runtime). */
export const METODO_PAGO_LIST_PATH = ['metodos-pago'] as const;

export const METODOS_PAGO_COLUMNS: readonly ColumnDef[] = [
  {
    field: 'id',
    headerKey: 'entities.metodoPago.columns.id',
    type: 'number',
    width: '70px',
    align: 'right',
  },
  {
    field: 'codigo',
    headerKey: 'entities.metodoPago.columns.codigo',
    type: 'text',
    width: '120px',
  },
  { field: 'nombre', headerKey: 'entities.metodoPago.columns.nombre', type: 'text' },
];

export const METODOS_PAGO_FILTER_FIELDS: readonly FilterField[] = [
  { name: 'id', displayNameKey: 'entities.metodoPago.columns.id', type: 'number' },
  { name: 'codigo', displayNameKey: 'entities.metodoPago.columns.codigo', type: 'string' },
  { name: 'nombre', displayNameKey: 'entities.metodoPago.columns.nombre', type: 'string' },
];

export const METODOS_PAGO_ROW_ACTIONS: readonly RowAction[] = [
  { id: 'edit', labelKey: 'common.actions.edit', iconClass: 'pi pi-pencil', inline: true },
  { id: 'view', labelKey: 'common.actions.view', iconClass: 'pi pi-eye', inline: true },
  { id: 'delete', labelKey: 'common.actions.delete', iconClass: 'pi pi-trash', severity: 'danger' },
];

export const METODOS_PAGO_PRIMARY_ACTION: ToolbarAction = {
  id: 'new',
  labelKey: 'common.actions.new',
  iconClass: 'pi pi-plus',
};
