import type { ErpModuleDescriptor } from '@erp/core/erp-modules';

/**
 * Descriptor del módulo Humano para la capa de navegación.
 *
 * Los `path` del menú son **relativos al módulo** — el `WorkspaceLayout` les
 * prepende `/t/<slug>/humano/`. Por ahora los masters `contrato` y `cargo`;
 * sumar entradas cuando se implementen más masters/documentos.
 */
export const HUMANO_MODULE: ErpModuleDescriptor = {
  id: 'humano',
  displayNameKey: 'modules.humano.name',
  iconClass: 'pi pi-users',
  defaultChildPath: 'contratos',
  menu: [
    {
      kind: 'accordion',
      id: 'humano-administracion',
      labelKey: 'layout.nav.sections.master',
      iconClass: 'pi pi-folder',
      defaultExpanded: true,
      groups: [
        {
          items: [
            { labelKey: 'entities.contrato.name', path: 'contratos' },
            { labelKey: 'entities.cargo.name', path: 'cargos' },
            { labelKey: 'entities.grupo.name', path: 'grupos' },
            { labelKey: 'entities.sucursal.name', path: 'sucursales' },
          ],
        },
      ],
    },
  ],
};
