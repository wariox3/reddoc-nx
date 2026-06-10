import type { Route } from '@angular/router';

export const CONTRATO_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/contratos-list/contratos-list.component').then(
        (m) => m.ContratosListComponent,
      ),
  },
];
