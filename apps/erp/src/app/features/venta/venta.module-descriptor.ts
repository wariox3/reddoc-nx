import type { ErpModuleDescriptor } from '@erp/core/erp-modules';

/**
 * Descriptor del módulo Venta para la capa de navegación.
 *
 * El menú declara los acordeones que ve el sidebar cuando este módulo está
 * activo. Los `path` son **relativos al módulo** — el `WorkspaceLayout`
 * les prepende `/t/<slug>/venta/`.
 *
 * Por ahora solo el acordeón de documentos con Factura de venta. Sumar
 * entradas a `items` (o nuevos grupos) cuando se implementen más documentos.
 */
export const VENTA_MODULE: ErpModuleDescriptor = {
  id: 'venta',
  displayNameKey: 'modules.venta.name',
  iconClass: 'pi pi-tag',
  defaultChildPath: 'factura-venta/list',
  menu: [
    {
      kind: 'accordion',
      id: 'venta-documentos',
      labelKey: 'layout.nav.sections.document',
      iconClass: 'pi pi-file',
      groups: [
        {
          items: [{ labelKey: 'entities.facturaVenta.name', path: 'factura-venta/list' }],
        },
      ],
    },
  ],
};
