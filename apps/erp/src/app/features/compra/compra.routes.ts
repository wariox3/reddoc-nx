import type { Route } from '@angular/router';
import { erpModuleResolver, moduleIndexRoute } from '@erp/core/erp-modules';
import { COMPRA_MODULE } from './compra.module-descriptor';

/**
 * Rutas del módulo Compra.
 *
 * `erpModuleResolver('compra')` en la raíz sincroniza topbar y sidebar. Expone
 * masters compartidos de general (item, contacto, resolución) reusados vía
 * `loadChildren`: son module-agnostic (derivan el módulo activo del
 * `ActiveModuleStore`), así que su navegación se queda en Compra. La resolución
 * además fija el flag con `data: { tipo: 'compra' }`. `metodos-pago` también es
 * un master module-agnostic de general reusado aquí.
 */
export const COMPRA_ROUTES: Route[] = [
  {
    path: '',
    resolve: { _module: erpModuleResolver('compra') },
    children: [
      moduleIndexRoute(COMPRA_MODULE),
      {
        path: 'items',
        loadChildren: () =>
          import('../general/masters/item/item.routes').then((m) => m.ITEM_ROUTES),
      },
      {
        path: 'contactos',
        loadChildren: () =>
          import('../general/masters/contacto/contacto.routes').then((m) => m.CONTACTO_ROUTES),
      },
      {
        path: 'resoluciones',
        data: { tipo: 'compra' },
        loadChildren: () =>
          import('../general/masters/resolucion/resolucion.routes').then(
            (m) => m.RESOLUCION_ROUTES,
          ),
      },
      {
        path: 'metodos-pago',
        loadChildren: () =>
          import('../general/masters/metodo-pago/metodo-pago.routes').then(
            (m) => m.METODO_PAGO_ROUTES,
          ),
      },
    ],
  },
];
