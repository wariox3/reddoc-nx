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
 * además fija el flag con `data: { tipo: 'compra' }`. `formas-pago` también es
 * un master module-agnostic de general reusado aquí.
 */
export const COMPRA_ROUTES: Route[] = [
  {
    path: '',
    resolve: { _module: erpModuleResolver('compra') },
    children: [
      moduleIndexRoute(COMPRA_MODULE),
      {
        // Inicio del módulo (vacío por ahora — sin endpoints de estadísticas).
        path: 'inicio',
        loadComponent: () =>
          import('@erp/layouts/module-placeholder/module-placeholder.component').then(
            (m) => m.ModulePlaceholderComponent,
          ),
      },
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
        path: 'formas-pago',
        loadChildren: () =>
          import('../general/masters/forma-pago/forma-pago.routes').then(
            (m) => m.FORMA_PAGO_ROUTES,
          ),
      },
    ],
  },
];
