import type { ErpModuleDescriptor } from '@erp/core/erp-modules';

export const COMPRA_MODULE: ErpModuleDescriptor = {
  id: 'compra',
  displayNameKey: 'modules.compra.name',
  iconClass: 'pi pi-shopping-cart',
  defaultChildPath: 'items',
  menu: [
    {
      kind: 'accordion',
      id: 'compra-administracion',
      labelKey: 'layout.nav.sections.master',
      iconClass: 'pi pi-folder',
      defaultExpanded: true,
      groups: [
        {
          items: [
            { labelKey: 'entities.item.name', path: 'items' },
            { labelKey: 'entities.contacto.name', path: 'contactos' },
            { labelKey: 'entities.resolucion.name', path: 'resoluciones' },
            { labelKey: 'entities.metodoPago.name', path: 'metodos-pago' },
          ],
        },
      ],
    },
  ],
};
