import type { ErpModuleDescriptor } from '@erp/core/erp-modules';

/**
 * Descriptor del módulo Contabilidad para la capa de navegación.
 *
 * Los `path` del menú son **relativos al módulo** — el `WorkspaceLayout` les
 * prepende `/t/<slug>/contabilidad/`. Sumar entradas cuando se implementen más
 * masters/documentos.
 */
export const CONTABILIDAD_MODULE: ErpModuleDescriptor = {
  id: 'contabilidad',
  displayNameKey: 'modules.contabilidad.name',
  iconClass: 'pi pi-calculator',
  defaultChildPath: 'centros-costo',
  menu: [
    {
      kind: 'accordion',
      id: 'contabilidad-administracion',
      labelKey: 'layout.nav.sections.master',
      iconClass: 'pi pi-folder',
      defaultExpanded: true,
      groups: [
        {
          items: [
            { labelKey: 'entities.cuenta.name', path: 'cuentas' },
            { labelKey: 'entities.centroCosto.name', path: 'centros-costo' },
          ],
        },
      ],
    },
  ],
};
