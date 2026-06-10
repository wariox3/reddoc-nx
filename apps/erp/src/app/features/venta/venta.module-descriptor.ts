import type { ErpModuleDescriptor } from '@erp/core/erp-modules';

/**
 * Descriptor del módulo Venta para la capa de navegación.
 *
 * El menú declara los acordeones que ve el sidebar cuando este módulo está
 * activo. Los `path` son **relativos al módulo** — el `WorkspaceLayout`
 * les prepende `/t/<slug>/venta/`.
 *
 * Acordeón "Documentos" (Factura de venta y Contrato servicio). Sumar
 * entradas a `items` (o nuevos grupos) cuando se implementen más documentos.
 */
export const VENTA_MODULE: ErpModuleDescriptor = {
  id: 'venta',
  displayNameKey: 'modules.venta.name',
  iconClass: 'pi pi-tag',
  defaultChildPath: 'contrato-servicio/list',
  menu: [
    {
      kind: 'accordion',
      id: 'venta-documentos',
      labelKey: 'layout.nav.sections.document',
      iconClass: 'pi pi-file',
      defaultExpanded: true,
      groups: [
        {
          items: [
            { labelKey: 'entities.contratoServicio.name', path: 'contrato-servicio/list' },
            { labelKey: 'entities.pedidoServicio.name', path: 'pedido-servicio/list' },
          ],
        },
      ],
    },
  ],
};
