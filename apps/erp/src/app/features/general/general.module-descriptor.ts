import type { ErpModuleDescriptor } from '@erp/core/erp-modules';

export const GENERAL_MODULE: ErpModuleDescriptor = {
  id: 'general',
  displayNameKey: 'modules.general.name',
  iconClass: 'pi pi-cog',
  defaultChildPath: 'contactos',
  menu: [
    {
      kind: 'accordion',
      id: 'general-administracion',
      labelKey: 'layout.nav.sections.master',
      iconClass: 'pi pi-folder',
      groups: [
        {
          items: [
            { labelKey: 'entities.contacto.name', path: 'contactos' },
            { labelKey: 'entities.item.name', path: 'items' },
          ],
        },
      ],
    },
  ],
};
