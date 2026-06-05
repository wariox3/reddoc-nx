import type { Route } from '@angular/router';
import { activeDocumentResolver } from '@erp/core/module-config';

/**
 * Rutas de **Contrato servicio** (documento de venta).
 *
 * Expone `list`, `nuevo` y `editar/:id`. El
 * `activeDocumentResolver('contrato-servicio')` deja la config en
 * `ModuleNavigationStore` (y la inyecta como `document` por herencia a los
 * hijos) antes de montar cualquier página — el módulo padre (`venta.routes.ts`)
 * ya cargó `VENTA_CONFIG`. La lista usa el `BaseDocumentListComponent`; el alta
 * y la edición comparten el `ContratoServicioFormComponent` (con/sin `:id`).
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
      {
        path: 'nuevo',
        loadComponent: () =>
          import('./pages/contrato-servicio-form/contrato-servicio-form.component').then(
            (m) => m.ContratoServicioFormComponent,
          ),
      },
      {
        path: 'editar/:id',
        loadComponent: () =>
          import('./pages/contrato-servicio-form/contrato-servicio-form.component').then(
            (m) => m.ContratoServicioFormComponent,
          ),
      },
    ],
  },
];
