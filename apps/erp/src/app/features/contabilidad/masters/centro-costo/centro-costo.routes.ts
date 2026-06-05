import type { Route } from '@angular/router';

export const CENTRO_COSTO_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/centros-costo-list/centros-costo-list.component').then(
        (m) => m.CentrosCostoListComponent,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/centro-costo-form/centro-costo-form.component').then(
        (m) => m.CentroCostoFormComponent,
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/centro-costo-form/centro-costo-form.component').then(
        (m) => m.CentroCostoFormComponent,
      ),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/centro-costo-detail/centro-costo-detail.component').then(
        (m) => m.CentroCostoDetailComponent,
      ),
  },
];
