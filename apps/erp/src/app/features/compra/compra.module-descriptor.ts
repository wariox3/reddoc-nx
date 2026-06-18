import type { ErpModuleDescriptor } from '@erp/core/erp-modules';

export const COMPRA_MODULE: ErpModuleDescriptor = {
  id: 'compra',
  displayNameKey: 'modules.compra.name',
  iconClass: 'pi pi-shopping-cart',
  defaultChildPath: 'resoluciones',
  menu: [
    {
      kind: 'accordion',
      id: 'compra-administracion',
      labelKey: 'layout.nav.sections.master',
      iconClass: 'pi pi-folder',
      defaultExpanded: true,
      groups: [
        {
          items: [{ labelKey: 'entities.resolucion.name', path: 'resoluciones' }],
        },
      ],
    },
  ],
};
