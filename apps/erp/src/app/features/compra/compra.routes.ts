import type { Route } from '@angular/router';
import { erpModuleResolver } from '@erp/core/erp-modules';

/**
 * Rutas del módulo Compra.
 *
 * `erpModuleResolver('compra')` en la raíz sincroniza topbar y sidebar. Por
 * ahora el módulo solo expone el master de resoluciones (compartido con Venta:
 * el código vive en general/masters/resolucion y se enruta aquí con
 * `data: { tipo: 'compra' }` para fijar el flag). El índice redirige a él.
 */
export const COMPRA_ROUTES: Route[] = [
  {
    path: '',
    resolve: { _module: erpModuleResolver('compra') },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'resoluciones' },
      {
        path: 'resoluciones',
        data: { tipo: 'compra' },
        loadChildren: () =>
          import('../general/masters/resolucion/resolucion.routes').then(
            (m) => m.RESOLUCION_ROUTES,
          ),
      },
    ],
  },
];
