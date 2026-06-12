import type { ColumnDef, FilterField } from '@reddoc/core';
import type { ToolbarAction } from '@reddoc/feature-base';

export const PENDIENTE_FACTURAR_FILTERS_STORAGE_KEY = 'pendiente-facturar:filters:v1';

/**
 * Columnas del informe. Propuesta inicial (ajustable en review): identifica el
 * documento y su contacto, más los datos de la línea pendiente por facturar.
 */
export const PENDIENTE_FACTURAR_COLUMNS: readonly ColumnDef[] = [
  {
    field: 'documento_numero',
    headerKey: 'entities.pendienteFacturar.columns.documento',
    type: 'text',
    width: '110px',
  },
  {
    field: 'contacto_nombre',
    headerKey: 'entities.pendienteFacturar.columns.contacto',
    type: 'text',
  },
  { field: 'item_nombre', headerKey: 'entities.pendienteFacturar.columns.item', type: 'text' },
  {
    field: 'cantidad',
    headerKey: 'entities.pendienteFacturar.columns.cantidad',
    type: 'number',
    width: '100px',
    align: 'right',
  },
  {
    field: 'precio',
    headerKey: 'entities.pendienteFacturar.columns.precio',
    type: 'currency',
    width: '140px',
    align: 'right',
  },
  {
    field: 'fecha_desde',
    headerKey: 'entities.pendienteFacturar.columns.fechaDesde',
    type: 'date',
    width: '120px',
  },
  {
    field: 'fecha_hasta',
    headerKey: 'entities.pendienteFacturar.columns.fechaHasta',
    type: 'date',
    width: '120px',
  },
];

/** Campos por los que se puede filtrar (espejo de las columnas). */
export const PENDIENTE_FACTURAR_FILTER_FIELDS: readonly FilterField[] = [
  {
    name: 'documento_numero',
    displayNameKey: 'entities.pendienteFacturar.columns.documento',
    type: 'string',
  },
  {
    name: 'contacto_nombre',
    displayNameKey: 'entities.pendienteFacturar.columns.contacto',
    type: 'string',
  },
  {
    name: 'item_nombre',
    displayNameKey: 'entities.pendienteFacturar.columns.item',
    type: 'string',
  },
  {
    name: 'cantidad',
    displayNameKey: 'entities.pendienteFacturar.columns.cantidad',
    type: 'number',
  },
  { name: 'precio', displayNameKey: 'entities.pendienteFacturar.columns.precio', type: 'number' },
  {
    name: 'fecha_desde',
    displayNameKey: 'entities.pendienteFacturar.columns.fechaDesde',
    type: 'date',
  },
  {
    name: 'fecha_hasta',
    displayNameKey: 'entities.pendienteFacturar.columns.fechaHasta',
    type: 'date',
  },
];

/**
 * Acciones trailing del toolbar. Al ser un informe de solo lectura, el dropdown
 * "Acciones" solo ofrece descargar el Excel (sin nuevo/importar). Se mantiene el
 * grupo para seguir el estándar de los listados (ej. contacto).
 */
export const PENDIENTE_FACTURAR_TRAILING_ACTIONS: readonly ToolbarAction[] = [
  {
    id: 'actions',
    labelKey: 'common.actions.actions',
    iconClass: '',
    children: [
      { id: 'export-excel', labelKey: 'common.actions.exportExcel', iconClass: 'pi pi-file-excel' },
    ],
  },
];
