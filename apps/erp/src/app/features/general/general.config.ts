import type { MasterEntityConfig, ModuleConfig } from '@reddoc/core';

/**
 * Entidad maestra: Contacto.
 *
 * Cubre clientes, proveedores y empleados sobre el mismo endpoint.
 * Por ahora solo declara la capacidad de crear y editar; el resto se irá
 * activando a medida que el backend exponga las APIs correspondientes.
 */
const CONTACTO_ENTITY: MasterEntityConfig = {
  kind: 'master',
  id: 'contacto',
  displayNameKey: 'modules.general.entities.contacto.name',
  endpoint: '/api/general/contacto',
  schemaVersion: 1,
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
