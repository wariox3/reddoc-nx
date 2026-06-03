import type { Route } from '@angular/router';
import { activeDocumentResolver } from '@erp/core/module-config';

/**
 * Rutas de **Contrato servicio** (movimiento de venta).
 *
 * Documento **solo lista**: a diferencia de Factura de venta, no expone rutas
 * `nuevo` / `editar` / `detalle` porque es de solo lectura. El
 * `activeDocumentResolver('contrato-servicio')` deja la config en
 * `ModuleNavigationStore` antes de montar la lista — el módulo padre
 * (`venta.routes.ts`) ya cargó `VENTA_CONFIG`.
 */
export const CONTRATO_SERVICIO_ROUTES: Route[] = [
  {
    path: '',
    resolve: { document: activeDocumentResolver('contrato-servicio') },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'list' },
      {
        path: 'list',
        loadComponent: () =>
          import('@erp/core/module-config/components/base-document-list/base-document-list.component').then(
            (m) => m.BaseDocumentListComponent,
          ),
      },
    ],
  },
];
