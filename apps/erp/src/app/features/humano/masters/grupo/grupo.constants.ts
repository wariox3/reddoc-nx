import type { ColumnDef, FilterField } from '@reddoc/core';
import type { RowAction, ToolbarAction } from '@reddoc/feature-base';

export const GRUPOS_FILTERS_STORAGE_KEY = 'grupos:filters:v1';
export const GRUPOS_QUICK_SEARCH_FIELD = 'nombre';

/** Segmentos de ruta del listado, relativos al tenant. */
export const GRUPO_LIST_PATH = ['humano', 'grupos'] as const;

/** Valores de período que espera el backend. */
export const GRUPO_PERIODO_QUINCENAL = 1;
export const GRUPO_PERIODO_MENSUAL = 2;

/** Prefijo i18n para resolver el label del período (`<prefix>.<value>`). */
export const GRUPO_PERIODO_KEY_PREFIX = 'entities.grupo.periodos';

export const GRUPOS_COLUMNS: readonly ColumnDef[] = [
  {
    field: 'id',
    headerKey: 'entities.grupo.columns.id',
    type: 'number',
    width: '70px',
    align: 'right',
  },
  {
    field: 'nombre',
    headerKey: 'entities.grupo.columns.nombre',
    type: 'text',
  },
  {
    field: 'periodo',
    headerKey: 'entities.grupo.columns.periodo',
    type: 'enum',
    enumKeyPrefix: GRUPO_PERIODO_KEY_PREFIX,
  },
];

export const GRUPOS_FILTER_FIELDS: readonly FilterField[] = [
  { name: 'id', displayNameKey: 'entities.grupo.columns.id', type: 'number' },
  { name: 'nombre', displayNameKey: 'entities.grupo.columns.nombre', type: 'string' },
  { name: 'periodo', displayNameKey: 'entities.grupo.columns.periodo', type: 'number' },
];

export const GRUPOS_ROW_ACTIONS: readonly RowAction[] = [
  { id: 'edit', labelKey: 'common.actions.edit', iconClass: 'pi pi-pencil', inline: true },
  { id: 'view', labelKey: 'common.actions.view', iconClass: 'pi pi-eye', inline: true },
  { id: 'delete', labelKey: 'common.actions.delete', iconClass: 'pi pi-trash', severity: 'danger' },
];

export const GRUPOS_PRIMARY_ACTION: ToolbarAction = {
  id: 'new',
  labelKey: 'common.actions.new',
  iconClass: 'pi pi-plus',
};
