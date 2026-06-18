import type { ColumnDef, FilterField } from '@reddoc/core';
import type { RowAction, ToolbarAction } from '@reddoc/feature-base';

export const PRECIOS_FILTERS_STORAGE_KEY = 'precios:filters:v1';
export const PRECIOS_QUICK_SEARCH_FIELD = 'nombre';

/** Segmentos de ruta del listado, relativos al tenant. */
export const PRECIO_LIST_PATH = ['general', 'precios'] as const;

export const PRECIOS_COLUMNS: readonly ColumnDef[] = [
  {
    field: 'id',
    headerKey: 'entities.precio.columns.id',
    type: 'number',
    width: '70px',
    align: 'right',
  },
  {
    field: 'nombre',
    headerKey: 'entities.precio.columns.nombre',
    type: 'text',
  },
  {
    field: 'venta',
    headerKey: 'entities.precio.columns.venta',
    type: 'boolean',
    align: 'center',
  },
  {
    field: 'compra',
    headerKey: 'entities.precio.columns.compra',
    type: 'boolean',
    align: 'center',
  },
  {
    field: 'fecha_vence',
    headerKey: 'entities.precio.columns.fechaVence',
    type: 'date',
  },
];

export const PRECIOS_FILTER_FIELDS: readonly FilterField[] = [
  { name: 'id', displayNameKey: 'entities.precio.columns.id', type: 'number' },
  { name: 'nombre', displayNameKey: 'entities.precio.columns.nombre', type: 'string' },
  { name: 'venta', displayNameKey: 'entities.precio.columns.venta', type: 'boolean' },
  { name: 'compra', displayNameKey: 'entities.precio.columns.compra', type: 'boolean' },
  { name: 'fecha_vence', displayNameKey: 'entities.precio.columns.fechaVence', type: 'date' },
];

export const PRECIOS_ROW_ACTIONS: readonly RowAction[] = [
  { id: 'edit', labelKey: 'common.actions.edit', iconClass: 'pi pi-pencil', inline: true },
  { id: 'view', labelKey: 'common.actions.view', iconClass: 'pi pi-eye', inline: true },
  { id: 'delete', labelKey: 'common.actions.delete', iconClass: 'pi pi-trash', severity: 'danger' },
];

export const PRECIOS_PRIMARY_ACTION: ToolbarAction = {
  id: 'new',
  labelKey: 'common.actions.new',
  iconClass: 'pi pi-plus',
};
