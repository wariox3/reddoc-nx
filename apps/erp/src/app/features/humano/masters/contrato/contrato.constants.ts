import type { ColumnDef, FilterField } from '@reddoc/core';
import type { RowAction, ToolbarAction } from '@reddoc/feature-base';

export const CONTRATOS_FILTERS_STORAGE_KEY = 'contratos:filters:v1';
export const CONTRATOS_QUICK_SEARCH_FIELD = 'nombre';

/**
 * Id del tipo de contrato indefinido (sin fecha de fin). Cuando el tipo
 * seleccionado coincide, el formulario oculta `fecha_hasta` y le quita la
 * validación de requerido.
 */
export const CONTRATO_TIPO_INDEFINIDO_ID = 1;

export const CONTRATO_LIST_PATH = ['humano', 'contratos'] as const;

export const CONTRATOS_COLUMNS: readonly ColumnDef[] = [
  {
    field: 'contrato_tipo_nombre',
    headerKey: 'entities.contrato.columns.contratoTipo',
    type: 'text',
  },
  { field: 'codigo', headerKey: 'entities.contrato.columns.codigo', type: 'text', width: '90px' },
  {
    field: 'identificacion',
    headerKey: 'entities.contrato.columns.identificacion',
    type: 'text',
  },
  { field: 'nombre', headerKey: 'entities.contrato.columns.nombre', type: 'text' },
  { field: 'fecha_desde', headerKey: 'entities.contrato.columns.fechaDesde', type: 'date' },
  { field: 'fecha_hasta', headerKey: 'entities.contrato.columns.fechaHasta', type: 'date' },
  { field: 'grupo_nombre', headerKey: 'entities.contrato.columns.grupo', type: 'text' },
  {
    field: 'salario',
    headerKey: 'entities.contrato.columns.salario',
    type: 'currency',
    align: 'right',
  },
  {
    field: 'estado_terminado',
    headerKey: 'entities.contrato.columns.terminado',
    type: 'boolean',
    width: '60px',
    align: 'center',
  },
];

export const CONTRATOS_FILTER_FIELDS: readonly FilterField[] = [
  {
    name: 'identificacion',
    displayNameKey: 'entities.contrato.columns.identificacion',
    type: 'string',
  },
  { name: 'nombre', displayNameKey: 'entities.contrato.columns.nombre', type: 'string' },
  { name: 'fecha_desde', displayNameKey: 'entities.contrato.columns.fechaDesde', type: 'date' },
  { name: 'fecha_hasta', displayNameKey: 'entities.contrato.columns.fechaHasta', type: 'date' },
  { name: 'salario', displayNameKey: 'entities.contrato.columns.salario', type: 'number' },
  {
    name: 'estado_terminado',
    displayNameKey: 'entities.contrato.columns.terminado',
    type: 'boolean',
  },
];

export const CONTRATOS_ROW_ACTIONS: readonly RowAction[] = [
  { id: 'edit', labelKey: 'common.actions.edit', iconClass: 'pi pi-pencil', inline: true },
  { id: 'view', labelKey: 'common.actions.view', iconClass: 'pi pi-eye', inline: true },
  { id: 'delete', labelKey: 'common.actions.delete', iconClass: 'pi pi-trash', severity: 'danger' },
];

export const CONTRATOS_PRIMARY_ACTION: ToolbarAction = {
  id: 'new',
  labelKey: 'common.actions.new',
  iconClass: 'pi pi-plus',
};
