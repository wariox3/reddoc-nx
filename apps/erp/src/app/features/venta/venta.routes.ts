import type { Route } from '@angular/router';
import { erpModuleResolver } from '@erp/core/erp-modules';
import { activeModuleResolver } from '@erp/core/module-config';

/**
 * Rutas del módulo Venta.
 *
 * Encadena dos resolvers ortogonales en la ruta raíz:
 *  - `erpModuleResolver('venta')`: registra el módulo activo en
 *    `ActiveModuleStore` para que el topbar y el sidebar se sincronicen.
 *  - `activeModuleResolver('venta')`: carga `VENTA_CONFIG` desde el registry
 *    y lo deja en `ModuleNavigationStore`. Sus `documents` quedan disponibles
 *    para que `activeDocumentResolver(...)` los resuelva dentro de cada
 *    `documentos/<doc>/<doc>.routes.ts`.
 *
 * Cada documento del módulo es un `loadChildren` separado — su form/detalle
 * vive junto a su config y se carga lazy. Sumar un documento nuevo: crear
 * `documentos/<id>/<id>.routes.ts`, agregar otra entrada `loadChildren` aquí
 * y declarar el `DocumentEntityConfig` correspondiente en `venta.config.ts`.
 */
export const VENTA_ROUTES: Route[] = [
  {
    path: '',
    resolve: {
      _navModule: erpModuleResolver('venta'),
      _docModule: activeModuleResolver('venta'),
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'contrato-servicio' },
      {
        path: 'factura-venta',
        loadChildren: () =>
          import('./documentos/factura-venta/factura-venta.routes').then(
            (m) => m.FACTURA_VENTA_ROUTES,
          ),
      },
      {
        path: 'contrato-servicio',
        loadChildren: () =>
          import('./documentos/contrato-servicio/contrato-servicio.routes').then(
            (m) => m.CONTRATO_SERVICIO_ROUTES,
          ),
      },
      {
        path: 'pedido-servicio',
        loadChildren: () =>
          import('./documentos/pedido-servicio/pedido-servicio.routes').then(
            (m) => m.PEDIDO_SERVICIO_ROUTES,
          ),
      },
      {
        path: 'informes/pendiente-facturar',
        loadChildren: () =>
          import('./informes/pendiente-facturar/pendiente-facturar.routes').then(
            (m) => m.PENDIENTE_FACTURAR_ROUTES,
          ),
      },
    ],
  },
];
