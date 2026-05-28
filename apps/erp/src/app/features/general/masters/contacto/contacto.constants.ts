import type { ColumnDef } from '@reddoc/core';
import type { RowAction, ToolbarAction } from '@reddoc/feature-base';

export const CONTACTOS_FILTERS_STORAGE_KEY = 'contactos:filters:v1';

/** IDs del catálogo `tipo_persona` del backend. */
export const TIPO_PERSONA = {
  JURIDICA: 1,
  NATURAL: 2,
} as const;

/** Segmentos de ruta del listado, relativos al tenant. */
export const CONTACTO_LIST_PATH = ['general', 'contactos'] as const;

export const CONTACTOS_COLUMNS: readonly ColumnDef[] = [
  {
    field: 'id',
    headerKey: 'entities.contacto.columns.id',
    type: 'number',
    width: '70px',
    align: 'right',
    sortable: true,
  },
  {
    field: 'identificacion_abreviatura',
    headerKey: 'entities.contacto.columns.identificacion_abreviatura',
    type: 'text',
    width: '80px',
  },
  {
    field: 'numero_identificacion',
    headerKey: 'entities.contacto.columns.identificacion',
    type: 'text',
    sortable: true,
  },
  {
    field: 'nombre_corto',
    headerKey: 'entities.contacto.columns.nombre',
    type: 'text',
    sortable: true,
  },
  { field: 'correo', headerKey: 'entities.contacto.columns.correo', type: 'text' },
  { field: 'celular', headerKey: 'entities.contacto.columns.celular', type: 'text' },
  {
    field: 'cliente',
    headerKey: 'entities.contacto.columns.cliente',
    type: 'boolean',
    width: '60px',
    align: 'center',
  },
  {
    field: 'proveedor',
    headerKey: 'entities.contacto.columns.proveedor',
    type: 'boolean',
    width: '60px',
    align: 'center',
  },
  {
    field: 'empleado',
    headerKey: 'entities.contacto.columns.empleado',
    type: 'boolean',
    width: '60px',
    align: 'center',
  },
];

export const CONTACTOS_ROW_ACTIONS: readonly RowAction[] = [
  { id: 'edit', labelKey: 'common.actions.edit', iconClass: 'pi pi-pencil' },
  { id: 'delete', labelKey: 'common.actions.delete', iconClass: 'pi pi-trash', severity: 'danger' },
];

export const CONTACTOS_PRIMARY_ACTION: ToolbarAction = {
  id: 'new',
  labelKey: 'common.actions.new',
  iconClass: 'pi pi-plus',
};

export const CONTACTOS_TRAILING_ACTIONS: readonly ToolbarAction[] = [
  {
    id: 'actions',
    labelKey: 'common.actions.actions',
    iconClass: 'pi pi-ellipsis-v',
    children: [
      { id: 'import', labelKey: 'common.actions.import', iconClass: 'pi pi-upload' },
      { id: 'export-excel', labelKey: 'common.actions.exportExcel', iconClass: 'pi pi-file-excel' },
    ],
  },
];
