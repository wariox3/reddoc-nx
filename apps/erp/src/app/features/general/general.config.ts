import type { ColumnDef, MasterEntityConfig, ModuleConfig } from '@reddoc/core';

/** Columnas mostradas en la tabla de contactos. */
const CONTACTO_COLUMNS: readonly ColumnDef[] = [
  {
    field: 'id',
    headerKey: 'modules.general.entities.contacto.columns.id',
    type: 'number',
    width: '70px',
    align: 'right',
    sortable: true,
  },
  {
    field: 'nombre_corto',
    headerKey: 'modules.general.entities.contacto.columns.nombre',
    type: 'text',
    sortable: true,
  },
  {
    field: 'numero_identificacion',
    headerKey: 'modules.general.entities.contacto.columns.identificacion',
    type: 'text',
    sortable: true,
  },
  { field: 'correo', headerKey: 'modules.general.entities.contacto.columns.correo', type: 'text' },
  {
    field: 'telefono',
    headerKey: 'modules.general.entities.contacto.columns.telefono',
    type: 'text',
  },
];

/**
 * Entidad maestra: Contacto.
 *
 * Cubre clientes, proveedores y empleados sobre el mismo endpoint.
 * El backend discrimina internamente por flags (`cliente`, `proveedor`, `empleado`).
 */
const CONTACTO_ENTITY: MasterEntityConfig = {
  kind: 'master',
  id: 'contacto',
  displayNameKey: 'modules.general.entities.contacto.name',
  endpoint: '/api/general/contacto',
  schemaVersion: 1,
  columns: CONTACTO_COLUMNS,
  filters: [],
  routes: {
    list: 'master/contacto/list',
    new: 'master/contacto/new',
    edit: 'master/contacto/edit',
    detail: 'master/contacto/detail',
  },
  capabilities: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canSelectRows: true,
    canImport: false,
    canExportExcel: true,
  },
};

/**
 * Módulo General — agrupa los maestros transversales del ERP
 * (contactos, ítems, formas de pago, resoluciones, etc.).
 *
 * Cada entidad se renderiza en el sidebar agrupada por su `kind`.
 */
export const GENERAL_CONFIG: ModuleConfig = {
  id: 'general',
  displayNameKey: 'modules.general.name',
  iconClass: 'pi pi-cog',
  entities: [CONTACTO_ENTITY],
};
